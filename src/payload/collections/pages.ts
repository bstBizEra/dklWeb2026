import type { CollectionConfig, Field } from "payload";

import { noConfirmMarker } from "../../lib/data/confirm";
import { getRoute } from "../../lib/data/routes";
import { sectionKinds } from "../../lib/data/pages";
import { factKeys } from "../../lib/data/site-facts";
import { isOwner, isOwnerOrEditor, publishedOrStaff } from "../access";

const text = (name: string, extra: Partial<Field> = {}): Field =>
  ({ name, type: "text", validate: noConfirmMarker, ...extra }) as Field;
const area = (name: string, extra: Partial<Field> = {}): Field =>
  ({ name, type: "textarea", validate: noConfirmMarker, localized: true, ...extra }) as Field;
// Visible text: one value per locale (English and Lao). Ids, links, kinds and facts are shared.
const words = (name: string, extra: Partial<Field> = {}): Field => text(name, { localized: true, ...extra } as Partial<Field>);

const knownRoute = (value: unknown): true | string =>
  !value || (typeof value === "string" && getRoute(value)) ? true : "Unknown route id. Use an id from the route registry.";

const link = (name: string, label: string): Field => ({
  name,
  label,
  type: "group",
  fields: [words("label"), text("href")],
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
    words("metaTitle", { required: true, admin: { description: "Search title, up to 60 characters including the site suffix." } } as Partial<Field>),
    area("metaDescription", { required: true, admin: { description: "Search description, up to 155 characters." } } as Partial<Field>),
    words("eyebrow"),
    words("h1", { required: true } as Partial<Field>),
    area("intro"),
    { name: "ctas", type: "array", labels: { singular: "Button", plural: "Buttons" }, fields: [words("label", { required: true } as Partial<Field>), text("href", { required: true } as Partial<Field>)] },
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
          options: sectionKinds.map((value) => ({ label: value, value })),
          admin: { description: "How the section looks: cards, steps, table, faq, list, stats, chips, text or form." },
        },
        words("title", { required: true } as Partial<Field>),
        area("intro"),
        area("body", { admin: { description: "Paragraph for text sections.", condition: (_data: unknown, siblingData: { kind?: string }) => siblingData?.kind === "text" } } as Partial<Field>),
        {
          name: "needsConfirmation",
          type: "checkbox",
          defaultValue: false,
          admin: { description: "Draft wording the owner has not confirmed. The whole section stays hidden on the site until this is unticked." },
        },
        {
          name: "items",
          type: "array",
          fields: [
            words("title", { required: true } as Partial<Field>),
            area("description", { admin: { description: "Ignored when a fact is chosen." } } as Partial<Field>),
            text("routeId", { validate: knownRoute, admin: { description: "Optional link. Shown only when that page is published." } } as Partial<Field>),
            {
              name: "needsConfirmation",
              type: "checkbox",
              defaultValue: false,
              admin: { description: "Draft wording the owner has not confirmed. Hidden on the site until this is unticked." },
            },
            {
              name: "fact",
              type: "select",
              options: factKeys.map((value) => ({ label: value, value })),
              admin: { description: "Take the text from Site facts. The item stays hidden until that fact is filled in." },
            },
            {
              name: "details",
              type: "group",
              label: "Card section (Read more)",
              admin: {
                description:
                  "Cards only. An opening paragraph and at least two topics give this card a \"Read more\" link and its own section under the cards. Leave it empty for no section.",
                condition: (data: unknown, _siblingData: unknown, context: { path?: string | (string | number)[] } = {}) => {
                  // Show only inside card sections. The path ("sections.2.items.0.details" or its array form)
                  // names the section; without one, show the fields rather than hide them.
                  const parts = Array.isArray(context.path) ? context.path : String(context.path ?? "").split(".");
                  const index = parts[0] === "sections" ? Number(parts[1]) : NaN;
                  const sections = (data as { sections?: { kind?: string }[] })?.sections;
                  return Number.isInteger(index) ? sections?.[index]?.kind === "cards" : true;
                },
              },
              fields: [
                area("lead", { label: "Opening paragraph", admin: { description: "Two or three sentences that introduce the service." } } as Partial<Field>),
                {
                  name: "facts",
                  type: "array",
                  label: "Key figures",
                  maxRows: 3,
                  labels: { singular: "Figure", plural: "Figures" },
                  admin: { description: "Optional. Only figures you can back up, for example \"200–250 h\" with \"typical service interval\"." },
                  fields: [words("value", { required: true } as Partial<Field>), words("label", { required: true } as Partial<Field>)],
                },
                {
                  name: "topics",
                  type: "array",
                  labels: { singular: "Topic", plural: "Topics" },
                  admin: { description: "Two or more. Give each its own heading, written for this service." },
                  fields: [words("heading", { required: true } as Partial<Field>), area("body", { required: true } as Partial<Field>)],
                },
                words("checklistHeading", { label: "Checklist heading", admin: { description: "Optional, for example \"Signs it is time for a service\"." } } as Partial<Field>),
                {
                  name: "checklist",
                  type: "array",
                  labels: { singular: "Point", plural: "Points" },
                  fields: [words("point", { required: true } as Partial<Field>)],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "closing",
      type: "group",
      label: "Closing call to action",
      fields: [words("title"), area("copy"), link("primary", "Primary button"), link("secondary", "Secondary button")],
    },
  ],
};
