import { receiveLead } from "@/lib/leads/intake";
import { salesInquirySchema, salesToLead } from "@/lib/validation/sales";

export const runtime = "nodejs";

// The forklift sales page's inquiry form. The shared pipeline (limit, size cap, honeypot, save,
// notify) is lib/leads/intake.ts; this route only turns the inquiry into a lead.
export function POST(request: Request) {
  return receiveLead(request, (body) => {
    const parsed = salesInquirySchema.safeParse(body);
    return parsed.success ? { success: true, data: salesToLead(parsed.data) } : { success: false, issues: parsed.error.issues };
  });
}
