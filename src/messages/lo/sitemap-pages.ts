// Lao overrides for src/lib/data/sitemap-pages.ts (the sitemap pages that are not industry pages),
// keyed by page id: rental-short, rental-long, sales, sales-new, sales-used, parts, maintenance, batteries,
// warehouse, material, racking, cleaning, knowledge, article. Same shape as PageContent; sections and
// items follow the English order. id, href, routeId, kind and fact always stay English.
import type { PageContent } from "@/lib/data/pages";
import type { DeepPartial } from "@/lib/i18n/localize";

export const loSitemapPages: Partial<Record<string, DeepPartial<PageContent>>> = {};
