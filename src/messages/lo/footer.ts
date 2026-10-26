// Lao overrides for src/lib/data/footer.ts: short link labels keyed by route id (pages not listed use
// their route label from routes.ts) and the four group titles in English order.
import type { FooterText } from "@/lib/data/footer";
import type { DeepPartial } from "@/lib/i18n/localize";

export const loFooter: DeepPartial<FooterText> = {
  labels: {},
  groupTitles: [],
};
