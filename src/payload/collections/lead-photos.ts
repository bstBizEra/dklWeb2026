import path from "node:path";

import type { CollectionConfig } from "payload";

import { isOwner, isOwnerOrAdvisor, never } from "../access";

// Photos customers attach to the service, parts and warehouse forms. Customer data, like the leads they belong
// to: visitors never read or write here through the REST API. The forms' routes check and re-encode each
// photo (lib/leads/photos.ts) and save it with the server-side local API. Payload applies the read rule below
// when it serves a stored file too (isReadingStaticFile), so a photo link opens for signed-in owners and
// advisors only. The files live outside public/, in LEAD_PHOTOS_DIR or data/cms-lead-photos; back that folder
// up with the database.
export const LeadPhotos: CollectionConfig = {
  slug: "lead-photos",
  admin: { useAsTitle: "filename", defaultColumns: ["filename", "lead", "createdAt"], group: "Leads" },
  access: { create: never, read: isOwnerOrAdvisor, update: never, delete: isOwner },
  upload: {
    staticDir: process.env.LEAD_PHOTOS_DIR?.trim() || path.resolve(process.cwd(), "data", "cms-lead-photos"),
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
    pasteURL: false,
    modifyResponseHeaders: ({ headers }) => {
      headers.set("X-Content-Type-Options", "nosniff");
      headers.set("Cache-Control", "private, no-store");
      return headers;
    },
  },
  fields: [{ name: "lead", type: "relationship", relationTo: "leads", required: true, index: true }],
};
