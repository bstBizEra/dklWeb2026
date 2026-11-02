// The warehouse page's inquiry form (ported from feature/services-all-products, WarehouseInquiryForm).
// There is no warehouse lead type, so it files a QUOTE_REQUEST, as the feature branch did; extra answers
// are written into the lead's message as labelled English lines. The feature branch's racking-type and
// advanced-system choices are left out: pallet racking and shelving are still needsConfirmation here.
// Caps keep the longest possible message within the leads table's 1200 characters (warehouse.test.ts).
import { z } from "zod";

import type { LeadInput } from "@/lib/leads/intake";
import { contactMethods, contactTimelines } from "@/lib/validation/contact";
import { quotationLabel } from "@/lib/validation/service";
import { en, type Messages } from "@/messages/en";

// The value sent, and the English category the team sees for it. Matches the page's "What we equip" cards.
export const warehouseNeedCategory = {
  "racking-shelving": "Warehouse: racking and shelving",
  "material-handling": "Warehouse: material handling",
  cleaning: "Warehouse: cleaning equipment",
  power: "Warehouse: batteries and chargers",
  several: "Warehouse: several of these",
  "not-sure": "Warehouse: needs a recommendation",
} as const;
export const warehouseNeeds = Object.keys(warehouseNeedCategory) as (keyof typeof warehouseNeedCategory)[];

// Same Yes / No / Not sure answers as the service form's quotation question.
export const installationChoices = Object.keys(quotationLabel) as (keyof typeof quotationLabel)[];

type ValidationMessages = Messages["warehouseForm"]["validation"];

const optional = <T extends z.ZodType>(schema: T) => z.preprocess((value) => (value === "" ? undefined : value), schema.optional());
const optionalText = (max: number) => optional(z.string().trim().max(max));

export function warehouseInquirySchemaFor(m: ValidationMessages = en.warehouseForm.validation) {
  return z.object({
    need: z.enum(warehouseNeeds, m.need),
    companyName: z.string().trim().min(2, m.companyName).max(120),
    contactPerson: z.string().trim().min(2, m.contactPerson).max(120),
    phone: z.string().trim().min(6, m.phoneMin).max(40).regex(/^[+()\d\s.-]+$/, m.phoneFormat),
    email: optional(z.email(m.email)),
    preferredContactMethod: z.enum(contactMethods, m.preferredContactMethod),
    siteLocation: z.string().trim().min(2, m.siteLocation).max(120),
    warehouseSize: optionalText(60),
    goodsType: optionalText(100),
    estimatedLoad: optionalText(60),
    installationNeed: z.enum(installationChoices, m.installationNeed),
    timeline: optional(z.enum(contactTimelines)),
    budgetRange: optionalText(60),
    requirementDetail: z.string().trim().min(10, m.requirementMin).max(500, m.requirementMax),
    sourcePage: z.string().trim().min(1).max(200).default("/warehouse-equipment"),
    // Hidden trap field. Real visitors never fill it; the route treats a filled value as a bot.
    homepageUrl: z.string().max(200).optional(),
  });
}

export const warehouseInquirySchema = warehouseInquirySchemaFor();
export type WarehouseInquiryInput = z.input<typeof warehouseInquirySchema>;
export type WarehouseInquiry = z.output<typeof warehouseInquirySchema>;

export function warehouseToLead(inquiry: WarehouseInquiry): LeadInput {
  const lines = [
    ["Preferred contact", inquiry.preferredContactMethod],
    ["Site location", inquiry.siteLocation],
    ["Warehouse size", inquiry.warehouseSize],
    ["Goods stored", inquiry.goodsType],
    ["Heaviest load", inquiry.estimatedLoad],
    ["Installation needed", quotationLabel[inquiry.installationNeed]],
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
    equipmentOrServiceCategory: warehouseNeedCategory[inquiry.need],
    message: [inquiry.requirementDetail, lines.join("\n")].join("\n\n"),
    sourcePage: inquiry.sourcePage,
  };
}
