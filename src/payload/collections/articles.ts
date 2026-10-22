import type { CollectionConfig } from "payload";

import { noConfirmMarker } from "../../lib/data/confirm";
import { getRoute } from "../../lib/data/routes";
import { isOwner, isOwnerOrEditor, publishedOrStaff } from "../access";

export const articleCategories = ["rental-guide", "selection-guide", "parts-guide", "maintenance-guide", "warehouse-guide", "cleaning-guide", "safety-training"];

// Knowledge-centre guides from the sitemap. Phase 2 models and stores them; public pages come with the knowledge-centre route.
export const Articles: CollectionConfig = {
  slug: "articles",
  labels: { singular: "Article", plural: "Articles" },
  admin: { useAsTitle: "title", defaultColumns: ["title", "category", "_status", "publishedAt"], group: "Content" },
  versions: { drafts: true, maxPerDoc: 25 },
  access: { create: isOwnerOrEditor, read: publishedOrStaff, update: isOwnerOrEditor, delete: isOwner },
  fields: [
    { name: "title", type: "text", required: true, validate: noConfirmMarker },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      validate: (value: unknown) =>
        typeof value === "string" && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value) ? true : "Use lowercase words joined by hyphens.",
      admin: { description: "Becomes /knowledge-center/<slug>." },
    },
    { name: "category", type: "select", required: true, options: articleCategories.map((value) => ({ label: value, value })) },
    { name: "excerpt", type: "textarea", required: true, maxLength: 300, validate: noConfirmMarker },
    { name: "body", type: "richText" },
    {
      name: "relatedRouteIds",
      label: "Related solution pages",
      type: "array",
      fields: [
        {
          name: "routeId",
          type: "text",
          required: true,
          validate: (value: unknown) => (typeof value === "string" && getRoute(value) ? true : "Unknown route id."),
        },
      ],
      admin: { description: "Solution pages this guide links to. Every guide should link to at least one." },
    },
    { name: "metaTitle", type: "text", validate: noConfirmMarker },
    { name: "metaDescription", type: "textarea", validate: noConfirmMarker },
    { name: "publishedAt", type: "date", admin: { position: "sidebar" } },
  ],
};
