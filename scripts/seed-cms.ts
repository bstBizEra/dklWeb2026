// Local seed. Run with: pnpm cms:seed. It creates no users and no passwords: the owner registers at /admin.
// 1. Copies the owner-confirmed facts from src/lib/data/site-facts.ts into the site-facts global.
// 2. Creates a published row in "pages" for each built-in page that does not have one yet.
//    Existing rows are left alone, so edits made in the admin are never overwritten.
import { getPayload } from "payload";

import config from "../src/payload.config";
import { contactPage, forkliftRentalPage, requestQuotePage, type PageContent } from "../src/lib/data/pages";
import { siteFacts } from "../src/lib/data/site-facts";

const payload = await getPayload({ config });

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
      items: section.items.map((item) => ({
        title: item.title,
        description: item.description,
        routeId: item.routeId,
        fact: item.fact,
      })),
    })),
    closing: page.closing
      ? { title: page.closing.title, copy: page.closing.copy, primary: page.closing.primary, secondary: page.closing.secondary }
      : undefined,
    _status: "published" as const,
  };
}

for (const page of [requestQuotePage, contactPage, forkliftRentalPage]) {
  const existing = await payload.find({
    collection: "pages",
    where: { routeId: { equals: page.id } },
    limit: 1,
    draft: true,
    overrideAccess: true,
  });
  if (existing.totalDocs > 0) {
    payload.logger.info(`page "${page.id}" already exists, left unchanged`);
    continue;
  }
  await payload.create({ collection: "pages", data: toRow(page), overrideAccess: true });
  payload.logger.info(`page "${page.id}" created`);
}

process.exit(0);
