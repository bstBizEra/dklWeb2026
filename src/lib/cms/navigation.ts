import { cache } from "react";

import { navigationFor, resolveNavigation, type NavItem, type ResolvedNavItem } from "@/lib/data/navigation";
import type { Locale } from "@/lib/i18n";

import { cmsEnabled, getCms } from "./client";

type Doc = Record<string, unknown>;
const str = (value: unknown): string | undefined => (typeof value === "string" && value.trim() ? value.trim() : undefined);
const list = (value: unknown): Doc[] => (Array.isArray(value) ? (value as Doc[]) : []);

// A saved menu row from the admin becomes the same NavItem list as the built-in default.
export function navFromDoc(doc: Doc | null | undefined): NavItem[] {
  return list(doc?.items).flatMap((raw): NavItem[] => {
    const label = str(raw.label);
    if (!label) return [];

    const children = list(raw.children).flatMap((child) => {
      const childLabel = str(child.label);
      const routeId = str(child.routeId);
      return childLabel && routeId ? [{ label: childLabel, routeId, description: str(child.description) }] : [];
    });

    return children.length > 0 ? [{ label, children }] : [{ label, routeId: str(raw.routeId) }];
  });
}

async function loadNavigation(locale: Locale = "en"): Promise<ResolvedNavItem[]> {
  const { defaultNavigation } = navigationFor(locale);
  if (!cmsEnabled()) return resolveNavigation(defaultNavigation);

  try {
    const cms = await getCms();
    const doc = await cms.findGlobal({ slug: "navigation", overrideAccess: true, locale, fallbackLocale: "en" });
    const items = navFromDoc(doc as unknown as Doc);
    return resolveNavigation(items.length > 0 ? items : defaultNavigation);
  } catch {
    return resolveNavigation(defaultNavigation);
  }
}

export const getNavigation = cache(loadNavigation);
