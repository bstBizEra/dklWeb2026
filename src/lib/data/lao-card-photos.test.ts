/**
 * Card photos are matched on the English card title (library.ts). Lao pages showed the page's general
 * photo on every card instead (found 2026-11-01 on batteries, cleaning, warehouse, parts, maintenance,
 * sales and rental). A translated page keeps each card's English photo.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { topicForCard } from "./library";
import { forkliftRentalPage, localizePage, visibleSections, withPhotoTitles } from "./pages";
import { sitemapPageList } from "./sitemap-pages";

const pages = [forkliftRentalPage, ...sitemapPageList];

describe("card photos on Lao pages", () => {
  it("are the same as on the English page, card by card", () => {
    for (const english of pages) {
      const lao = withPhotoTitles(localizePage(english, "lo"), english);
      const en = visibleSections(english);
      const lo = visibleSections(lao);

      en.forEach((section, s) =>
        section.items.forEach((item, i) => {
          expect(topicForCard(lo[s].items[i], lao.id), `${english.id} ${item.title}`).toBe(topicForCard(item, english.id));
        }),
      );
    }
  });

  it("give each Lao detail section the English anchor, so Read more links stay unique", () => {
    for (const english of pages) {
      const lo = visibleSections(withPhotoTitles(localizePage(english, "lo"), english)).flatMap((section) => section.items);
      const en = visibleSections(english).flatMap((section) => section.items);
      expect(lo.map((item) => item.anchor), english.id).toEqual(en.map((item) => item.anchor));
    }
  });

  it("is applied by the content page to every Lao page", () => {
    const source = readFileSync(join(process.cwd(), "src", "components", "dklao", "content-page.tsx"), "utf8");
    expect(source).toContain('locale === "en" ? page : withPhotoTitles(page, englishPages[page.id])');
    expect(source).toContain("visibleSections(pageWithPhotos");
  });

  it("leaves English pages as they are", () => {
    expect(withPhotoTitles(forkliftRentalPage, forkliftRentalPage)).toBe(forkliftRentalPage);
  });
});
