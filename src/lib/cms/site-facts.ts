import { cache } from "react";

import { siteFacts, siteFactsFor, type FactKey, type SiteFacts } from "@/lib/data/site-facts";
import type { Locale } from "@/lib/i18n";
import { hasConfirmMarker } from "@/lib/data/confirm";

import { cmsEnabled, getCms } from "./client";

// Masked numbers (+85620xxxxxxxx) and bracketed placeholders are never facts.
const masked = /x{3,}/i;

export function sanitizeFacts(raw: Record<string, unknown> | null | undefined): SiteFacts {
  const result = {} as SiteFacts;

  for (const key of Object.keys(siteFacts) as FactKey[]) {
    const value = raw?.[key];
    const text = typeof value === "string" ? value.trim() : "";
    result[key] = text && !masked.test(text) && !hasConfirmMarker(text) ? text : null;
  }

  return result;
}

// The admin filled these facts in English only, and a field left empty in another language falls back to
// English. A phone number or a link reads the same in every language, so the admin's value wins there; a
// sentence does not, so a page in another language takes the built-in wording of that language instead.
// `own` is the locale's own values (no fallback), `fallback` the same facts with the English fallback on,
// so a fact missing from both is one the admin cleared, and it stays hidden.
export function localeFacts(own: SiteFacts, fallback: SiteFacts, locale: Locale): SiteFacts {
  const builtIn = siteFactsFor(locale);
  const result = {} as SiteFacts;

  for (const key of Object.keys(siteFacts) as FactKey[]) {
    const translated = builtIn[key] !== siteFacts[key] ? builtIn[key] : null;
    result[key] = own[key] ?? (fallback[key] ? (translated ?? fallback[key]) : null);
  }

  return result;
}

// When the CMS answers, it is the only source: clearing a field in the admin hides it on the site.
// When the CMS is off or unreachable, the built-in facts keep the site complete.
async function loadSiteFacts(locale: Locale = "en"): Promise<SiteFacts> {
  if (!cmsEnabled()) return siteFactsFor(locale);

  try {
    const cms = await getCms();
    const query = (fallbackLocale: "en" | false) =>
      cms.findGlobal({ slug: "site-facts", overrideAccess: true, locale, fallbackLocale });
    const [doc, ownDoc] = await Promise.all([query("en"), locale === "en" ? null : query(false)]);
    const facts = sanitizeFacts(doc as unknown as Record<string, unknown>);

    return ownDoc ? localeFacts(sanitizeFacts(ownDoc as unknown as Record<string, unknown>), facts, locale) : facts;
  } catch {
    return siteFactsFor(locale);
  }
}

export const getSiteFacts = cache(loadSiteFacts);
