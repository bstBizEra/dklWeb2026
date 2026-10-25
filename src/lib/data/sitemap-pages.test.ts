/**
 * The 16 sitemap pages and the menu. Rules: nothing unconfirmed renders, no author notes leak into the
 * copy, titles and descriptions stay inside search limits, every page asks for a quote and links onward,
 * and the header menu only ever points at published pages.
 */
import { describe, expect, it } from "vitest";

import { navFromDoc } from "@/lib/cms/navigation";

import { defaultNavigation, resolveNavigation } from "./navigation";
import { visibleSections, type PageContent } from "./pages";
import { breadcrumbTrail, getRoute, isPublishedRoute, publishedRoutes, relatedRoutes, routeIntent } from "./routes";
import { siteFacts, type SiteFacts } from "./site-facts";
import { sitemapPageList, sitemapPages } from "./sitemap-pages";

const noFacts = Object.fromEntries(Object.keys(siteFacts).map((key) => [key, null])) as SiteFacts;
const visibleText = (page: PageContent) =>
  JSON.stringify([page.eyebrow, page.h1, page.intro, page.ctas, visibleSections(page, noFacts), page.closing]);

describe("sitemap pages", () => {
  it("covers the 21 pages that have no file of their own", () => {
    expect(sitemapPageList.map((page) => page.id).sort()).toEqual(
      [
        "article", "batteries", "cleaning", "ind-construction", "ind-food-beverage", "ind-hospitality", "ind-logistics",
        "ind-manufacturing", "ind-retail", "industries", "knowledge", "maintenance", "material",
        "parts", "racking", "rental-long", "rental-short", "sales", "sales-new", "sales-used", "warehouse",
      ].sort(),
    );
    for (const page of sitemapPageList) expect(isPublishedRoute(page.id), page.id).toBe(true);
  });

  it("keeps search titles and descriptions within limits", () => {
    for (const page of sitemapPageList) {
      expect(page.metaTitle.length + " | DK LAO".length, page.id).toBeLessThanOrEqual(60);
      expect(page.metaDescription.length, page.id).toBeLessThanOrEqual(155);
      expect(page.h1.length, page.id).toBeGreaterThan(10);
    }
  });

  it("never stores or shows [CONFIRM] markers or author notes", () => {
    for (const page of sitemapPageList) {
      expect(JSON.stringify(page), page.id).not.toMatch(/\[\[|\[confirm|confirm\]/i);
      expect(visibleText(page), page.id).not.toMatch(
        /stock cards appear|show a labelled|explain what|byline, date|real photo|nameplate diagram|\bCMS\b|template|H2 section|question-style/i,
      );
    }
  });

  it("hides draft wording until the owner confirms it", () => {
    const flagged = sitemapPageList.flatMap((page) =>
      page.sections.flatMap((section) =>
        section.items.filter((item) => item.needsConfirmation).map((item) => ({ page, section: section.title, item })),
      ),
    );
    expect(flagged.length).toBeGreaterThan(30);

    for (const { page, section, item } of flagged) {
      // Compare inside the same section: another section may legitimately use the same word.
      const shown = visibleSections(page, noFacts)
        .filter((visible) => visible.title === section)
        .flatMap((visible) => visible.items.map((shownItem) => shownItem.title));
      expect(shown, `${page.id} / ${section}: ${item.title}`).not.toContain(item.title);
    }

    // Once the owner unticks it, the same item shows.
    const electric = sitemapPages["sales-new"];
    const before = JSON.stringify(visibleSections(electric, noFacts));
    expect(before).not.toContain("Indoor, clean, quiet");
    const confirmed = {
      ...electric,
      sections: electric.sections.map((section) => ({
        ...section,
        items: section.items.map((item) => ({ ...item, needsConfirmation: false })),
      })),
    };
    expect(JSON.stringify(visibleSections(confirmed, noFacts))).toContain("Indoor, clean, quiet");
  });

  it("shows real content on every page, and asks for a quote", () => {
    for (const page of sitemapPageList) {
      expect(visibleSections(page, noFacts).length, page.id).toBeGreaterThanOrEqual(1);
      expect(page.closing?.primary.href, page.id).toMatch(/^\/request-quote/);
      expect(page.ctas.every((cta) => cta.href.startsWith("/")), page.id).toBe(true);
    }
  });

  it("links onward: at least three related pages, and only to published routes", () => {
    for (const page of sitemapPageList) {
      expect(relatedRoutes(page.id).length, page.id).toBeGreaterThanOrEqual(3);
      for (const section of page.sections) {
        for (const item of section.items) {
          if (item.routeId) expect(isPublishedRoute(item.routeId), `${page.id} -> ${item.routeId}`).toBe(true);
        }
      }
    }
  });

  it("preselects the right quote category", () => {
    expect(routeIntent("maintenance")).toBe("service");
    expect(routeIntent("sales-used")).toBe("used");
    expect(sitemapPages["rental-short"].ctas[0].href).toBe("/request-quote?category=rental&from=%2Fforklift-rental%2Fshort-term");
  });

  it("builds breadcrumbs from Home down", () => {
    expect(breadcrumbTrail("rental-short").map((route) => route.id)).toEqual(["home", "rental", "rental-short"]);
    expect(breadcrumbTrail("material").map((route) => route.id)).toEqual(["home", "warehouse", "material"]);
    expect(breadcrumbTrail("rental").map((route) => route.id)).toEqual(["home", "rental"]);
    expect(breadcrumbTrail("home").map((route) => route.id)).toEqual(["home"]);
  });

  it("keeps the New and Used forklift cards and their links on the sales page, with unconfirmed claims hidden", () => {
    const shown = visibleSections(sitemapPages.sales, noFacts).find((section) => section.title === "Choose your path");
    expect(shown?.items.map((item) => [item.title, item.href])).toEqual([
      ["New forklifts", "/forklift-sales/new"],
      ["Used forklifts", "/forklift-sales/used"],
    ]);
    expect(JSON.stringify(shown)).not.toMatch(/warranty|inspection/i);

    // The draft claims are still stored, so the owner can confirm them later.
    const stored = sitemapPages.sales.sections.find((section) => section.title === "Choose your path");
    expect(stored?.items.filter((item) => item.needsConfirmation).map((item) => item.title)).toEqual([
      "Warranty and service history",
      "Inspection offer",
    ]);
  });

  it("never loses a link to a child page because of an unconfirmed claim", () => {
    for (const page of sitemapPageList) {
      const shownLinks = new Set(
        visibleSections(page, noFacts).flatMap((section) => section.items.map((item) => item.href).filter(Boolean)),
      );
      for (const section of page.sections) {
        for (const item of section.items) {
          if (item.needsConfirmation && item.routeId) {
            expect(shownLinks.has(getRoute(item.routeId)?.href), `${page.id}: ${item.title}`).toBe(true);
          }
        }
      }
    }
  });

  it("marks the brand section as a fact, not a claim", () => {
    const brands = sitemapPages.sales.sections.find((section) => section.title === "Brands we supply");
    expect(brands?.items[0].fact).toBe("brands");
  });
});

describe("header menu", () => {
  it("has a Solutions dropdown of seven pages and four direct links", () => {
    const menu = resolveNavigation(defaultNavigation);
    expect(menu.map((item) => item.label)).toEqual(["Solutions", "Industries", "Knowledge", "About", "Contact"]);
    expect(menu[0].children?.map((link) => link.href)).toEqual([
      "/forklift-rental", "/forklift-sales", "/maintenance-service", "/spare-parts",
      "/batteries-chargers", "/warehouse-equipment", "/cleaning-equipment",
    ]);
    expect(menu.slice(1).every((item) => item.href && !item.children)).toBe(true);
  });

  it("drops links to unknown pages and empty dropdowns", () => {
    const menu = resolveNavigation([
      { label: "Ghost", routeId: "no-such-route" },
      { label: "Empty", children: [{ label: "Nope", routeId: "no-such-route" }] },
      { label: "Home", routeId: "home" },
    ]);
    expect(menu.map((item) => item.label)).toEqual(["Home"]);
  });

  it("maps a saved menu row, and falls back when it is empty", () => {
    const items = navFromDoc({
      items: [
        { label: "Services", children: [{ label: "Fix", routeId: "maintenance", description: "d" }, { label: "", routeId: "x" }] },
        { label: "Us", routeId: "about" },
        { label: "", routeId: "contact" },
      ],
    });
    expect(items).toEqual([
      { label: "Services", children: [{ label: "Fix", routeId: "maintenance", description: "d" }] },
      { label: "Us", routeId: "about" },
    ]);
    expect(navFromDoc(null)).toEqual([]);
  });

  it("only links published routes", () => {
    const published = publishedRoutes().map((route) => route.href);
    for (const item of resolveNavigation()) {
      const hrefs = item.children ? item.children.map((link) => link.href) : [item.href as string];
      for (const href of hrefs) expect(published, href).toContain(href);
    }
  });
});
