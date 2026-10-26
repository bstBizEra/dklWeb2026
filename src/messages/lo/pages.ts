// Lao overrides for the three hand-built pages in src/lib/data/pages.ts, keyed by page id:
// "quote" (requestQuotePage), "contact" (contactPage), "rental" (forkliftRentalPage).
// Same shape as PageContent; sections and items follow the English order. id, href, routeId, kind and
// fact always stay English.
import type { PageContent } from "@/lib/data/pages";
import type { DeepPartial } from "@/lib/i18n/localize";

export const loPages: Partial<Record<string, DeepPartial<PageContent>>> = {
  contact: {
    eyebrow: "ຕິດຕໍ່ ດີ.ເຄ. ລາວ",
    h1: "ຕິດຕໍ່ ດີ.ເຄ. ລາວ",
  },
};
