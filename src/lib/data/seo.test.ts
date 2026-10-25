/**
 * Search text for every page. A rendered title is at most 60 characters (the " | DK LAO" suffix counts),
 * a description at most 155, neither uses a long dash, and no two pages share a title or description.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { contactPage, forkliftRentalPage, requestQuotePage } from "./pages";
import { aboutSeo, homeSeo, titleSuffix } from "./seo";
import { sitemapPageList } from "./sitemap-pages";

type Entry = { id: string; title: string; description: string };

const contentPages = [requestQuotePage, contactPage, forkliftRentalPage, ...sitemapPageList];

// Titles as a visitor sees them in the browser tab and in search results.
const entries: Entry[] = [
  { id: "home", title: homeSeo.title, description: homeSeo.description },
  { id: "about", title: aboutSeo.title + titleSuffix, description: aboutSeo.description },
  ...contentPages.map((page) => ({ id: page.id, title: page.metaTitle + titleSuffix, description: page.metaDescription })),
];

const read = (...parts: string[]) => readFileSync(join(process.cwd(), ...parts), "utf8");

describe("search titles and descriptions", () => {
  it("covers all 26 pages", () => {
    expect(entries).toHaveLength(26);
  });

  it("keeps every rendered title to 60 characters or fewer and ending in the site name", () => {
    for (const entry of entries) {
      expect(entry.title.length, `${entry.id}: ${entry.title}`).toBeLessThanOrEqual(60);
      expect(entry.title.endsWith(titleSuffix), entry.id).toBe(true);
    }
  });

  it("keeps every description between 70 and 155 characters", () => {
    for (const entry of entries) {
      expect(entry.description.length, `${entry.id}: ${entry.description}`).toBeLessThanOrEqual(155);
      expect(entry.description.length, entry.id).toBeGreaterThanOrEqual(70);
    }
  });

  it("uses no long dashes in titles or descriptions, home and about included", () => {
    const text = [...entries.flatMap((entry) => [entry.title, entry.description]), homeSeo.shareTitle, homeSeo.shareDescription, aboutSeo.shareTitle, aboutSeo.shareDescription];
    for (const value of text) expect(value, value).not.toMatch(/[–—]/);
  });

  it("gives every page its own title and its own description", () => {
    expect(new Set(entries.map((entry) => entry.title)).size).toBe(entries.length);
    expect(new Set(entries.map((entry) => entry.description)).size).toBe(entries.length);
  });

  it("keeps social titles and descriptions inside the same limits", () => {
    for (const title of [homeSeo.shareTitle, aboutSeo.shareTitle]) expect(title.length, title).toBeLessThanOrEqual(60);
    for (const description of [homeSeo.shareDescription, aboutSeo.shareDescription]) expect(description.length, description).toBeLessThanOrEqual(155);
  });

  it("reads Home and About metadata from one module, with no long text left in the pages", () => {
    const layout = read("src", "app", "(site)", "layout.tsx");
    const about = read("src", "app", "(site)", "about", "page.tsx");

    expect(layout).toContain("homeSeo");
    expect(about).toContain("aboutSeo");
    expect(layout).not.toMatch(/[–—]/);
    expect(about).not.toMatch(/Material Handling, Forklift Rental, Services/);
  });
});
