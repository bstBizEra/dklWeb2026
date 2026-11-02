// The forklift sales page's inquiry form (ported from feature/services-all-products, ForkliftInquiryForm).
// There is no sales lead type, so it files a QUOTE_REQUEST, as the feature branch did; extra answers are
// written into the lead's message as labelled English lines. Left out: the feature branch's brand list
// (this branch supplies brand-neutral, site-facts.ts "brands"), its power types (needsConfirmation) and its
// equipment categories; rental has its own page and form. A preferred brand is free text.
// Caps keep the longest possible message within the leads table's 1200 characters (sales.test.ts).
import { z } from "zod";

import type { LeadInput } from "@/lib/leads/intake";
import { contactMethods, contactTimelines } from "@/lib/validation/contact";
import { en, type Messages } from "@/messages/en";

// The value sent, and the English category the team sees for it.
export const salesConditionCategory = {
  NEW: "Forklift sales: new",
  USED: "Forklift sales: used",
  NOT_SURE: "Forklift sales: new or used",
} as const;
export const salesConditions = Object.keys(salesConditionCategory) as (keyof typeof salesConditionCategory)[];

export const environmentLabel = { INDOOR: "Indoor", OUTDOOR: "Outdoor", BOTH: "Indoor and outdoor" } as const;
export const environments = Object.keys(environmentLabel) as (keyof typeof environmentLabel)[];

type ValidationMessages = Messages["salesForm"]["validation"];

const optional = <T extends z.ZodType>(schema: T) => z.preprocess((value) => (value === "" ? undefined : value), schema.optional());
const optionalText = (max: number) => optional(z.string().trim().max(max));

export function salesInquirySchemaFor(m: ValidationMessages = en.salesForm.validation) {
  return z.object({
    condition: z.enum(salesConditions, m.condition),
    companyName: z.string().trim().min(2, m.companyName).max(120),
    contactPerson: z.string().trim().min(2, m.contactPerson).max(120),
    phone: z.string().trim().min(6, m.phoneMin).max(40).regex(/^[+()\d\s.-]+$/, m.phoneFormat),
    email: optional(z.email(m.email)),
    preferredContactMethod: z.enum(contactMethods, m.preferredContactMethod),
    location: z.string().trim().min(2, m.location).max(120),
    capacity: optionalText(40),
    liftHeight: optionalText(40),
    environment: z.enum(environments, m.environment),
    application: optionalText(100),
    preferredBrand: optionalText(60),
    timeline: optional(z.enum(contactTimelines)),
    budgetRange: optionalText(60),
    requirementDetail: z.string().trim().min(10, m.requirementMin).max(500, m.requirementMax),
    sourcePage: z.string().trim().min(1).max(200).default("/forklift-sales"),
    // Hidden trap field. Real visitors never fill it; the route treats a filled value as a bot.
    homepageUrl: z.string().max(200).optional(),
  });
}

export const salesInquirySchema = salesInquirySchemaFor();
export type SalesInquiryInput = z.input<typeof salesInquirySchema>;
export type SalesInquiry = z.output<typeof salesInquirySchema>;

export function salesToLead(inquiry: SalesInquiry): LeadInput {
  const lines = [
    ["Preferred contact", inquiry.preferredContactMethod],
    ["Location", inquiry.location],
    ["Capacity", inquiry.capacity],
    ["Lift height", inquiry.liftHeight],
    ["Working area", environmentLabel[inquiry.environment]],
    ["Application", inquiry.application],
    ["Preferred brand", inquiry.preferredBrand],
    ["Timeline", inquiry.timeline],
    ["Budget range", inquiry.budgetRange],
  ]
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`);

  return {
    leadType: "QUOTE_REQUEST",
    companyName: inquiry.companyName,
    contactPerson: inquiry.contactPerson,
    phone: inquiry.phone,
    email: inquiry.email,
    equipmentOrServiceCategory: salesConditionCategory[inquiry.condition],
    message: [inquiry.requirementDetail, lines.join("\n")].join("\n\n"),
    sourcePage: inquiry.sourcePage,
  };
}
