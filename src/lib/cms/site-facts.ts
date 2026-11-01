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

// When the CMS answers, it is the only source: clearing a field in the admin hides it on the site.
// When the CMS is off or unreachable, the built-in facts keep the site complete.
async function loadSiteFacts(locale: Locale = "en"): Promise<SiteFacts> {
  if (!cmsEnabled()) return siteFactsFor(locale);

  try {
    const cms = await getCms();
    const doc = await cms.findGlobal({ slug: "site-facts", overrideAccess: true, locale, fallbackLocale: "en" });
    return sanitizeFacts(doc as unknown as Record<string, unknown>);
  } catch {
    return siteFactsFor(locale);
  }
}

export const getSiteFacts = cache(loadSiteFacts);
