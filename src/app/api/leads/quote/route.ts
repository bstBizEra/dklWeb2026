import { withoutHoneypot } from "@/lib/leads/guard";
import { receiveLead } from "@/lib/leads/intake";
import { quoteRequestSchema } from "@/lib/validation/leads";

export const runtime = "nodejs";

// The quote form. The shared pipeline (limit, size cap, honeypot, save, notify) is lib/leads/intake.ts.
export function POST(request: Request) {
  return receiveLead(request, (body) => {
    const parsed = quoteRequestSchema.safeParse(body);
    // Any status or time the visitor sent is replaced in receiveLead.
    return parsed.success ? { success: true, data: withoutHoneypot(parsed.data) } : { success: false, issues: parsed.error.issues };
  });
}
