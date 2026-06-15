import { NextResponse } from "next/server";

import { storeLocalLead } from "@/lib/leads/local-store";
import { quoteRequestSchema, type ApiError, type ApiSuccess } from "@/lib/validation/leads";

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
    body = await request.json();
  } catch {
    return validationError([{ path: ["body"], message: "Request body must be valid JSON" }]);
  }

  const parsed = quoteRequestSchema.safeParse(body);

  if (!parsed.success) {
    return validationError(parsed.error.issues);
  }

  try {
    const storedLead = await storeLocalLead(parsed.data);

    return NextResponse.json({
      ok: true,
      data: {
        leadId: storedLead.leadId,
        status: storedLead.status,
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
