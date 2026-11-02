import type { Metadata } from "next";

import { localizeHref, ogLocale, type Locale } from "./index";

// Canonical and hreflang links for one page: each language points at itself, and x-default at English.
// Paths are relative; the root layout's metadataBase makes them absolute.
export function localeAlternates(path: string, locale: Locale): NonNullable<Metadata["alternates"]> {
  return {
    canonical: localizeHref(path, locale),
    languages: { en: path, lo: localizeHref(path, "lo"), "x-default": path },
  };
}

// Open Graph fields every page shares, in the page's language.
export const ogBase = (path: string, locale: Locale) => ({
  url: localizeHref(path, locale),
  siteName: "DK LAO",
  locale: ogLocale[locale],
  alternateLocale: [ogLocale[locale === "lo" ? "en" : "lo"]],
  type: "website" as const,
});
