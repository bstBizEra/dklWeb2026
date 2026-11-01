import { receiveLead } from "@/lib/leads/intake";
import { contactInquirySchema, contactToLead } from "@/lib/validation/contact";

export const runtime = "nodejs";

// The contact page's inquiry form. The shared pipeline (limit, size cap, honeypot, save, notify) is
// lib/leads/intake.ts; this route only turns the inquiry into a lead.
export function POST(request: Request) {
  return receiveLead(request, (body) => {
    const parsed = contactInquirySchema.safeParse(body);
    return parsed.success ? { success: true, data: contactToLead(parsed.data) } : { success: false, issues: parsed.error.issues };
  });
}
