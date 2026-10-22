import type { z } from "zod";

import type { leadTypeSchema } from "@/lib/validation/leads";

type LeadType = z.infer<typeof leadTypeSchema>;

// One entry per ?category= value accepted by /request-quote. The category label is
// what the form shows; the lead type is what the lead is stored as.
export const leadIntents = {
  rental: { category: "Forklift rental", leadType: "RENTAL_INQUIRY" },
  new: { category: "New forklift sales", leadType: "QUOTE_REQUEST" },
  used: { category: "Used forklift inquiry", leadType: "USED_FORKLIFT_INQUIRY" },
  parts: { category: "Spare parts", leadType: "SPARE_PARTS_INQUIRY" },
  service: { category: "Maintenance service", leadType: "SERVICE_BOOKING" },
  warehouse: { category: "Warehouse solutions", leadType: "QUOTE_REQUEST" },
  cleaning: {
    category: "Cleaning equipment",
    leadType: "CLEANING_EQUIPMENT_RECOMMENDATION",
  },
  general: { category: "General inquiry", leadType: "CONTACT_GENERAL" },
} as const satisfies Record<string, { category: string; leadType: LeadType }>;

export type IntentKey = keyof typeof leadIntents;

export const defaultIntentKey: IntentKey = "rental";

export const categoryOptions: string[] = Object.values(leadIntents).map(
  (intent) => intent.category,
);

export function isIntentKey(value: string | undefined): value is IntentKey {
  return value !== undefined && Object.keys(leadIntents).includes(value);
}

export function resolveIntent(value: string | undefined) {
  return leadIntents[isIntentKey(value) ? value : defaultIntentKey];
}

export function leadTypeForCategory(category: string): LeadType {
  const match = Object.values(leadIntents).find((intent) => intent.category === category);

  return match?.leadType ?? "QUOTE_REQUEST";
}

// ?from= comes from the address bar, so accept only a same-site path.
export function safeFromPath(value: string | undefined): string | undefined {
  if (!value || value.length > 200 || !value.startsWith("/") || value.startsWith("//")) {
    return undefined;
  }

  return value;
}
