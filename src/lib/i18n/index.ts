// Site locales. English is served unprefixed (/about), Lao under /lo (/lo/about). The locale comes from
// the URL only: the host's nginx cache keys on the URL, so no cookie or Accept-Language ever picks it.
export const locales = ["en", "lo"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const isLocale = (value: unknown): value is Locale => (locales as readonly unknown[]).includes(value);

// Paths that are not website pages and never get a locale prefix.
const unprefixed = /^\/(api|admin|app|og|_next)(\/|$|\?|#)/;
const hasExtension = /\/[^/?#]+\.[a-z0-9]+([?#]|$)/i;

// The site path for this locale. External links, tel:, mailto:, #anchors, API, admin, the phone app, share
// images and files keep their address; query strings and hashes are kept.
export function localizeHref(href: string, locale: Locale): string {
  if (locale === defaultLocale || !href.startsWith("/") || href.startsWith("//")) return href;
  if (unprefixed.test(href) || hasExtension.test(href)) return href;
  if (/^\/lo(\/|$|\?|#)/.test(href)) return href;
  return href === "/" || /^\/[?#]/.test(href) ? `/lo${href.slice(1)}` : `/lo${href}`;
}

// The locale a pathname is in: /lo and /lo/... are Lao, everything else English.
export const localeOf = (pathname: string): Locale => (/^\/lo(\/|$)/.test(pathname) ? "lo" : defaultLocale);

// The pathname without its locale prefix: /lo/about -> /about, /lo -> /, /en/about -> /about.
export function stripLocale(pathname: string): string {
  const match = pathname.match(/^\/(en|lo)(\/.*)?$/);
  return match ? match[2] || "/" : pathname;
}

// The same page in another locale, for the language toggle and hreflang tags.
export const alternatePath = (pathname: string, target: Locale): string => localizeHref(stripLocale(pathname), target);

// Open Graph locale names.
export const ogLocale: Record<Locale, string> = { en: "en_US", lo: "lo_LA" };

// The locale from a route's params. The [locale] layout already 404s an unknown value; English is a safe default.
export const localeParam = async (params: Promise<{ locale: string }>): Promise<Locale> => {
  const { locale } = await params;
  return isLocale(locale) ? locale : defaultLocale;
};
