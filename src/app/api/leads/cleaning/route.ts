import { receiveLead } from "@/lib/leads/intake";
import { cleaningRequestSchema, cleaningToLead } from "@/lib/validation/cleaning";

export const runtime = "nodejs";

// The cleaning equipment page's recommendation form. The shared pipeline (limit, size cap, honeypot, save,
// notify) is lib/leads/intake.ts; this route only turns the request into a lead.
export function POST(request: Request) {
  return receiveLead(request, (body) => {
    const parsed = cleaningRequestSchema.safeParse(body);
    return parsed.success ? { success: true, data: cleaningToLead(parsed.data) } : { success: false, issues: parsed.error.issues };
  });
}
