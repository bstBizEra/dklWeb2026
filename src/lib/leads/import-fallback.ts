import { z } from "zod";

import { withoutHoneypot } from "@/lib/leads/guard";
import { quoteRequestSchema, type QuoteRequest } from "@/lib/validation/leads";

// Moves leads saved to data/leads-local.jsonl (while the database was unavailable) into the CMS "leads"
// collection. Safe to run more than once: a lead whose leadId is already in the CMS is left alone. The file
// itself is never changed or deleted here; the operator archives it after checking the summary.

export type FallbackLead = { leadId: string; lead: QuoteRequest };
export type ParsedFallbackFile = { leads: FallbackLead[]; invalidLines: number[] };

const leadIdSchema = z.string().regex(/^DKL-[0-9a-f-]{36}$/i);

export function parseFallbackFile(text: string): ParsedFallbackFile {
  const leads: FallbackLead[] = [];
  const invalidLines: number[] = [];
  const seen = new Set<string>();

  text.split("\n").forEach((line, index) => {
    if (!line.trim()) return;
    let raw: unknown;
    try {
      raw = JSON.parse(line);
    } catch {
      invalidLines.push(index + 1);
      return;
    }
    const leadId = leadIdSchema.safeParse((raw as { leadId?: unknown } | null)?.leadId);
    const lead = quoteRequestSchema.safeParse(raw);
    if (!leadId.success || !lead.success) {
      invalidLines.push(index + 1);
      return;
    }
    // A line written twice is imported once.
    if (seen.has(leadId.data)) return;
    seen.add(leadId.data);
    leads.push({ leadId: leadId.data, lead: withoutHoneypot(lead.data) as QuoteRequest });
  });

  return { leads, invalidLines };
}

export type ImportTarget = {
  exists: (leadId: string) => Promise<boolean>;
  create: (entry: FallbackLead) => Promise<void>;
};

export type ImportSummary = { imported: string[]; alreadyInCms: string[]; failed: string[] };

// One lead at a time, so a failure is reported per lead and never stops the rest.
export async function importFallbackLeads(leads: FallbackLead[], target: ImportTarget): Promise<ImportSummary> {
  const summary: ImportSummary = { imported: [], alreadyInCms: [], failed: [] };

  for (const entry of leads) {
    try {
      if (await target.exists(entry.leadId)) {
        summary.alreadyInCms.push(entry.leadId);
        continue;
      }
      await target.create(entry);
      summary.imported.push(entry.leadId);
    } catch {
      summary.failed.push(entry.leadId);
    }
  }

  return summary;
}
