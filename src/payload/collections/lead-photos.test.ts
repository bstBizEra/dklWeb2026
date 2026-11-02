/**
 * The staff-only collection for photos attached to leads. Visitors never read or write it: the forms' routes
 * save with the server-side local API, only owners and advisors (the roles that see leads) can open a photo,
 * Payload applies that same read rule when it serves the file itself, and the files live outside public/.
 */
import path from "node:path";

import type { Access } from "payload";
import { describe, expect, it, vi } from "vitest";

import { Leads } from "./leads";
import { LeadPhotos } from "./lead-photos";

const can = (access: Access | undefined, role?: string, extra: object = {}) =>
  access ? access({ req: { user: role ? { id: 1, role } : null }, ...extra } as never) : undefined;

describe("lead-photos collection", () => {
  it("lets only owners and advisors open a photo, including the stored file itself", () => {
    expect(can(LeadPhotos.access?.read, "owner")).toBe(true);
    expect(can(LeadPhotos.access?.read, "advisor")).toBe(true);
    expect(can(LeadPhotos.access?.read, "editor")).toBe(false);
    expect(can(LeadPhotos.access?.read)).toBe(false);
    expect(can(LeadPhotos.access?.read, undefined, { isReadingStaticFile: true })).toBe(false);
  });

  it("is never written through the REST API; only owners delete", () => {
    expect(can(LeadPhotos.access?.create, "owner")).toBe(false);
    expect(can(LeadPhotos.access?.update, "owner")).toBe(false);
    expect(can(LeadPhotos.access?.delete, "advisor")).toBe(false);
    expect(can(LeadPhotos.access?.delete, "owner")).toBe(true);
  });

  it("stores JPEG, PNG and WebP only, outside the public folder, with no fetching from pasted URLs", () => {
    const upload = LeadPhotos.upload;
    expect(upload && typeof upload === "object").toBe(true);
    if (!upload || typeof upload !== "object") return;
    expect(upload.mimeTypes).toEqual(["image/jpeg", "image/png", "image/webp"]);
    expect(upload.pasteURL).toBe(false);
    expect(path.resolve(upload.staticDir ?? "").split(path.sep)).not.toContain("public");
  });

  it("serves files with no type sniffing and no shared caching", () => {
    const upload = LeadPhotos.upload;
    if (!upload || typeof upload !== "object" || !upload.modifyResponseHeaders) throw new Error("modifyResponseHeaders missing");
    const headers = upload.modifyResponseHeaders({ headers: new Headers({ "Content-Type": "image/jpeg" }) }) as Headers;
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("Cache-Control")).toBe("private, no-store");
  });

  it("deletes a lead's photos, files included, before the lead itself", async () => {
    const remove = vi.fn(async () => ({}));
    const hook = Leads.hooks?.beforeDelete?.[0];
    if (!hook) throw new Error("beforeDelete hook missing");

    await hook({ id: 9, req: { payload: { delete: remove } } } as never);

    expect(remove).toHaveBeenCalledWith(expect.objectContaining({ collection: "lead-photos", where: { lead: { equals: 9 } }, overrideAccess: true }));
  });

  it("links each photo to its lead, and shows the photos on the lead", () => {
    expect(LeadPhotos.fields).toContainEqual(expect.objectContaining({ name: "lead", type: "relationship", relationTo: "leads", required: true }));
    expect(Leads.fields).toContainEqual(
      expect.objectContaining({ name: "photos", type: "join", collection: "lead-photos", on: "lead", admin: expect.objectContaining({ allowCreate: false }) }),
    );
  });
});
