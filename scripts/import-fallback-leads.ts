// Imports leads that were saved to data/leads-local.jsonl while the database was unavailable into the CMS
// "leads" collection. Run on the server, in the app folder, with the site's settings loaded:
//   pnpm cms:import-fallback-leads                                        (reads data/leads-local.jsonl)
//   FALLBACK_LEADS_FILE=/path/to/copy.jsonl pnpm cms:import-fallback-leads  (reads another copy)
// It keeps each lead's reference (leadId), skips leads already in the CMS, and never edits or deletes the
// file. After a clean run (no failures, no invalid lines), archive the file outside the app folder.
import { readFile } from "node:fs/promises";
import path from "node:path";

import { getPayload } from "payload";

import config from "../src/payload.config";
import { importFallbackLeads, parseFallbackFile } from "../src/lib/leads/import-fallback";
import { localLeadFile } from "../src/lib/leads/local-store";
import { leadDocData } from "../src/lib/leads/store";

const file = path.resolve(process.env.FALLBACK_LEADS_FILE?.trim() || localLeadFile);

let text: string;
try {
  text = await readFile(file, "utf8");
} catch {
  console.log(`[import] no fallback file at ${file}: nothing to import`);
  process.exit(0);
}

const { leads, invalidLines } = parseFallbackFile(text);
const payload = await getPayload({ config });

const summary = await importFallbackLeads(leads, {
  exists: async (leadId) =>
    (await payload.count({ collection: "leads", where: { leadId: { equals: leadId } }, overrideAccess: true })).totalDocs > 0,
  create: async ({ leadId, lead }) => {
    await payload.create({ collection: "leads", overrideAccess: true, data: leadDocData(lead, leadId) });
  },
});

// Only references and counts are printed, never customer details.
console.log(`[import] ${file}`);
console.log(`[import] imported: ${summary.imported.length}${summary.imported.length ? ` (${summary.imported.join(", ")})` : ""}`);
console.log(`[import] already in the CMS: ${summary.alreadyInCms.length}`);
if (summary.failed.length) console.log(`[import] FAILED: ${summary.failed.length} (${summary.failed.join(", ")})`);
if (invalidLines.length) console.log(`[import] invalid lines, not imported: ${invalidLines.join(", ")}`);
const clean = summary.failed.length === 0 && invalidLines.length === 0;
console.log(clean ? "[import] done: the file can now be archived outside the app folder" : "[import] check the lines above before archiving the file");
process.exit(clean ? 0 : 1);
