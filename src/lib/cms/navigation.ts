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

const rows = (doc: Doc | null | undefined): number =>
  list(doc?.items).reduce((total, item) => total + 1 + list(item.children).length, 0);

// True when every row the admin saved came back with a label in the asked-for locale. Taking the
// labelled subset instead would quietly drop menu items, so a part-translated menu counts as untranslated.
export function navIsComplete(doc: Doc | null | undefined, items: NavItem[]): boolean {
  const labelled = items.reduce((total, item) => total + 1 + (item.children?.length ?? 0), 0);
  return labelled === rows(doc);
}

async function loadNavigation(locale: Locale = "en"): Promise<ResolvedNavItem[]> {
  const { defaultNavigation } = navigationFor(locale);
  if (!cmsEnabled()) return resolveNavigation(defaultNavigation);

  try {
    const cms = await getCms();
    // No fallback locale: the menu saved in the admin has English labels only, and an English fallback
    // put those English items on top of every Lao page. Untranslated now means unlabelled, which drops
    // the saved menu in favour of the built-in one for this locale.
    const doc = await cms.findGlobal({ slug: "navigation", overrideAccess: true, locale, fallbackLocale: false });
    const items = navFromDoc(doc as unknown as Doc);
    const usable = items.length > 0 && navIsComplete(doc as unknown as Doc, items);
    return resolveNavigation(usable ? items : defaultNavigation);
  } catch {
    return resolveNavigation(defaultNavigation);
  }
}

export const getNavigation = cache(loadNavigation);
