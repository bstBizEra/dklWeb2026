// Lao overrides for src/lib/data/routes.ts (page names used in breadcrumbs, footer, 404 links and
// "Related solutions"). Keyed by route id. Only label, navLabel and blurb are translated; ids and hrefs stay.
import type { SiteRoute } from "@/lib/data/routes";

export const loRoutes: Partial<Record<string, Partial<Pick<SiteRoute, "label" | "navLabel" | "blurb">>>> = {
  home: { label: "ໜ້າຫຼັກ" },
  about: { label: "ກ່ຽວກັບ ດີ.ເຄ. ລາວ" },
  contact: { label: "ຕິດຕໍ່ ດີ.ເຄ. ລາວ" },
};
