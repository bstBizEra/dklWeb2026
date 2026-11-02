import { receiveLead } from "@/lib/leads/intake";
import { rentalInquirySchema, rentalToLead } from "@/lib/validation/rental";

export const runtime = "nodejs";

// The forklift rental page's inquiry form. The shared pipeline (limit, size cap, honeypot, save,
// notify) is lib/leads/intake.ts; this route only turns the inquiry into a lead.
export function POST(request: Request) {
  return receiveLead(request, (body) => {
    const parsed = rentalInquirySchema.safeParse(body);
    return parsed.success ? { success: true, data: rentalToLead(parsed.data) } : { success: false, issues: parsed.error.issues };
  });
}
