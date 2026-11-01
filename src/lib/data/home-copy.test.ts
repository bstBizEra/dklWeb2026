/**
 * Home and About copy speaks to customers. Planning notes about how the site was built (workflows, CRM,
 * "future" phases, data shapes, "fake stock" disclaimers) must never show on these pages again.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { en } from "@/messages/en";

import { relatedToShow, visibleSections } from "./pages";
import { sitemapPages } from "./sitemap-pages";
import { siteFacts } from "./site-facts";

const read = (...parts: string[]) => readFileSync(join(process.cwd(), ...parts), "utf8");
const sources = [
  read("src", "components", "dklao", "homepage-sections.tsx"),
  read("src", "components", "dklao", "quick-quote-bar.tsx"),
  read("src", "components", "dklao", "product-category-grid.tsx"),
  read("src", "components", "dklao", "about-sections.tsx"),
  read("src", "lib", "data", "homepage.ts"),
  read("src", "lib", "data", "about.ts"),
  JSON.stringify(en.home),
  JSON.stringify(en.about),
].join("\n");

describe("Home and About copy", () => {
  it("contains no internal planning notes", () => {
    const notes = /workflow|\bCRM\b|future (phase|catalog|attachment|SEO)|semi-ecommerce|data shape|structured for|fake stock|fake pricing|routes are prepared|content structure|solution path|inquiry support|without hardcoded/i;

    expect(sources).not.toMatch(notes);
  });

  it("links the Home industry cards to the industry pages", () => {
    const home = read("src", "lib", "data", "homepage.ts");

    for (const href of ["/industries/logistics-warehousing", "/industries/manufacturing", "/industries/construction"]) {
      expect(home).toContain(`href: "${href}"`);
    }
  });

  it("keeps the About closing call to action to two buttons", () => {
    const about = read("src", "components", "dklao", "about-sections.tsx");
    const cta = about.slice(about.indexOf("export function AboutFinalCTA"));

    expect(cta).toContain("secondaryLabel={t.secondary}");
    expect(en.about.final.secondary).toBe("Talk to a DK LAO Advisor");
    expect(cta).not.toContain("tertiaryLabel");
  });

  it("shows at most one row of four related solutions", () => {
    for (const page of Object.values(sitemapPages)) {
      expect(relatedToShow(page.id, visibleSections(page, siteFacts)).length, page.id).toBeLessThanOrEqual(4);
    }
  });
});
