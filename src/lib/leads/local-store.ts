import { mkdir, appendFile } from "node:fs/promises";
import path from "node:path";

import type { QuoteRequest } from "@/lib/validation/leads";

type StoredLead = QuoteRequest & {
  leadId: string;
};

export async function storeLocalLead(lead: QuoteRequest): Promise<StoredLead> {
  const leadId = `DKL-${crypto.randomUUID()}`;
  const storedLead = {
    ...lead,
    leadId,
  };

  const dataDir = path.join(process.cwd(), "data");
  await mkdir(dataDir, { recursive: true });
  await appendFile(
    path.join(dataDir, "leads-local.jsonl"),
    `${JSON.stringify(storedLead)}\n`,
    "utf8",
  );

  return storedLead;
}
