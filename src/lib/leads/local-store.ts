import { mkdir, appendFile } from "node:fs/promises";
import path from "node:path";

import type { QuoteRequest } from "@/lib/validation/leads";

type StoredLead = QuoteRequest & {
  leadId: string;
};

export const newLeadId = () => `DKL-${crypto.randomUUID()}`;

export const localLeadFile = path.join("data", "leads-local.jsonl");

// The file holds customer details, so it is created readable by the app's own user only.
export async function storeLocalLead(lead: QuoteRequest, leadId: string = newLeadId()): Promise<StoredLead> {
  const storedLead = {
    ...lead,
    leadId,
  };

  const file = path.join(process.cwd(), localLeadFile);
  await mkdir(path.dirname(file), { recursive: true, mode: 0o700 });
  await appendFile(file, `${JSON.stringify(storedLead)}\n`, { encoding: "utf8", mode: 0o600 });

  return storedLead;
}
