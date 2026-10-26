import { cache } from "react";

import { sectionKinds, type PageContent, type PageSection } from "@/lib/data/pages";

import { fromDetailsRow, type DetailsRow } from "./details-backfill";
import { factKeys, type FactKey } from "@/lib/data/site-facts";
import { hasConfirmMarker } from "@/lib/data/confirm";

import type { Locale } from "@/lib/i18n";

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

// The published CMS page wins. Without a database, or without a published row, the built-in page is used.
// Text fields are localized in the CMS: a Lao field left empty shows the English text (fallbackLocale).
async function loadPage(fallbackId: string, locale: Locale): Promise<PageContent | null> {
  if (!cmsEnabled()) return null;

  try {
    const cms = await getCms();
    const result = await cms.find({
      collection: "pages",
      where: { routeId: { equals: fallbackId }, _status: { equals: "published" } },
      locale,
      fallbackLocale: "en",
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });
    const doc = result.docs[0];
    return doc ? pageFromDoc(doc as unknown as Doc) : null;
  } catch {
    return null;
  }
}

const cachedPage = cache(loadPage);

// `fallback` is the built-in page already in `locale` (see localizePage).
export async function getPageContent(fallback: PageContent, locale: Locale = "en"): Promise<PageContent> {
  return (await cachedPage(fallback.id, locale)) ?? fallback;
}
