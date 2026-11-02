// The cleaning equipment page's recommendation form (ported from feature/services-all-products,
// CleaningRecommendationWizard and lib/cleaning/lead-message.ts). The feature wizard imported option lists its
// data file never defined and posted a lead type the leads table does not accept, so the choices here follow
// this page instead: its Nilfisk range cards and its "Match machine to site" rows. Left out: the site survey,
// delivery and training questions (none confirmed) and the brand question (Nilfisk is the confirmed brand).
// Extra answers are written into the lead's message as labelled English lines. Caps keep the longest possible
// message within the leads table's 1200 characters (cleaning.test.ts).
import { z } from "zod";

import type { LeadInput } from "@/lib/leads/intake";
import { contactMethods, contactTimelines } from "@/lib/validation/contact";
import { en, type Messages } from "@/messages/en";

// The value sent, and the English category the team sees for it.
export const cleaningMachineCategory = {
  "scrubber-dryer": "Cleaning: scrubber dryer",
  sweeper: "Cleaning: sweeper",
  robotic: "Cleaning: robotic floor cleaner",
  "industrial-vacuum": "Cleaning: industrial vacuum",
  "commercial-vacuum": "Cleaning: commercial vacuum",
  "pressure-washer": "Cleaning: pressure washer",
  detergent: "Cleaning: detergents",
  "not-sure": "Cleaning: needs a recommendation",
} as const;
export const cleaningMachines = Object.keys(cleaningMachineCategory) as (keyof typeof cleaningMachineCategory)[];

export const cleaningSiteLabel = {
  LARGE_FLOORS: "Large smooth floors",
  DUST_DEBRIS: "Dust and debris",
  PRODUCTION: "Fine dust, chips or liquids in production",
  OFFICES_SHOPS: "Offices, hotels and shops",
  VEHICLES_OUTDOOR: "Vehicles, machines and outdoor areas",
  SPILLS_SMALL: "Spills and small areas",
  OTHER: "Something else",
} as const;
export const cleaningSites = Object.keys(cleaningSiteLabel) as (keyof typeof cleaningSiteLabel)[];

export const customerTypeLabel = { BUSINESS: "A business", HOME_SMALL_BUSINESS: "Home or small shop" } as const;
export const customerTypes = Object.keys(customerTypeLabel) as (keyof typeof customerTypeLabel)[];

export const frequencyLabel = { DAILY: "Daily", WEEKLY: "Weekly", OCCASIONALLY: "Now and then" } as const;
export const frequencies = Object.keys(frequencyLabel) as (keyof typeof frequencyLabel)[];

type ValidationMessages = Messages["cleaningForm"]["validation"];

const optional = <T extends z.ZodType>(schema: T) => z.preprocess((value) => (value === "" ? undefined : value), schema.optional());
const optionalText = (max: number) => optional(z.string().trim().max(max));

export function cleaningRequestSchemaFor(m: ValidationMessages = en.cleaningForm.validation) {
  return z.object({
    machine: z.enum(cleaningMachines, m.machine),
    site: z.enum(cleaningSites, m.site),
    customerType: z.enum(customerTypes, m.customerType),
    companyName: z.string().trim().min(2, m.companyName).max(120),
    contactPerson: z.string().trim().min(2, m.contactPerson).max(120),
    phone: z.string().trim().min(6, m.phoneMin).max(40).regex(/^[+()\d\s.-]+$/, m.phoneFormat),
    email: optional(z.email(m.email)),
    preferredContactMethod: z.enum(contactMethods, m.preferredContactMethod),
    location: z.string().trim().min(2, m.location).max(120),
    areaSize: optionalText(60),
    frequency: optional(z.enum(frequencies)),
    timeline: optional(z.enum(contactTimelines)),
    budgetRange: optionalText(60),
    requirementDetail: z.string().trim().min(10, m.requirementMin).max(500, m.requirementMax),
    sourcePage: z.string().trim().min(1).max(200).default("/cleaning-equipment"),
    // Hidden trap field. Real visitors never fill it; the route treats a filled value as a bot.
    homepageUrl: z.string().max(200).optional(),
  });
}

export const cleaningRequestSchema = cleaningRequestSchemaFor();
export type CleaningRequestInput = z.input<typeof cleaningRequestSchema>;
export type CleaningRequest = z.output<typeof cleaningRequestSchema>;

export function cleaningToLead(request: CleaningRequest): LeadInput {
  const lines = [
    ["Site", cleaningSiteLabel[request.site]],
    ["For", customerTypeLabel[request.customerType]],
    ["Preferred contact", request.preferredContactMethod],
    ["Location", request.location],
    ["Area size", request.areaSize],
    ["How often", request.frequency && frequencyLabel[request.frequency]],
    ["Timeline", request.timeline],
    ["Budget range", request.budgetRange],
  ]
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`);

  return {
    leadType: "CLEANING_EQUIPMENT_RECOMMENDATION",
    companyName: request.companyName,
    contactPerson: request.contactPerson,
    phone: request.phone,
    email: request.email,
    equipmentOrServiceCategory: cleaningMachineCategory[request.machine],
    message: [request.requirementDetail, lines.join("\n")].join("\n\n"),
    sourcePage: request.sourcePage,
  };
}
