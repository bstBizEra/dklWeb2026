// The contact page's inquiry form (ported from feature/services-all-products). Extra answers are written into
// the lead's message as labelled lines: no new database field, and staff see them in the CMS and the email.
// Caps keep the longest possible message within the leads table's 1200 characters (contact.test.ts).
import { z } from "zod";

import type { LeadInput } from "@/lib/leads/intake";
import { en, type Messages } from "@/messages/en";

export const contactInquiryTypes = [
  "Request Quote",
  "Forklift Rental",
  "Forklift Sales",
  "Used Forklift",
  "Maintenance Service",
  "Spare Parts Inquiry",
  "Warehouse Solutions",
  "Cleaning Equipment",
  "General Contact",
] as const;
export const contactMethods = ["Phone", "Messenger", "WhatsApp", "Email"] as const;
export const contactConditions = ["New", "Used", "Rental", "Not Sure"] as const;
export const contactTimelines = ["Immediate", "Within 1 Month", "1-3 Months", "More than 3 Months", "Not Sure"] as const;

type ValidationMessages = Messages["contactForm"]["validation"];

// "" from an empty field means "not answered".
const optional = <T extends z.ZodType>(schema: T) => z.preprocess((value) => (value === "" ? undefined : value), schema.optional());
const optionalText = (max: number) => optional(z.string().trim().max(max));

export function contactInquirySchemaFor(m: ValidationMessages = en.contactForm.validation) {
  return z.object({
    inquiryType: z.enum(contactInquiryTypes, m.inquiryType),
    companyName: z.string().trim().min(2, m.companyName).max(120),
    contactPerson: z.string().trim().min(2, m.contactPerson).max(120),
    phone: z.string().trim().min(6, m.phoneMin).max(40).regex(/^[+()\d\s.-]+$/, m.phoneFormat),
    email: optional(z.email(m.email)),
    preferredContactMethod: z.enum(contactMethods, m.preferredContactMethod),
    productCategory: optionalText(60),
    equipmentType: optionalText(80),
    condition: optional(z.enum(contactConditions)),
    capacityRequirement: optionalText(40),
    liftHeight: optionalText(40),
    location: optionalText(120),
    timeline: optional(z.enum(contactTimelines)),
    message: z.string().trim().min(10, m.messageMin).max(650, m.messageMax),
    sourcePage: z.string().trim().min(1).max(200).default("/contact"),
    // Hidden trap field. Real visitors never fill it; the route treats a filled value as a bot.
    homepageUrl: z.string().max(200).optional(),
  });
}

export const contactInquirySchema = contactInquirySchemaFor();
export type ContactInquiryInput = z.input<typeof contactInquirySchema>;
export type ContactInquiry = z.output<typeof contactInquirySchema>;

export function contactToLead(inquiry: ContactInquiry): LeadInput {
  const lines = [
    ["Preferred contact", inquiry.preferredContactMethod],
    ["Product", inquiry.productCategory],
    ["Equipment type", inquiry.equipmentType],
    ["Condition", inquiry.condition],
    ["Capacity", inquiry.capacityRequirement],
    ["Lift height", inquiry.liftHeight],
    ["Location", inquiry.location],
    ["Timeline", inquiry.timeline],
  ]
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`);

  return {
    leadType: "CONTACT_GENERAL",
    companyName: inquiry.companyName,
    contactPerson: inquiry.contactPerson,
    phone: inquiry.phone,
    email: inquiry.email,
    equipmentOrServiceCategory: inquiry.inquiryType,
    message: [inquiry.message, lines.join("\n")].filter(Boolean).join("\n\n"),
    sourcePage: inquiry.sourcePage,
  };
}
