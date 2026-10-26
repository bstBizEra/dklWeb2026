import type { Locale } from "@/lib/i18n";

import { en, type Messages } from "./en";
import { lo } from "./lo";

const messages: Record<Locale, Messages> = { en, lo };

export const getMessages = (locale: Locale): Messages => messages[locale];
export type { Messages };
