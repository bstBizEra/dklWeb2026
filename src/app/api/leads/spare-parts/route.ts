import { receiveLead } from "@/lib/leads/intake";
import { partsRequestSchema, partsToLead } from "@/lib/validation/parts";

export const runtime = "nodejs";

// The spare parts page's request form. The shared pipeline (limit, size cap, honeypot, save,
// notify) is lib/leads/intake.ts; this route only turns the request into a lead.
export function POST(request: Request) {
  return receiveLead(request, (body) => {
    const parsed = partsRequestSchema.safeParse(body);
    return parsed.success ? { success: true, data: partsToLead(parsed.data) } : { success: false, issues: parsed.error.issues };
  });
}
