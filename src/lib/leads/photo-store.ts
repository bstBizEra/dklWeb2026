import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { CleanPhoto } from "@/lib/leads/photos";

// Saves a lead's checked photos (photos.ts) after the lead itself is saved (store.ts). A lead in the CMS gets
// its photos in the staff-only "lead-photos" collection, linked to it. A lead that is only in the local file
// (no database, or the save failed), or whose photos the CMS refused, gets them in data/lead-photos/<reference>/,
// which is not served to the public; pnpm cms:import-fallback-leads moves them into the CMS (importPendingPhotos).
// Names come from the lead reference, never from the visitor's file name.
export const localPhotoDir = path.join("data", "lead-photos");

type SavedLead = { leadId: string; recordId?: string | number; notInCms?: true };
type PhotoUpload = { lead: number; file: { data: Buffer; mimetype: string; name: string; size: number } };
type Deps = { create?: (upload: PhotoUpload) => Promise<unknown>; dir?: string };

export type PhotoStoreResult = "none" | "cms" | "local" | "local-after-cms-failure";

const folderFor = (leadId: string, dir?: string) => path.join(dir ?? path.join(process.cwd(), localPhotoDir), leadId);

export async function storeLeadPhotos(lead: SavedLead, photos: CleanPhoto[], deps: Deps = {}): Promise<PhotoStoreResult> {
  if (photos.length === 0) return "none";

  if (lead.recordId !== undefined && !lead.notInCms) {
    const create = deps.create ?? createInCms;
    try {
      for (const [index, photo] of photos.entries()) {
        await create({
          lead: Number(lead.recordId),
          file: { data: photo.data, mimetype: photo.mimeType, name: `${lead.leadId}-${index + 1}.${photo.extension}`, size: photo.size },
        });
      }
      return "cms";
    } catch {
      // Keep the photos rather than lose them. All are written; the import skips any the CMS already has.
      await writeLocal(lead.leadId, photos, deps.dir);
      return "local-after-cms-failure";
    }
  }

  await writeLocal(lead.leadId, photos, deps.dir);
  return "local";
}

// Customer photos: readable by the app's own user only, like the fallback lead file (local-store.ts).
async function writeLocal(leadId: string, photos: CleanPhoto[], dir?: string) {
  const folder = folderFor(leadId, dir);
  await mkdir(folder, { recursive: true, mode: 0o700 });
  for (const [index, photo] of photos.entries()) {
    await writeFile(path.join(folder, `${index + 1}.${photo.extension}`), photo.data, { mode: 0o600 });
  }
}

const mimeTypes: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };
const leadFolder = /^DKL-[0-9a-f-]{36}$/i;
const photoFile = /^\d+\.(jpg|png|webp)$/;

type ImportDeps = {
  dir?: string;
  create: (upload: PhotoUpload) => Promise<unknown>;
  // The lead's CMS id for a reference, or null when the lead is not in the CMS (yet).
  findLead: (leadId: string) => Promise<number | null>;
  // Whether a lead-photos row with this file name already exists.
  photoExists: (name: string) => Promise<boolean>;
};
export type PhotoImportSummary = { imported: string[]; alreadyInCms: number; leadsNotInCms: string[] };

// For pnpm cms:import-fallback-leads, after the leads themselves: every photo waiting in data/lead-photos/ is
// added to its lead in the CMS. Keyed on the folders, so it also covers leads that reached the CMS while their
// photos did not. Safe to run again: a photo whose name is already in the CMS is skipped. Folders are left in
// place, like the fallback file, for the operator to archive.
export async function importPendingPhotos(deps: ImportDeps): Promise<PhotoImportSummary> {
  const root = deps.dir ?? path.join(process.cwd(), localPhotoDir);
  const summary: PhotoImportSummary = { imported: [], alreadyInCms: 0, leadsNotInCms: [] };
  const folders = (await readdir(root).catch(() => [] as string[])).filter((name) => leadFolder.test(name)).sort();

  for (const leadId of folders) {
    const names = (await readdir(path.join(root, leadId)).catch(() => [] as string[])).filter((name) => photoFile.test(name)).sort();
    if (!names.length) continue;
    const recordId = await deps.findLead(leadId);
    if (recordId === null) {
      summary.leadsNotInCms.push(leadId);
      continue;
    }
    for (const name of names) {
      const cmsName = `${leadId}-${name}`;
      if (await deps.photoExists(cmsName)) {
        summary.alreadyInCms += 1;
        continue;
      }
      const data = await readFile(path.join(root, leadId, name));
      await deps.create({ lead: recordId, file: { data, mimetype: mimeTypes[name.split(".")[1]], name: cmsName, size: data.byteLength } });
      summary.imported.push(cmsName);
    }
  }
  return summary;
}

async function createInCms({ lead, file }: PhotoUpload) {
  const { getCms } = await import("@/lib/cms/client");
  const payload = await getCms();
  return payload.create({ collection: "lead-photos", overrideAccess: true, data: { lead }, file });
}
