import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import sitemap from "@/app/sitemap";

import { navRoutes, publishedRoutes, quoteHref, relatedRoutes, routes } from "./routes";
import { sitemapPages } from "./sitemap-pages";

describe("route registry", () => {
  it("has unique ids and hrefs", () => {
    expect(new Set(routes.map((route) => route.id)).size).toBe(routes.length);
    expect(new Set(routes.map((route) => route.href)).size).toBe(routes.length);
  });

  it("only relates routes that exist and never to itself", () => {
    const ids = new Set(routes.map((route) => route.id));

    for (const route of routes) {
      expect(route.related).not.toContain(route.id);
      for (const relatedId of route.related) {
        expect(ids.has(relatedId), `${route.id} -> ${relatedId}`).toBe(true);
      }
    }
  });

  it("publishes a route only when its page exists: a file under src/app/(site) or built-in sitemap page data", () => {
    for (const route of publishedRoutes()) {
      const folder = route.href === "/" ? "" : route.href;
      const hasFile = existsSync(join(process.cwd(), "src", "app", "(site)", "[locale]", folder, "page.tsx"));

      expect(hasFile || route.id in sitemapPages, route.href).toBe(true);
    }
  });

  it("keeps unpublished routes out of the header, related links and sitemap", () => {
    const unpublished = routes.filter((route) => !route.published).map((route) => route.href);
    const sitemapPaths = sitemap().map((entry) => new URL(entry.url).pathname);

    expect(navRoutes().every((route) => route.published)).toBe(true);
    expect(relatedRoutes("rental").every((route) => route.published)).toBe(true);
    expect(sitemapPaths.some((path) => unpublished.includes(path))).toBe(false);
    expect(sitemapPaths).toEqual(expect.arrayContaining(["/", "/about", "/forklift-rental"]));
  });

  it("builds quote links with the category and the page they came from", () => {
    expect(quoteHref()).toBe("/request-quote");
    expect(quoteHref("rental", "/forklift-rental")).toBe(
      "/request-quote?category=rental&from=%2Fforklift-rental",
    );
  });
});
