// Local seed. Run with: pnpm cms:seed. It creates no users and no passwords: the owner registers at /admin.
// 1. Copies the owner-confirmed facts from src/lib/data/site-facts.ts into the site-facts global.
// 2. Creates a published row in "pages" for each built-in page (the 3 hand-built and the 21 from the sitemap)
//    that does not have one yet. Items flagged needsConfirmation stay hidden until the owner unticks them.
// 3. Saves the default header menu into the navigation global when no menu is saved.
// 4. Writes the Lao (lo) locale from the built-in Lao overrides in src/messages/lo/ (see the end of this file).
// Existing rows and menus are left alone, so edits made in the admin are never overwritten. The one
// addition to an existing published page is a card's "Read more" section on items whose section is still
// completely empty.
// To replace chosen pages with the built-in copy on purpose, name them in SEED_REFRESH_PAGES:
//   SEED_REFRESH_PAGES=industries,ind-logistics pnpm cms:seed
// Only those rows are overwritten; anything an editor changed in them is lost, so use it before launch only.
import { getPayload } from "payload";

import config from "../src/payload.config";
import { contactPage, forkliftRentalPage, localizePage, requestQuotePage, type PageContent } from "../src/lib/data/pages";
import { defaultNavigation, navigationFor } from "../src/lib/data/navigation";
import { sitemapPageList } from "../src/lib/data/sitemap-pages";
import { fillMissingDetails, toDetailsRow } from "../src/lib/cms/details-backfill";
import { siteFacts, siteFactsFor } from "../src/lib/data/site-facts";

const payload = await getPayload({ config });
const refresh = new Set((process.env.SEED_REFRESH_PAGES ?? "").split(",").map((id) => id.trim()).filter(Boolean));

const confirmed = Object.fromEntries(Object.entries(siteFacts).filter(([, value]) => value));
await payload.updateGlobal({ slug: "site-facts", data: confirmed, overrideAccess: true });
payload.logger.info(`site-facts seeded with ${Object.keys(confirmed).length} confirmed facts`);

function toRow(page: PageContent) {
  return {
    routeId: page.id,
    metaTitle: page.metaTitle,
    metaDescription: page.metaDescription,
    eyebrow: page.eyebrow,
    h1: page.h1,
    intro: page.intro,
    ctas: page.ctas,
    sections: page.sections.map((section) => ({
      kind: section.kind,
      title: section.title,
      intro: section.intro,
      body: section.body,
      needsConfirmation: section.needsConfirmation ?? false,
      items: section.items.map((item) => ({
        title: item.title,
        description: item.description,
        routeId: item.routeId,
        fact: item.fact,
        needsConfirmation: item.needsConfirmation ?? false,
        details: item.details ? toDetailsRow(item.details) : undefined,
      })),
    })),
    closing: page.closing
      ? { title: page.closing.title, copy: page.closing.copy, primary: page.closing.primary, secondary: page.closing.secondary }
      : undefined,
    _status: "published" as const,
  };
}

for (const page of [requestQuotePage, contactPage, forkliftRentalPage, ...sitemapPageList]) {
  const existing = await payload.find({
    collection: "pages",
    where: { routeId: { equals: page.id } },
    limit: 1,
    draft: true,
    overrideAccess: true,
  });
  if (existing.totalDocs > 0 && refresh.has(page.id)) {
    await payload.update({ collection: "pages", id: existing.docs[0].id, data: toRow(page), overrideAccess: true });
    payload.logger.info(`page "${page.id}" refreshed from the built-in copy`);
    continue;
  }
  if (existing.totalDocs > 0) {
    // Card sections arrived after many pages were seeded: fill only items whose section is still empty.
    // A page with an unpublished draft is skipped, so saving cannot publish or overwrite that draft.
    const doc = existing.docs[0] as unknown as { id: string | number; _status?: string; sections?: Record<string, unknown>[] };
    const { sections, filled } = fillMissingDetails(doc.sections ?? [], page.sections);
    if (filled > 0 && doc._status === "published") {
      await payload.update({ collection: "pages", id: doc.id, data: { sections, _status: "published" } as never, overrideAccess: true });
      payload.logger.info(`page "${page.id}" exists: added a card section to ${filled} item(s), nothing else changed`);
    } else if (filled > 0) {
      payload.logger.info(`page "${page.id}" has an unpublished draft: card sections not added, publish or discard the draft and run the seed again`);
    } else {
      payload.logger.info(`page "${page.id}" already exists, left unchanged`);
    }
    continue;
  }
  await payload.create({ collection: "pages", data: toRow(page), overrideAccess: true });
  payload.logger.info(`page "${page.id}" created`);
}

const menu = await payload.findGlobal({ slug: "navigation", overrideAccess: true });
if (!menu.items?.length) {
  await payload.updateGlobal({
    slug: "navigation",
    data: {
      items: defaultNavigation.map((item) => ({
        label: item.label,
        routeId: item.routeId,
        children: (item.children ?? []).map((child) => ({ label: child.label, routeId: child.routeId, description: child.description })),
      })),
    },
    overrideAccess: true,
  });
  payload.logger.info("navigation seeded with the default menu");
}

// 4. Lao (locale "lo") from the built-in overrides in src/messages/lo/. Only text that differs from English
// is written; everything else is left empty so the site falls back to the English text, and English edits
// made later in the admin keep showing on Lao pages until someone translates them. A page whose Lao text is
// already saved is left alone (SEED_REFRESH_PAGES rewrites it), and so is a row whose sections no longer
// match the built-in page, because the Lao text would land on the wrong items.
type Json = unknown;
const shared = new Set(["id", "routeId", "href", "kind", "fact", "needsConfirmation", "_status"]);

// The Lao row with only the text that differs from English, plus the ids and shared fields that keep the
// array rows aligned with the saved English ones.
function laoOnly(lo: Json, en: Json): Json {
  if (Array.isArray(lo)) return lo.map((item, index) => laoOnly(item, Array.isArray(en) ? en[index] : undefined));
  if (lo && typeof lo === "object") {
    const base = (en ?? {}) as Record<string, Json>;
    return Object.fromEntries(
      Object.entries(lo as Record<string, Json>)
        .map(([key, value]): [string, Json] => [key, shared.has(key) ? value : laoOnly(value, base[key])])
        .filter(([, value]) => value !== undefined),
    );
  }
  return typeof lo === "string" && lo === en ? undefined : lo;
}

// Copies the saved row ids onto the Lao row by position. Throws when the shapes differ.
function withIds(row: Json, doc: Json, path = ""): Json {
  if (Array.isArray(row)) {
    if (!Array.isArray(doc) || doc.length !== row.length) throw new Error(`structure differs at ${path || "root"}`);
    return row.map((item, index) => withIds(item, doc[index], `${path}[${index}]`));
  }
  if (row && typeof row === "object") {
    const saved = (doc ?? {}) as Record<string, Json>;
    const out = Object.fromEntries(Object.entries(row as Record<string, Json>).map(([key, value]) => [key, withIds(value, saved[key], `${path}.${key}`)]));
    return saved.id !== undefined ? { ...out, id: saved.id } : out;
  }
  return row;
}

const same = (a: Json, b: Json) => JSON.stringify(a) === JSON.stringify(b);

for (const page of [requestQuotePage, contactPage, forkliftRentalPage, ...sitemapPageList]) {
  const lao = localizePage(page, "lo");
  if (same(lao, page)) continue;

  const found = await payload.find({ collection: "pages", where: { routeId: { equals: page.id } }, limit: 1, depth: 0, overrideAccess: true });
  const doc = found.docs[0];
  if (!doc) continue;
  const saved = await payload.findByID({ collection: "pages", id: doc.id, locale: "lo", fallbackLocale: false, depth: 0, overrideAccess: true });
  if (saved.h1 && !refresh.has(page.id)) {
    payload.logger.info(`page "${page.id}" already has Lao text, left alone`);
    continue;
  }
  try {
    const data = withIds(laoOnly(toRow(lao), toRow(page)), doc);
    await payload.update({ collection: "pages", id: doc.id, locale: "lo", data: { ...(data as object), _status: "published" } as never, overrideAccess: true });
    payload.logger.info(`page "${page.id}" Lao text written`);
  } catch (error) {
    payload.logger.warn(`page "${page.id}" Lao text skipped: ${error instanceof Error ? error.message : error}`);
  }
}

const laoMenu = navigationFor("lo").defaultNavigation;
if (!same(laoMenu, defaultNavigation)) {
  const saved = await payload.findGlobal({ slug: "navigation", overrideAccess: true, depth: 0 });
  const savedLao = await payload.findGlobal({ slug: "navigation", locale: "lo", fallbackLocale: false, overrideAccess: true, depth: 0 });
  const menuRow = (items: typeof defaultNavigation) =>
    items.map((item) => ({ label: item.label, routeId: item.routeId, children: (item.children ?? []).map((child) => ({ label: child.label, routeId: child.routeId, description: child.description })) }));
  if (savedLao.items?.some((item) => item.label)) {
    payload.logger.info("navigation already has Lao labels, left alone");
  } else if (!same(menuRow(defaultNavigation), (saved.items ?? []).map((item) => ({ label: item.label, routeId: item.routeId ?? undefined, children: (item.children ?? []).map((child) => ({ label: child.label, routeId: child.routeId, description: child.description ?? undefined })) })))) {
    payload.logger.info("navigation was edited in the admin, Lao labels not written");
  } else {
    const data = withIds(laoOnly(menuRow(laoMenu), menuRow(defaultNavigation)), saved.items, "items");
    await payload.updateGlobal({ slug: "navigation", locale: "lo", data: { items: data } as never, overrideAccess: true });
    payload.logger.info("navigation Lao labels written");
  }
}

const laoFacts = Object.fromEntries(Object.entries(siteFactsFor("lo")).filter(([key, value]) => value && value !== siteFacts[key as keyof typeof siteFacts]));
if (Object.keys(laoFacts).length > 0) {
  await payload.updateGlobal({ slug: "site-facts", locale: "lo", data: laoFacts, overrideAccess: true });
  payload.logger.info(`site-facts Lao wording for ${Object.keys(laoFacts).length} fact(s)`);
}

process.exit(0);
