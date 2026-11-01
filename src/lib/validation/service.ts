// The maintenance page's service booking form (ported from feature/services-all-products, ServiceHub).
// Extra answers are written into the lead's message as labelled English lines for the team. Onsite and
// workshop service are left out until the owner confirms them (sitemap-pages.ts: needsConfirmation).
// Caps keep the longest possible message within the leads table's 1200 characters (service.test.ts).
import { z } from "zod";

import type { LeadInput } from "@/lib/leads/intake";
import { contactMethods } from "@/lib/validation/contact";
import { en, type Messages } from "@/messages/en";

// The value sent, and the English category the team sees for it.
export const serviceTypeCategory = {
  "preventive-maintenance": "Preventive maintenance",
  "emergency-repair": "Breakdown repair",
  "battery-charger": "Battery and charger service",
  inspection: "Inspection",
  parts: "Spare parts replacement",
  "cleaning-service": "Cleaning machine service",
  "equipment-recommendation": "Equipment recommendation",
} as const;
export const serviceTypes = Object.keys(serviceTypeCategory) as (keyof typeof serviceTypeCategory)[];

export const productFamilyLabel = {
  forklift: "Forklift",
  warehouse: "Warehouse equipment",
  cleaning: "Cleaning machine",
  battery: "Battery or charger",
  parts: "Part",
  other: "Other",
} as const;
export const productFamilies = Object.keys(productFamilyLabel) as (keyof typeof productFamilyLabel)[];

export const urgencyLabel = { NORMAL: "Normal", URGENT: "Urgent", MACHINE_STOPPED: "Machine stopped" } as const;
export const urgencies = Object.keys(urgencyLabel) as (keyof typeof urgencyLabel)[];

export const quotationLabel = { YES: "Yes", NO: "No", NOT_SURE: "Not sure" } as const;
export const quotationChoices = Object.keys(quotationLabel) as (keyof typeof quotationLabel)[];

type ValidationMessages = Messages["serviceForm"]["validation"];

const optional = <T extends z.ZodType>(schema: T) => z.preprocess((value) => (value === "" ? undefined : value), schema.optional());
const optionalText = (max: number) => optional(z.string().trim().max(max));

export function serviceBookingSchemaFor(m: ValidationMessages = en.serviceForm.validation) {
  return z.object({
    serviceType: z.enum(serviceTypes, m.serviceType),
    productFamily: z.enum(productFamilies, m.productFamily),
    companyName: z.string().trim().min(2, m.companyName).max(120),
    contactPerson: z.string().trim().min(2, m.contactPerson).max(120),
    phone: z.string().trim().min(6, m.phoneMin).max(40).regex(/^[+()\d\s.-]+$/, m.phoneFormat),
    email: optional(z.email(m.email)),
    preferredContactMethod: z.enum(contactMethods, m.preferredContactMethod),
    equipmentBrand: z.string().trim().min(2, m.equipmentBrand).max(60),
    equipmentModel: optionalText(60),
    serialNumber: optionalText(60),
    siteLocation: z.string().trim().min(2, m.siteLocation).max(120),
    urgency: z.enum(urgencies, m.urgency),
    preferredServiceDate: optionalText(40),
    quotationChoice: optional(z.enum(quotationChoices)),
    requirementDetail: z.string().trim().min(10, m.requirementMin).max(500, m.requirementMax),
    sourcePage: z.string().trim().min(1).max(200).default("/maintenance-service"),
    // Hidden trap field. Real visitors never fill it; the route treats a filled value as a bot.
    homepageUrl: z.string().max(200).optional(),
  });
}

export const serviceBookingSchema = serviceBookingSchemaFor();
export type ServiceBookingInput = z.input<typeof serviceBookingSchema>;
export type ServiceBooking = z.output<typeof serviceBookingSchema>;

export function serviceToLead(booking: ServiceBooking): LeadInput {
  const lines = [
    ["Product", productFamilyLabel[booking.productFamily]],
    ["Preferred contact", booking.preferredContactMethod],
    ["Equipment brand", booking.equipmentBrand],
    ["Model", booking.equipmentModel],
    ["Serial number", booking.serialNumber],
    ["Site location", booking.siteLocation],
    ["Urgency", urgencyLabel[booking.urgency]],
    ["Preferred date", booking.preferredServiceDate],
    ["Quotation needed", booking.quotationChoice && quotationLabel[booking.quotationChoice]],
  ]
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`);

  return {
    leadType: "SERVICE_BOOKING",
    companyName: booking.companyName,
    contactPerson: booking.contactPerson,
    phone: booking.phone,
    email: booking.email,
    equipmentOrServiceCategory: serviceTypeCategory[booking.serviceType],
    message: [booking.requirementDetail, lines.join("\n")].join("\n\n"),
    sourcePage: booking.sourcePage,
  };
}
