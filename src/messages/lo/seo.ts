// Lao overrides for src/lib/data/seo.ts (Home and About search and share text).
// Same limits as English: title at most 60 characters, description at most 155.
import type { DeepPartial } from "@/lib/i18n/localize";
import type { aboutSeo, homeSeo } from "@/lib/data/seo";

export const loSeo: DeepPartial<{ homeSeo: typeof homeSeo; aboutSeo: typeof aboutSeo }> = {
  homeSeo: {},
  aboutSeo: {},
};
