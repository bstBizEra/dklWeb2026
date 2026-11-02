import { receiveLead } from "@/lib/leads/intake";
import { warehouseInquirySchema, warehouseToLead } from "@/lib/validation/warehouse";

export const runtime = "nodejs";

// The warehouse page's inquiry form. The shared pipeline (limit, size cap, honeypot, save,
// notify) is lib/leads/intake.ts; this route only turns the inquiry into a lead.
export function POST(request: Request) {
  return receiveLead(request, (body) => {
    const parsed = warehouseInquirySchema.safeParse(body);
    return parsed.success ? { success: true, data: warehouseToLead(parsed.data) } : { success: false, issues: parsed.error.issues };
  }, { photos: true });
}
