// Lao overrides for src/lib/data/industry-details.ts: the card sections of each industry page's
// "What we recommend" cards. Keyed exactly like the English data: industry page id, then the ENGLISH card
// title (do not translate the keys; translate the card title itself in industry-pages.ts).
import type { ItemDetails } from "@/lib/data/pages";
import type { DeepPartial } from "@/lib/i18n/localize";

export const loIndustryDetails: Partial<Record<string, Partial<Record<string, DeepPartial<ItemDetails>>>>> = {};
