import type { CollectionConfig } from "payload";

import { isOwner, isOwnerOrAdvisor, never } from "../access";

const leadStatuses = ["NEW", "CONTACTED", "QUALIFYING", "QUOTATION_PREPARING", "QUOTATION_SENT", "FOLLOW_UP", "WON", "LOST", "CLOSED"];
const leadTypes = ["QUOTE_REQUEST", "RENTAL_INQUIRY", "SERVICE_BOOKING", "SPARE_PARTS_INQUIRY", "USED_FORKLIFT_INQUIRY", "CLEANING_EQUIPMENT_RECOMMENDATION", "CONTACT_GENERAL"];
const options = (list: string[]) => list.map((value) => ({ label: value, value }));

// Customer data. Public visitors never write here through the REST API: the quote form
// posts to /api/leads/quote, which validates and saves with the server-side local API.
export const Leads: CollectionConfig = {
  slug: "leads",
  admin: {
    useAsTitle: "companyName",
    defaultColumns: ["leadId", "companyName", "contactPerson", "leadType", "status", "submittedAt"],
  },
  access: { create: never, read: isOwnerOrAdvisor, update: isOwnerOrAdvisor, delete: isOwner },
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        if (operation === "create" && data && !data.leadId) return { ...data, leadId: `DKL-${crypto.randomUUID()}` };
        return data;
      },
    ],
  },
  fields: [
    { name: "leadId", type: "text", unique: true, index: true, admin: { readOnly: true } },
    { name: "leadType", type: "select", required: true, defaultValue: "QUOTE_REQUEST", options: options(leadTypes) },
    { name: "status", type: "select", required: true, defaultValue: "NEW", index: true, options: options(leadStatuses) },
    { name: "companyName", type: "text", required: true, maxLength: 120 },
    { name: "contactPerson", type: "text", required: true, maxLength: 120 },
    { name: "phone", type: "text", required: true, maxLength: 40 },
    { name: "email", type: "email" },
    { name: "equipmentOrServiceCategory", type: "text", required: true, maxLength: 120 },
    { name: "message", type: "textarea", required: true, maxLength: 1200 },
    { name: "sourcePage", type: "text", defaultValue: "/" },
    { name: "submittedAt", type: "date", admin: { date: { pickerAppearance: "dayAndTime" } } },
    { name: "internalNotes", type: "textarea", admin: { description: "Staff only. Never shown to the customer." } },
  ],
};
