/**
 * The sitemap lists every published route, gives a page a lastModified only when the CMS knows when it
 * really changed, and never stamps the build time on every page.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import { publishedRoutes } from "@/lib/data/routes";

const getPageDates = vi.fn();
vi.mock("@/lib/cms/pages", () => ({ getPageDates: () => getPageDates() }));

const { default: sitemap, revalidate } = await import("./sitemap");

afterEach(() => getPageDates.mockReset());

describe("sitemap", () => {
  it("lists every published route without a made-up lastModified when there are no CMS dates", async () => {
    getPageDates.mockResolvedValue(new Map());
    const entries = await sitemap();

    expect(entries).toHaveLength(publishedRoutes().length);
    expect(entries.every((entry) => entry.lastModified === undefined)).toBe(true);
  });

  it("uses the CMS page's real last change where there is one", async () => {
    const changed = new Date("2026-10-20T08:00:00Z");
    getPageDates.mockResolvedValue(new Map([["about", changed]]));
    const entries = await sitemap();

    expect(entries.find((entry) => entry.url.endsWith("/about"))?.lastModified).toEqual(changed);
    expect(entries.filter((entry) => entry.lastModified)).toHaveLength(1);
  });

  it("is rebuilt on the running server, where the CMS is reachable", () => {
    expect(revalidate).toBe(3600);
  });
});
