// Lao overrides for src/lib/data/industry-pages.ts, keyed by page id: industries, ind-logistics,
// ind-manufacturing, ind-construction, ind-food-beverage, ind-retail, ind-hospitality. Overrides apply to
// the built page (industryPage() output), so section titles such as "What slows logistics down" are
// translated here. Card sections of "What we recommend" go in industry-details.ts instead.
import type { PageContent } from "@/lib/data/pages";
import type { DeepPartial } from "@/lib/i18n/localize";

export const loIndustryPages: Partial<Record<string, DeepPartial<PageContent>>> = {};
