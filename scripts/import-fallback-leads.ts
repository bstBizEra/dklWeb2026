// Imports leads that were saved to data/leads-local.jsonl while the database was unavailable into the CMS
// "leads" collection, then the photos waiting in data/lead-photos/. Run on the server, in the app folder,
// with the site's settings loaded:
//   pnpm cms:import-fallback-leads                                        (reads data/leads-local.jsonl)
//   FALLBACK_LEADS_FILE=/path/to/copy.jsonl pnpm cms:import-fallback-leads  (reads another copy)
// It keeps each lead's reference (leadId), skips leads and photos already in the CMS, and never edits or
// deletes the file or the photo folders. Photos are imported for every lead in the CMS, not only the ones in
// the file: a lead can reach the CMS while its photos did not (alert lead.photos_not_in_cms). After a clean
// run (no failures, no invalid lines, no photos waiting for a lead), archive the file and data/lead-photos/
// outside the app folder.
import { readFile } from "node:fs/promises";
import path from "node:path";

import { getPayload } from "payload";

import config from "../src/payload.config";
import { importFallbackLeads, parseFallbackFile } from "../src/lib/leads/import-fallback";
import { localLeadFile } from "../src/lib/leads/local-store";
import { importPendingPhotos } from "../src/lib/leads/photo-store";
import { leadDocData } from "../src/lib/leads/store";

const file = path.resolve(process.env.FALLBACK_LEADS_FILE?.trim() || localLeadFile);

let text = "";
try {
  text = await readFile(file, "utf8");
} catch {
  console.log(`[import] no fallback file at ${file}: no leads to import, checking photos`);
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

const photos = await importPendingPhotos({
  create: (upload) => payload.create({ collection: "lead-photos", overrideAccess: true, data: { lead: upload.lead }, file: upload.file }),
  findLead: async (leadId) => {
    const found = await payload.find({ collection: "leads", where: { leadId: { equals: leadId } }, limit: 1, depth: 0, overrideAccess: true });
    return (found.docs[0]?.id as number | undefined) ?? null;
  },
  photoExists: async (name) =>
    (await payload.count({ collection: "lead-photos", where: { filename: { equals: name } }, overrideAccess: true })).totalDocs > 0,
});

// Only references and counts are printed, never customer details.
console.log(`[import] ${file}`);
console.log(`[import] imported: ${summary.imported.length}${summary.imported.length ? ` (${summary.imported.join(", ")})` : ""}`);
console.log(`[import] already in the CMS: ${summary.alreadyInCms.length}`);
if (summary.failed.length) console.log(`[import] FAILED: ${summary.failed.length} (${summary.failed.join(", ")})`);
if (invalidLines.length) console.log(`[import] invalid lines, not imported: ${invalidLines.join(", ")}`);
console.log(`[import] photos imported: ${photos.imported.length}, already in the CMS: ${photos.alreadyInCms}`);
if (photos.leadsNotInCms.length) console.log(`[import] photos waiting for a lead not in the CMS: ${photos.leadsNotInCms.join(", ")}`);
const clean = summary.failed.length === 0 && invalidLines.length === 0 && photos.leadsNotInCms.length === 0;
console.log(clean ? "[import] done: the file and data/lead-photos/ can now be archived outside the app folder" : "[import] check the lines above before archiving");
process.exit(clean ? 0 : 1);
