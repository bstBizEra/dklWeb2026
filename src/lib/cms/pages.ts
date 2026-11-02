import { cache } from "react";

import { sectionKinds, type PageContent, type PageSection } from "@/lib/data/pages";

import { fromDetailsRow, type DetailsRow } from "./details-backfill";
import { factKeys, type FactKey } from "@/lib/data/site-facts";
import { hasConfirmMarker } from "@/lib/data/confirm";

import { defaultLocale, type Locale } from "@/lib/i18n";

import { cmsEnabled, getCms } from "./client";

type Doc = Record<string, unknown>;
const str = (value: unknown): string | undefined => (typeof value === "string" && value.trim() ? value : undefined);
const list = (value: unknown): Doc[] => (Array.isArray(value) ? (value as Doc[]) : []);
const link = (value: unknown): { label: string; href: string } | undefined => {
  const doc = (value ?? {}) as Doc;
  const label = str(doc.label);
  const href = str(doc.href);
  return label && href ? { label, href } : undefined;
};

// A page row from the admin becomes the same PageContent the built-in pages use.
export function pageFromDoc(doc: Doc): PageContent | null {
  const id = str(doc.routeId);
  const h1 = str(doc.h1);
  if (!id || !h1) return null;

  const sections = list(doc.sections).flatMap((raw): PageSection[] => {
    const title = str(raw.title);
    const kind = str(raw.kind) as PageSection["kind"] | undefined;
    if (!title || !kind || !(sectionKinds as readonly string[]).includes(kind) || hasConfirmMarker(title)) return [];

    const items = list(raw.items).flatMap((item) => {
      const itemTitle = str(item.title);
      const fact = str(item.fact);
      if (!itemTitle) return [];
      // Optional card section; kept only when it has an opening paragraph and two complete topics.
      const details = fromDetailsRow(item.details as DetailsRow | undefined);
      return [
        {
          title: itemTitle,
          description: str(item.description),
          details,
          routeId: str(item.routeId),
          fact: fact && (factKeys as string[]).includes(fact) ? (fact as FactKey) : undefined,
          needsConfirmation: item.needsConfirmation === true ? true : undefined,
        },
      ];
    });

    return [
      {
        kind,
        title,
        intro: str(raw.intro),
        body: str(raw.body),
        items,
        needsConfirmation: raw.needsConfirmation === true ? true : undefined,
      },
    ];
  });

  const closing = (doc.closing ?? {}) as Doc;
  const primary = link(closing.primary);
  const closingTitle = str(closing.title);

  return {
    id,
    metaTitle: str(doc.metaTitle) ?? h1,
    metaDescription: str(doc.metaDescription) ?? "",
    eyebrow: str(doc.eyebrow) ?? h1,
    h1,
    intro: str(doc.intro) ?? "",
    ctas: list(doc.ctas).flatMap((cta) => {
      const parsed = link(cta);
      return parsed ? [parsed] : [];
    }),
    sections,
    closing:
      closingTitle && primary
        ? { title: closingTitle, copy: str(closing.copy) ?? "", primary, secondary: link(closing.secondary) }
        : undefined,
  };
}

// A row translated whole: every section it holds came back with a title in the asked-for language. A part-
// translated row would render with the empty sections silently dropped, so it waits until it is finished.
const coversEverySection = (doc: Doc, page: PageContent): boolean => page.sections.length === list(doc.sections).length;

// The published CMS page wins. Without a database, or without a published row, the built-in page is used.
// Outside the default language there is no English fallback: the rows in the admin were filled in English
// only, and the fallback put that English text on every Lao page while the built-in Lao pages
// (src/messages/lo/) went unused. A row counts for Lao only once it is translated whole.
async function loadPage(fallbackId: string, locale: Locale): Promise<PageContent | null> {
  if (!cmsEnabled()) return null;

  try {
    const cms = await getCms();
    const result = await cms.find({
      collection: "pages",
      where: { routeId: { equals: fallbackId }, _status: { equals: "published" } },
      locale,
      fallbackLocale: locale === defaultLocale ? defaultLocale : false,
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });
    const doc = result.docs[0] as unknown as Doc | undefined;
    const page = doc ? pageFromDoc(doc) : null;
    if (!page || locale === defaultLocale) return page;
    return coversEverySection(doc as Doc, page) ? page : null;
  } catch {
    return null;
  }
}

const cachedPage = cache(loadPage);

// `fallback` is the built-in page already in `locale` (see localizePage).
export async function getPageContent(fallback: PageContent, locale: Locale = "en"): Promise<PageContent> {
  return (await cachedPage(fallback.id, locale)) ?? fallback;
}

// When each published CMS page was last changed, by route id, for the sitemap. Built-in pages have no
// reliable date, so they are simply absent: an honest missing lastmod is better than "now" on every build,
// which search engines learn to ignore. Without a database, or on any error, the map is empty.
export async function getPageDates(): Promise<Map<string, Date>> {
  if (!cmsEnabled()) return new Map();

  try {
    const cms = await getCms();
    const result = await cms.find({
      collection: "pages",
      where: { _status: { equals: "published" } },
      pagination: false,
      depth: 0,
      overrideAccess: true,
    });
    const dates = new Map<string, Date>();
    for (const doc of result.docs as unknown as Doc[]) {
      const id = str(doc.routeId);
      const updated = str(doc.updatedAt);
      const date = updated ? new Date(updated) : undefined;
      if (id && date && !Number.isNaN(date.getTime())) dates.set(id, date);
    }
    return dates;
  } catch {
    return new Map();
  }
}
