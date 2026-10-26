// Lao overrides for src/lib/data/about.ts (About page cards, snapshot, CTAs and promise steps).
// Same shape as AboutContent; arrays follow the English order (index 0 overrides the first English item).
// Only text is used: hrefs, icons and variants always stay English.
import type { AboutContent } from "@/lib/data/about";
import type { DeepPartial } from "@/lib/i18n/localize";

export const loAbout: DeepPartial<AboutContent> = {};
