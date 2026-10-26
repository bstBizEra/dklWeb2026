// Lao overrides for src/lib/data/homepage.ts (Home hero CTAs, quick quote bar, solution, category,
// industry and knowledge cards). Same shape as HomepageContent; arrays follow the English order.
// Only text is used: hrefs, icons and variants always stay English.
import type { HomepageContent } from "@/lib/data/homepage";
import type { DeepPartial } from "@/lib/i18n/localize";

export const loHomepage: DeepPartial<HomepageContent> = {};
