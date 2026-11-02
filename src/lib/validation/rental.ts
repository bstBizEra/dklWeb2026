// The forklift rental page's inquiry form (ported from feature/services-all-products, RentalInquiryForm).
// Extra answers are written into the lead's message as labelled English lines. Left out: the feature
// branch's operator and delivery questions (operator supply and deliveryCoverage are not confirmed) and its
// equipment list (pallet trucks, stackers and others are needsConfirmation). The power preference follows
// the page's own "What to tell us" table. Caps keep the longest possible message within the leads table's
// 1200 characters (rental.test.ts).
import { z } from "zod";

import type { LeadInput } from "@/lib/leads/intake";
import { contactMethods } from "@/lib/validation/contact";
import { environmentLabel, environments } from "@/lib/validation/sales";
import { en, type Messages } from "@/messages/en";

// The value sent, and the English category the team sees for it. Matches the page's two rental cards.
export const rentalPeriodCategory = {
  SHORT_TERM: "Forklift rental: short term",
  LONG_TERM: "Forklift rental: long term",
  NOT_SURE: "Forklift rental: period not decided",
} as const;
export const rentalPeriods = Object.keys(rentalPeriodCategory) as (keyof typeof rentalPeriodCategory)[];

export const powerPreferenceLabel = { ELECTRIC: "Electric", DIESEL: "Diesel", LPG: "LPG", NO_PREFERENCE: "No preference" } as const;
export const powerPreferences = Object.keys(powerPreferenceLabel) as (keyof typeof powerPreferenceLabel)[];

type ValidationMessages = Messages["rentalForm"]["validation"];

const optional = <T extends z.ZodType>(schema: T) => z.preprocess((value) => (value === "" ? undefined : value), schema.optional());
const optionalText = (max: number) => optional(z.string().trim().max(max));

export function rentalInquirySchemaFor(m: ValidationMessages = en.rentalForm.validation) {
  return z.object({
    rentalPeriod: z.enum(rentalPeriods, m.rentalPeriod),
    companyName: z.string().trim().min(2, m.companyName).max(120),
    contactPerson: z.string().trim().min(2, m.contactPerson).max(120),
    phone: z.string().trim().min(6, m.phoneMin).max(40).regex(/^[+()\d\s.-]+$/, m.phoneFormat),
    email: optional(z.email(m.email)),
    preferredContactMethod: z.enum(contactMethods, m.preferredContactMethod),
    location: z.string().trim().min(2, m.location).max(120),
    capacity: z.string().trim().min(1, m.capacity).max(40),
    liftHeight: z.string().trim().min(1, m.liftHeight).max(40),
    environment: z.enum(environments, m.environment),
    powerPreference: optional(z.enum(powerPreferences)),
    startDate: optionalText(40),
    duration: optionalText(40),
    workingHours: optionalText(40),
    requirementDetail: z.string().trim().min(10, m.requirementMin).max(500, m.requirementMax),
    sourcePage: z.string().trim().min(1).max(200).default("/forklift-rental"),
    // Hidden trap field. Real visitors never fill it; the route treats a filled value as a bot.
    homepageUrl: z.string().max(200).optional(),
  });
}

export const rentalInquirySchema = rentalInquirySchemaFor();
export type RentalInquiryInput = z.input<typeof rentalInquirySchema>;
export type RentalInquiry = z.output<typeof rentalInquirySchema>;

export function rentalToLead(inquiry: RentalInquiry): LeadInput {
  const lines = [
    ["Preferred contact", inquiry.preferredContactMethod],
    ["Location", inquiry.location],
    ["Capacity", inquiry.capacity],
    ["Lift height", inquiry.liftHeight],
    ["Working area", environmentLabel[inquiry.environment]],
    ["Power", inquiry.powerPreference && powerPreferenceLabel[inquiry.powerPreference]],
    ["Start date", inquiry.startDate],
    ["Duration", inquiry.duration],
    ["Working hours a day", inquiry.workingHours],
  ]
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`);

  return {
    leadType: "RENTAL_INQUIRY",
    companyName: inquiry.companyName,
    contactPerson: inquiry.contactPerson,
    phone: inquiry.phone,
    email: inquiry.email,
    equipmentOrServiceCategory: rentalPeriodCategory[inquiry.rentalPeriod],
    message: [inquiry.requirementDetail, lines.join("\n")].join("\n\n"),
    sourcePage: inquiry.sourcePage,
  };
}
