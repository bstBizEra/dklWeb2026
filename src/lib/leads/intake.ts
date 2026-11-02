// The one pipeline every public lead form runs through (quote, contact, and the forms that follow): per-address
// limit, size cap, honeypot, the form's own validation, then save and notify. Each form's route only says how
// its body becomes a lead. Forms that take photos (service, parts, warehouse) may send multipart/form-data:
// the lead as JSON in a "lead" field and up to two files in "photos", checked and re-encoded in photos.ts.
import { NextResponse } from "next/server";

import { readLimitedBytes, readLimitedText } from "@/lib/http/read-body";
import { emailNewLead } from "@/lib/leads/email";
import { checkLeadLimit, isBotSubmission, maxBodyBytes } from "@/lib/leads/guard";
import { notifyNewLead } from "@/lib/leads/notify";
import { storeLeadPhotos } from "@/lib/leads/photo-store";
import { checkPhotos, maxMultipartBytes, maxPhotoBytes, maxPhotos, photoNote } from "@/lib/leads/photos";
import { clientKey } from "@/lib/leads/rate-limit";
import { storeLead } from "@/lib/leads/store";
import { raiseAlert } from "@/lib/ops/alert";
import type { ApiError, ApiSuccess, QuoteRequest } from "@/lib/validation/leads";

export type LeadResponse = ApiSuccess<{ leadId: string; status: string }> | ApiError;

// A lead as the form sends it: status and time are set here, never by the visitor.
export type LeadInput = Omit<QuoteRequest, "status" | "submissionTimestamp" | "homepageUrl">;
export type LeadParse = (body: unknown) => { success: true; data: LeadInput } | { success: false; issues: unknown[] };
export type LeadOptions = { photos?: boolean };

// The reason code lets the form show the message in the visitor's language.
const photoErrors = {
  "too-many": `Attach at most ${maxPhotos} photos.`,
  "too-large": `Each photo must be ${maxPhotoBytes / 1024 / 1024} MB or smaller.`,
  "wrong-type": "Attach JPEG, PNG or WebP photos only.",
} as const;

const thanks =
  "Thank you. Your request has been received. DK LAO will review your requirement and contact you shortly.";

function validationError(details: unknown[]): NextResponse<LeadResponse> {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request",
        details,
      },
    },
    { status: 400 },
  );
}

export async function receiveLead(request: Request, parse: LeadParse, options: LeadOptions = {}): Promise<NextResponse<LeadResponse>> {
  // 1. Per-address limit first, so a flood is stopped before any work is done. Counted in the database when
  // there is one (shared by every server process), else in memory. Requests without a usable address share
  // one larger budget instead of the per-address one (see checkLeadLimit). All lead forms share one count.
  const limit = await checkLeadLimit(clientKey(request));

  if (!limit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "RATE_LIMITED",
          message: "Too many requests from your connection. Please wait a few minutes and try again, or contact DK LAO directly.",
          details: [],
        },
      },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  // 2. Read the body with a size cap in bytes, stopping as soon as it is passed (lib/http/read-body.ts).
  const read = await readLeadBody(request, options.photos === true);

  if (!read.ok) {
    return validationError([{ path: ["body"], message: read.message }]);
  }

  const { body, files } = read;

  // 3. Honeypot: a filled hidden field means a bot. It gets the normal thank-you and nothing is saved.
  if (isBotSubmission(body)) {
    return NextResponse.json({ ok: true, data: { leadId: "DKL-received", status: "NEW" }, message: thanks });
  }

  const parsed = parse(body);

  if (!parsed.success) {
    return validationError(parsed.issues);
  }

  // Photos are checked only for a request that is otherwise valid: decoding them is the costly step.
  const checked = await checkPhotos(files);

  if (!checked.ok) {
    return validationError([{ path: ["photos"], code: checked.reason, message: photoErrors[checked.reason] }]);
  }

  const note = photoNote(checked.photos.length);

  // 4. Save, then tell the team by email (info@dklao.com) and webhook. The visitor's request counts as
  // received when it was saved or at least one notification reached DK LAO; only when all fail is it
  // refused, so the visitor knows to call instead.
  // Status and time are the server's: a visitor must not file a lead as WON or back-date it past triage.
  const message = note ? `${parsed.data.message}\n${note}` : parsed.data.message;
  const lead: QuoteRequest = { ...parsed.data, message, status: "NEW", submissionTimestamp: new Date().toISOString() };
  const stored = await storeLead(lead).catch(() => null);

  // Photos follow the saved lead. A photo failure never loses the lead: the visitor is still answered, and
  // whoever runs the site is told, since the message says photos were attached. Photos the CMS refused are
  // kept on disk for pnpm cms:import-fallback-leads.
  if (checked.photos.length) {
    const saved = stored ? await storeLeadPhotos(stored, checked.photos).catch(() => null) : null;
    if (!saved) void raiseAlert("lead.photos_failed", { leadId: stored?.leadId });
    else if (saved === "local-after-cms-failure") void raiseAlert("lead.photos_not_in_cms", { leadId: stored?.leadId });
  }
  const notifiable = stored ?? { ...lead, leadId: `DKL-${crypto.randomUUID()}` };
  const [emailed, notified] = await Promise.all([emailNewLead(notifiable), notifyNewLead(notifiable)]);

  // Tell whoever runs the site when a path failed (lib/ops/alert.ts). Not awaited: the visitor's answer
  // never waits for an alert, and alerts never throw.
  if (stored?.notInCms) void raiseAlert("lead.not_in_cms", { leadId: stored.leadId });

  if (!stored && emailed !== "sent" && notified !== "sent") {
    void raiseAlert("lead.all_failed", { leadId: notifiable.leadId });
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INTEGRATION_FAILED",
          message: "Your request could not be sent. Please try again, or call or WhatsApp DK LAO.",
          details: [],
        },
      },
      { status: 500 },
    );
  }

  if (emailed === "failed") void raiseAlert("lead.email_failed", { leadId: notifiable.leadId });
  if (notified === "failed") void raiseAlert("lead.webhook_failed", { leadId: notifiable.leadId });

  return NextResponse.json({
    ok: true,
    data: {
      leadId: notifiable.leadId,
      status: notifiable.status,
    },
    message: thanks,
  });
}

type LeadBody = { ok: true; body: unknown; files: File[] } | { ok: false; message: string };

async function readLeadBody(request: Request, allowPhotos: boolean): Promise<LeadBody> {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
    const raw = await readLimitedText(request, maxBodyBytes);
    if (!raw.ok) return { ok: false, message: "Request is too large" };
    try {
      return { ok: true, body: JSON.parse(raw.text), files: [] };
    } catch {
      return { ok: false, message: "Request body must be valid JSON" };
    }
  }

  if (!allowPhotos) return { ok: false, message: "This form does not take files" };

  const raw = await readLimitedBytes(request, maxMultipartBytes);
  if (!raw.ok) return { ok: false, message: "Request is too large" };

  let form: FormData;
  try {
    form = await new Response(raw.bytes as BodyInit, { headers: { "content-type": contentType } }).formData();
  } catch {
    return { ok: false, message: "Request body must be valid form data" };
  }

  // The lead's own fields keep the JSON size cap; only the photos get the larger allowance.
  const lead = form.get("lead");
  if (typeof lead !== "string") return { ok: false, message: "Request body must include the lead" };
  if (new TextEncoder().encode(lead).byteLength > maxBodyBytes) return { ok: false, message: "Request is too large" };

  try {
    const files = form.getAll("photos").filter((value): value is File => typeof value !== "string");
    return { ok: true, body: JSON.parse(lead), files };
  } catch {
    return { ok: false, message: "Request body must be valid JSON" };
  }
}
