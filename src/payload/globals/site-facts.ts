import type { Field, GlobalConfig } from "payload";

import { anyone, isOwner } from "../access";

// Mirrors src/lib/data/site-facts.ts. Empty means "not confirmed": the site hides anything bound to it.
const fact = (name: string, label: string, type: "text" | "textarea" | "email" = "text"): Field =>
  type === "email" ? { name, label, type: "email" } : type === "textarea" ? { name, label, type: "textarea" } : { name, label, type: "text" };

export const SiteFacts: GlobalConfig = {
  slug: "site-facts",
  label: "Site facts",
  admin: { description: "Owner-confirmed business facts. Leave a field empty until the owner confirms it." },
  access: { read: anyone, update: isOwner },
  fields: [
    fact("phone", "Phone"),
    fact("whatsapp", "WhatsApp"),
    fact("facebook", "Facebook page"),
    fact("email", "Email", "email"),
    fact("address", "Address", "textarea"),
    fact("hours", "Opening hours", "textarea"),
    fact("serviceAreas", "Service areas", "textarea"),
    fact("quoteReplyTime", "Quote reply time", "textarea"),
    fact("deliveryCoverage", "Delivery coverage", "textarea"),
    fact("maintenanceTerms", "Maintenance terms", "textarea"),
    fact("rentToBuyTerms", "Rent-to-buy terms", "textarea"),
    fact("brands", "Brands", "textarea"),
  ],
};
