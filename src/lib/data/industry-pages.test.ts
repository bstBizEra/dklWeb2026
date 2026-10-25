/**
 * Industries hub and sector pages: every industry card leads to its own page, and every sector page
 * walks the same buyer journey (docs/industries-journey.md) and ends in a quote with its category set.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { industryPageList } from "./industry-pages";
import { relatedToShow, visibleSections } from "./pages";
import { breadcrumbTrail, getRoute, isPublishedRoute, routeIntent } from "./routes";
import { siteFacts } from "./site-facts";

const hub = industryPageList.find((page) => page.id === "industries")!;
const sectors = industryPageList.filter((page) => page.id !== "industries");
const journey = ["list", "cards", "steps", "list", "faq"];

describe("industries", () => {
  it("links every hub card to its own published sector page", () => {
    const cards = hub.sections.find((section) => section.title === "Choose your industry")!.items;
    const targets = cards.map((card) => card.routeId);

    expect(cards).toHaveLength(6);
    expect(new Set(targets).size).toBe(6);
    for (const card of cards) {
      expect(card.routeId, card.title).not.toBe("industries");
      expect(isPublishedRoute(card.routeId!), card.title).toBe(true);
      expect(card.description, card.title).toBeTruthy();
    }
  });

  it("gives every sector page the same journey: pains, recommendations, steps, quote details, FAQ", () => {
    expect(sectors).toHaveLength(6);
    for (const page of sectors) {
      expect(visibleSections(page, siteFacts).map((section) => section.kind), page.id).toEqual(journey);
    }
  });

  it("recommends only published solution pages", () => {
    for (const page of sectors) {
      const recommend = page.sections.find((section) => section.title === "What we recommend")!;

      expect(recommend.items.length, page.id).toBeGreaterThanOrEqual(3);
      for (const item of recommend.items) expect(isPublishedRoute(item.routeId!), `${page.id}: ${item.title}`).toBe(true);
    }
  });

  it("asks for a quote with the page's category and source preselected", () => {
    for (const page of sectors) {
      const route = getRoute(page.id)!;
      const quote = page.ctas[0].href;

      expect(quote, page.id).toContain(`category=${routeIntent(page.id)}`);
      expect(quote, page.id).toContain(`from=${encodeURIComponent(route.href)}`);
      expect(page.closing?.primary.href, page.id).toBe(quote);
      expect(breadcrumbTrail(page.id).map((step) => step.id), page.id).toEqual(["home", "industries", page.id]);
    }
  });

  it("never repeats a card link, a breadcrumb page or the quote page under Related solutions", () => {
    for (const page of industryPageList) {
      const sections = visibleSections(page, siteFacts);
      const cardLinks = sections.flatMap((section) => section.items.map((item) => item.href)).filter(Boolean);

      for (const route of relatedToShow(page.id, sections)) {
        expect(cardLinks, `${page.id}: ${route.id}`).not.toContain(route.href);
        expect(route.group, `${page.id}: ${route.id}`).not.toBe("conversion");
        expect(breadcrumbTrail(page.id).map((step) => step.id), `${page.id}: ${route.id}`).not.toContain(route.id);
      }
    }
  });

  it("keeps case studies hidden until the owner names a real client or project", () => {
    for (const page of sectors) {
      expect(visibleSections(page, siteFacts).some((section) => section.title === "Case or example"), page.id).toBe(false);
    }
  });
});

describe("list sections", () => {
  it("sit on the page surface in columns, title over explanation, with no box", () => {
    const css = readFileSync(join(process.cwd(), "src", "app", "(site)", "globals.css"), "utf8");
    const source = readFileSync(join(process.cwd(), "src", "components", "dklao", "content-page.tsx"), "utf8");
    expect(source).toMatch(/className="page-list [^"]*grid-cols-\[repeat\(auto-fit,minmax\(260px,1fr\)\)\]/);
    expect(source).toMatch(/<strong className="text-\[17px\]/);
    expect(source).toMatch(/<span className="text-base/);
    // No box: the old boxed list styles are gone and the list is not wrapped in a Card.
    expect(css).not.toContain(".page-list");
  });
});
