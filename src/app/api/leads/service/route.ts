import { receiveLead } from "@/lib/leads/intake";
import { serviceBookingSchema, serviceToLead } from "@/lib/validation/service";

export const runtime = "nodejs";

// The maintenance page's service booking form. The shared pipeline (limit, size cap, honeypot, save,
// notify) is lib/leads/intake.ts; this route only turns the booking into a lead.
export function POST(request: Request) {
  return receiveLead(request, (body) => {
    const parsed = serviceBookingSchema.safeParse(body);
    return parsed.success ? { success: true, data: serviceToLead(parsed.data) } : { success: false, issues: parsed.error.issues };
  });
}
