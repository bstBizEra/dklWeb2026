/**
 * Where checked photos go once their lead is saved: to the staff-only "lead-photos" CMS collection, linked to
 * the lead, when the lead is in the CMS; otherwise to data/lead-photos/<reference>/ beside the fallback file,
 * outside the public folder, for the fallback import to move into the CMS later. Names come from the lead
 * reference, never from the visitor.
 */
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import type { CleanPhoto } from "./photos";
import { importPendingPhotos, localPhotoDir, storeLeadPhotos } from "./photo-store";

const photo = (extension: CleanPhoto["extension"], text: string): CleanPhoto => ({
  data: Buffer.from(text),
  mimeType: extension === "jpg" ? "image/jpeg" : extension === "png" ? "image/png" : "image/webp",
  extension,
  size: text.length,
});

const leadId = "DKL-11111111-2222-3333-4444-555555555555";
let dir = "";

afterEach(async () => {
  if (dir) await rm(dir, { recursive: true, force: true });
  dir = "";
});

describe("storeLeadPhotos", () => {
  it("adds each photo to the lead-photos collection, linked to the lead, when the lead is in the CMS", async () => {
    const create = vi.fn(async () => ({}));

    const where = await storeLeadPhotos({ leadId, recordId: 42 }, [photo("jpg", "a"), photo("webp", "b")], { create });

    expect(where).toBe("cms");
    expect(create).toHaveBeenCalledTimes(2);
    expect(create).toHaveBeenNthCalledWith(1, { lead: 42, file: { data: Buffer.from("a"), mimetype: "image/jpeg", name: `${leadId}-1.jpg`, size: 1 } });
    expect(create).toHaveBeenNthCalledWith(2, expect.objectContaining({ file: expect.objectContaining({ name: `${leadId}-2.webp` }) }));
  });

  it("writes the photos to a private folder named after the lead when the lead is only in the local file", async () => {
    dir = await mkdtemp(path.join(tmpdir(), "lead-photos-"));
    const create = vi.fn();

    const where = await storeLeadPhotos({ leadId, notInCms: true, recordId: undefined }, [photo("png", "p")], { create, dir });

    expect(where).toBe("local");
    expect(create).not.toHaveBeenCalled();
    expect(await readdir(path.join(dir, leadId))).toEqual(["1.png"]);
    expect(await readFile(path.join(dir, leadId, "1.png"), "utf8")).toBe("p");
  });

  it("saves nothing when there are no photos", async () => {
    const create = vi.fn();
    expect(await storeLeadPhotos({ leadId, recordId: 1 }, [], { create })).toBe("none");
    expect(create).not.toHaveBeenCalled();
  });

  it("keeps the local folder under data/, which is not served to the public", () => {
    expect(localPhotoDir.split(path.sep)[0]).toBe("data");
  });

  it("keeps every photo in the private folder when the CMS refuses one, instead of losing them", async () => {
    dir = await mkdtemp(path.join(tmpdir(), "lead-photos-"));
    const create = vi.fn().mockResolvedValueOnce({}).mockRejectedValueOnce(new Error("disk full"));

    const where = await storeLeadPhotos({ leadId, recordId: 42 }, [photo("jpg", "a"), photo("jpg", "b")], { create, dir });

    expect(where).toBe("local-after-cms-failure");
    expect(await readdir(path.join(dir, leadId))).toEqual(["1.jpg", "2.jpg"]);
  });
});

// pnpm cms:import-fallback-leads moves photos from data/lead-photos/<reference>/ into the CMS: for a lead
// imported from the fallback file, and for a lead that reached the CMS while its photos did not (a CMS photo
// failure, or a database save that timed out but finished later). Keyed on the folder, not on the fallback
// file, and a photo already in the CMS is skipped, so a re-run is safe.
describe("importPendingPhotos", () => {
  const other = "DKL-99999999-8888-7777-6666-555555555555";

  it("adds each waiting photo to its lead in the CMS, skips photos already there and leads not in the CMS", async () => {
    dir = await mkdtemp(path.join(tmpdir(), "lead-photos-"));
    await storeLeadPhotos({ leadId, notInCms: true }, [photo("jpg", "a"), photo("png", "b")], { dir });
    await storeLeadPhotos({ leadId: other, notInCms: true }, [photo("webp", "c")], { dir });
    const create = vi.fn(async () => ({}));

    const summary = await importPendingPhotos({
      dir,
      create,
      findLead: async (id) => (id === leadId ? 7 : null),
      photoExists: async (name) => name === `${leadId}-1.jpg`,
    });

    expect(summary).toEqual({ imported: [`${leadId}-2.png`], alreadyInCms: 1, leadsNotInCms: [other] });
    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith({ lead: 7, file: { data: Buffer.from("b"), mimetype: "image/png", name: `${leadId}-2.png`, size: 1 } });
  });

  it("ignores anything in the folder that is not a lead's photo folder or photo file", async () => {
    dir = await mkdtemp(path.join(tmpdir(), "lead-photos-"));
    await mkdir(path.join(dir, "notes"));
    await storeLeadPhotos({ leadId, notInCms: true }, [photo("jpg", "a")], { dir });
    await writeFile(path.join(dir, leadId, "readme.txt"), "x");
    const create = vi.fn(async () => ({}));

    const summary = await importPendingPhotos({ dir, create, findLead: async () => 7, photoExists: async () => false });

    expect(summary.imported).toEqual([`${leadId}-1.jpg`]);
  });

  it("does nothing when there is no photo folder", async () => {
    const summary = await importPendingPhotos({ dir: path.join(tmpdir(), "no-such-folder-dklao"), create: vi.fn(), findLead: vi.fn(), photoExists: vi.fn() });
    expect(summary).toEqual({ imported: [], alreadyInCms: 0, leadsNotInCms: [] });
  });
});

