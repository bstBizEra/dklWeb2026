// Lao overrides for src/lib/data/navigation.ts: the built-in header menu (used when the CMS has no saved
// menu), the mega menu group titles (Equipment, Service & parts) and the promo card. Arrays follow the
// English order; routeId, image and ctaHref stay English.
import type { NavigationText } from "@/lib/data/navigation";
import type { DeepPartial } from "@/lib/i18n/localize";

export const loNavigation: DeepPartial<NavigationText> = {
  defaultNavigation: [],
  menuGroupTitles: [],
  solutionsPromo: {},
};
