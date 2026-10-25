// Local seed. Run with: pnpm cms:seed. It creates no users and no passwords: the owner registers at /admin.
// 1. Copies the owner-confirmed facts from src/lib/data/site-facts.ts into the site-facts global.
// 2. Creates a published row in "pages" for each built-in page (the 3 hand-built and the 21 from the sitemap)
//    that does not have one yet. Items flagged needsConfirmation stay hidden until the owner unticks them.
// 3. Saves the default header menu into the navigation global when no menu is saved.
// Existing rows and menus are left alone, so edits made in the admin are never overwritten. The one
// addition to an existing published page is a card's "Read more" section on items whose section is still
// completely empty.
// To replace chosen pages with the built-in copy on purpose, name them in SEED_REFRESH_PAGES:
//   SEED_REFRESH_PAGES=industries,ind-logistics pnpm cms:seed
// Only those rows are overwritten; anything an editor changed in them is lost, so use it before launch only.
import { getPayload } from "payload";

import config from "../src/payload.config";
import { contactPage, forkliftRentalPage, requestQuotePage, type PageContent } from "../src/lib/data/pages";
import { defaultNavigation } from "../src/lib/data/navigation";
import { sitemapPageList } from "../src/lib/data/sitemap-pages";
import { fillMissingDetails, toDetailsRow } from "../src/lib/cms/details-backfill";
import { siteFacts } from "../src/lib/data/site-facts";

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

process.exit(0);
