import { NextResponse } from "next/server";

import { submitPublicLead } from "@/lib/leads/submit";
import { publicQuoteRequestSchema, type ApiError, type ApiSuccess } from "@/lib/validation/leads";

export const runtime = "nodejs";

type QuoteLeadResponse = ApiSuccess<{ leadId: string; status: string }> | ApiError;

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
  let body: unknown;

  try {
    if (!request.headers.get("content-type")?.startsWith("application/json")) return validationError([{ path: ["body"], message: "Content-Type must be application/json" }]);
    if (Number(request.headers.get("content-length")) > 16_384) return validationError([{ path: ["body"], message: "Request is too large" }]);
    const reader = request.body?.getReader();
    if (!reader) return validationError([{ path: ["body"], message: "Request body is required" }]);
    const bytes = new Uint8Array(16_384);
    let length = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (length + value.length > bytes.length) {
        await reader.cancel();
        return validationError([{ path: ["body"], message: "Request is too large" }]);
      }
      bytes.set(value, length);
      length += value.length;
    }
    body = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes.subarray(0, length)));
  } catch {
    return validationError([{ path: ["body"], message: "Request body must be valid JSON" }]);
  }

  const parsed = publicQuoteRequestSchema.safeParse(body);

  if (!parsed.success) {
    return validationError(parsed.error.issues);
  }

  try {
    const key = request.headers.get("idempotency-key") ?? crypto.randomUUID();
    if (!/^[A-Za-z0-9_-]{8,128}$/.test(key)) return validationError([{ path: ["Idempotency-Key"], message: "Invalid retry key" }]);
    const lead = { ...parsed.data, status: "NEW" as const, submissionTimestamp: new Date().toISOString() };
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const result = await submitPublicLead(lead, key, clientIp);

    if (result.kind === "rate_limited") {
      return NextResponse.json({ ok: false, error: { code: "RATE_LIMITED", message: "Too many requests. Please try again shortly.", details: [] } }, { status: 429, headers: { "Retry-After": "60" } });
    }
    if (result.kind === "conflict") {
      return NextResponse.json({ ok: false, error: { code: "VALIDATION_ERROR", message: "Retry key was already used for another request.", details: [] } }, { status: 409 });
    }

    return NextResponse.json({
      ok: true,
      data: {
        leadId: result.leadId,
        status: result.status,
      },
      message:
        "Thank you. Your request has been received. DK LAO will review your requirement and contact you shortly.",
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INTEGRATION_FAILED",
          message: "Your request could not be saved. Please try again or contact DK LAO directly.",
          details: [],
        },
      },
      { status: 500 },
    );
  }
}
