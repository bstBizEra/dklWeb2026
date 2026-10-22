import type { CollectionConfig, Field } from "payload";

import { noConfirmMarker } from "../../lib/data/confirm";
import { getRoute } from "../../lib/data/routes";
import { factKeys } from "../../lib/data/site-facts";
import { isOwner, isOwnerOrEditor, publishedOrStaff } from "../access";

const text = (name: string, extra: Partial<Field> = {}): Field =>
  ({ name, type: "text", validate: noConfirmMarker, ...extra }) as Field;
const area = (name: string, extra: Partial<Field> = {}): Field =>
  ({ name, type: "textarea", validate: noConfirmMarker, ...extra }) as Field;

const knownRoute = (value: unknown): true | string =>
  !value || (typeof value === "string" && getRoute(value)) ? true : "Unknown route id. Use an id from the route registry.";

const link = (name: string, label: string): Field => ({
  name,
  label,
  type: "group",
  fields: [text("label"), text("href")],
});

// One row per public page, shaped like the built-in PageContent so the site can swap sources.
// Facts are bound, not typed: an item bound to an empty fact stays hidden, so nothing unconfirmed is published.
export const Pages: CollectionConfig = {
  slug: "pages",
  labels: { singular: "Page", plural: "Pages" },
  admin: { useAsTitle: "h1", defaultColumns: ["h1", "routeId", "_status", "updatedAt"], group: "Content" },
  versions: { drafts: true, maxPerDoc: 25 },
  access: {
    create: isOwnerOrEditor,
    read: publishedOrStaff,
    update: isOwnerOrEditor,
    delete: isOwner,
  },
  fields: [
    text("routeId", {
      required: true,
      unique: true,
      index: true,
      validate: (value: unknown) => (typeof value === "string" && getRoute(value) ? true : "Use an id from the route registry, for example rental, contact or quote."),
      admin: { description: "Route registry id. It decides which URL shows this page." },
    } as Partial<Field>),
    text("metaTitle", { required: true, admin: { description: "Search title, up to 60 characters including the site suffix." } } as Partial<Field>),
    area("metaDescription", { required: true, admin: { description: "Search description, up to 155 characters." } } as Partial<Field>),
    text("eyebrow"),
    text("h1", { required: true }),
    area("intro"),
    { name: "ctas", type: "array", labels: { singular: "Button", plural: "Buttons" }, fields: [text("label", { required: true } as Partial<Field>), text("href", { required: true } as Partial<Field>)] },
    {
      name: "sections",
      type: "array",
      labels: { singular: "Section", plural: "Sections" },
      fields: [
        {
          name: "kind",
          type: "select",
          required: true,
          defaultValue: "cards",
          options: ["cards", "steps", "table", "faq"].map((value) => ({ label: value, value })),
        },
        text("title", { required: true } as Partial<Field>),
        area("intro"),
        {
          name: "items",
          type: "array",
          fields: [
            text("title", { required: true } as Partial<Field>),
            area("description", { admin: { description: "Ignored when a fact is chosen." } } as Partial<Field>),
            text("routeId", { validate: knownRoute, admin: { description: "Optional link. Shown only when that page is published." } } as Partial<Field>),
            {
              name: "fact",
              type: "select",
              options: factKeys.map((value) => ({ label: value, value })),
              admin: { description: "Take the text from Site facts. The item stays hidden until that fact is filled in." },
            },
          ],
        },
      ],
    },
    {
      name: "closing",
      type: "group",
      label: "Closing call to action",
      fields: [text("title"), area("copy"), link("primary", "Primary button"), link("secondary", "Secondary button")],
    },
  ],
};
