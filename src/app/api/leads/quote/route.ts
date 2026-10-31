import { NextResponse } from "next/server";

import { emailNewLead } from "@/lib/leads/email";
import { isBotSubmission, limiterFor, maxBodyBytes, withoutHoneypot } from "@/lib/leads/guard";
import { notifyNewLead } from "@/lib/leads/notify";
import { clientKey } from "@/lib/leads/rate-limit";
import { storeLead } from "@/lib/leads/store";
import { quoteRequestSchema, type ApiError, type ApiSuccess } from "@/lib/validation/leads";

export const runtime = "nodejs";

type QuoteLeadResponse = ApiSuccess<{ leadId: string; status: string }> | ApiError;

const thanks =
  "Thank you. Your request has been received. DK LAO will review your requirement and contact you shortly.";

function validationError(details: unknown[]): NextResponse<QuoteLeadResponse> {
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

export async function POST(request: Request): Promise<NextResponse<QuoteLeadResponse>> {
  // 1. Per-address limit first, so a flood is stopped before any work is done. Requests without a usable
  // address share one larger budget instead of the per-address one (see limiterFor).
  const key = clientKey(request);
  const limit = limiterFor(key).check(key);

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

  // 2. Read the body with a size cap.
  const raw = await request.text();

  if (raw.length > maxBodyBytes) {
    return validationError([{ path: ["body"], message: "Request is too large" }]);
  }

  let body: unknown;

  try {
    body = JSON.parse(raw);
  } catch {
    return validationError([{ path: ["body"], message: "Request body must be valid JSON" }]);
  }

  // 3. Honeypot: a filled hidden field means a bot. It gets the normal thank-you and nothing is saved.
  if (isBotSubmission(body)) {
    return NextResponse.json({ ok: true, data: { leadId: "DKL-received", status: "NEW" }, message: thanks });
  }

  const parsed = quoteRequestSchema.safeParse(body);

  if (!parsed.success) {
    return validationError(parsed.error.issues);
  }

  // 4. Save, then tell the team by email (info@dklao.com) and webhook. The visitor's request counts as
  // received when it was saved or at least one notification reached DK LAO; only when all fail is it
  // refused, so the visitor knows to call instead.
  const lead = withoutHoneypot(parsed.data);
  const stored = await storeLead(lead).catch(() => null);
  const notifiable = stored ?? { ...lead, leadId: `DKL-${crypto.randomUUID()}` };
  const [emailed, notified] = await Promise.all([emailNewLead(notifiable), notifyNewLead(notifiable)]);

  if (!stored && emailed !== "sent" && notified !== "sent") {
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

  return NextResponse.json({
    ok: true,
    data: {
      leadId: notifiable.leadId,
      status: notifiable.status,
    },
    message: thanks,
  });
}
