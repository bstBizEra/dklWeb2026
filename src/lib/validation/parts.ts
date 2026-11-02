// The spare parts page's request form (ported from feature/services-all-products, PartsPage).
// Extra answers are written into the lead's message as labelled English lines for the team. Photo upload
// comes in a later stage. Caps keep the longest possible message within the leads table's 1200 characters
// (parts.test.ts).
import { z } from "zod";

import type { LeadInput } from "@/lib/leads/intake";
import { contactMethods } from "@/lib/validation/contact";
import { quotationLabel, urgencies, urgencyLabel } from "@/lib/validation/service";
import { en, type Messages } from "@/messages/en";

// The value sent, and the English category the team sees for it.
export const productGroupCategory = {
  forklift: "Forklift parts",
  warehouse: "Warehouse parts",
  cleaning: "Cleaning machine parts",
} as const;
export const productGroups = Object.keys(productGroupCategory) as (keyof typeof productGroupCategory)[];

export const partTypeLabel = {
  SPARE_PART: "Spare part",
  CONSUMABLE: "Consumable",
  ACCESSORY: "Accessory",
  SAFETY_PART: "Safety part",
} as const;
export const partTypes = Object.keys(partTypeLabel) as (keyof typeof partTypeLabel)[];

// Same Yes / No / Not sure answers as the service form's quotation question.
export const installationChoices = Object.keys(quotationLabel) as (keyof typeof quotationLabel)[];

type ValidationMessages = Messages["partsForm"]["validation"];

const optionalText = (max: number) => z.preprocess((value) => (value === "" ? undefined : value), z.string().trim().max(max).optional());

export function partsRequestSchemaFor(m: ValidationMessages = en.partsForm.validation) {
  return z.object({
    productGroup: z.enum(productGroups, m.productGroup),
    partType: z.enum(partTypes, m.partType),
    companyName: z.string().trim().min(2, m.companyName).max(120),
    contactPerson: z.string().trim().min(2, m.contactPerson).max(120),
    phone: z.string().trim().min(6, m.phoneMin).max(40).regex(/^[+()\d\s.-]+$/, m.phoneFormat),
    email: z.preprocess((value) => (value === "" ? undefined : value), z.email(m.email).optional()),
    preferredContactMethod: z.enum(contactMethods, m.preferredContactMethod),
    equipmentType: z.string().trim().min(2, m.equipmentType).max(80),
    equipmentBrand: z.string().trim().min(2, m.equipmentBrand).max(60),
    equipmentModel: optionalText(60),
    serialNumber: optionalText(60),
    partDescription: z.string().trim().min(10, m.partDescriptionMin).max(500, m.partDescriptionMax),
    quantity: z.string().trim().min(1, m.quantity).max(40),
    urgency: z.enum(urgencies, m.urgency),
    installationNeed: z.enum(installationChoices, m.installationNeed),
    location: z.string().trim().min(2, m.location).max(120),
    sourcePage: z.string().trim().min(1).max(200).default("/spare-parts"),
    // Hidden trap field. Real visitors never fill it; the route treats a filled value as a bot.
    homepageUrl: z.string().max(200).optional(),
  });
}

export const partsRequestSchema = partsRequestSchemaFor();
export type PartsRequestInput = z.input<typeof partsRequestSchema>;
export type PartsRequest = z.output<typeof partsRequestSchema>;

export function partsToLead(request: PartsRequest): LeadInput {
  const lines = [
    ["Part type", partTypeLabel[request.partType]],
    ["Quantity", request.quantity],
    ["Preferred contact", request.preferredContactMethod],
    ["Equipment type", request.equipmentType],
    ["Equipment brand", request.equipmentBrand],
    ["Model", request.equipmentModel],
    ["Serial number", request.serialNumber],
    ["Urgency", urgencyLabel[request.urgency]],
    ["Installation needed", quotationLabel[request.installationNeed]],
    ["Location", request.location],
  ]
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`);

  return {
    leadType: "SPARE_PARTS_INQUIRY",
    companyName: request.companyName,
    contactPerson: request.contactPerson,
    phone: request.phone,
    email: request.email,
    equipmentOrServiceCategory: productGroupCategory[request.productGroup],
    message: [request.partDescription, lines.join("\n")].join("\n\n"),
    sourcePage: request.sourcePage,
  };
}
