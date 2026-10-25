/**
 * Social share images: every published page has its own 1200x630 card, and every page's metadata points at it.
 */
import { describe, expect, it } from "vitest";

import { buildMetadata, contactPage } from "./pages";
import { publishedRoutes } from "./routes";
import { shareCards, shareImage } from "./share";

describe("social share images", () => {
  it("has a card for every published page, with a heading and an eyebrow", () => {
    for (const route of publishedRoutes()) {
      const card = shareCards()[route.id];

      expect(card, route.id).toBeDefined();
      expect(card.title.length, route.id).toBeGreaterThan(3);
      expect(card.eyebrow.length, route.id).toBeGreaterThan(3);
    }
  });

  it("points at the page's own 1200x630 image, and falls back to Home for an unknown page", () => {
    expect(shareImage("about")).toMatchObject({ url: "/og/about", width: 1200, height: 630 });
    expect(shareImage("no-such-page").url).toBe("/og/home");
  });

  it("uses the share image in the page metadata", () => {
    const images = buildMetadata(contactPage).openGraph?.images;

    expect(images).toEqual([shareImage(contactPage.id)]);
  });
});
