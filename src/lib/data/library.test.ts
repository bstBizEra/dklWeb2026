/**
 * Photo library: every topic has a WebP file and a licence row, every content page has a hero photo,
 * and cards pick the photo of the page they link to, or one that matches their title.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { isOwnPhoto, libraryImage, libraryTopics, pageTopics, topicForCard, topicForPage } from "./library";
import { contactPage, forkliftRentalPage, requestQuotePage } from "./pages";
import { sitemapPageList } from "./sitemap-pages";

const file = (path: string) => join(process.cwd(), "public", path);
const register = readFileSync(file("images/library/LICENCES.md"), "utf8");

describe("photo library", () => {
  it("has one WebP per topic, 16:10 and under 400 KB", () => {
    for (const topic of libraryTopics) {
      const path = file(libraryImage(topic));
      const bytes = readFileSync(path);

      expect(existsSync(path), topic).toBe(true);
      expect(bytes.subarray(0, 4).toString(), topic).toBe("RIFF");
      expect(bytes.subarray(8, 12).toString(), topic).toBe("WEBP");
      expect(statSync(path).size, topic).toBeLessThan(400_000);
    }
  });

  it("records the source, photographer and licence of every file", () => {
    for (const topic of libraryTopics) {
      const row = register.split("\n").find((line) => line.startsWith(`| ${topic}.webp |`));

      expect(row, topic).toBeDefined();
      expect(row, topic).toMatch(/https:\/\/(unsplash\.com|www\.pexels\.com|commons\.wikimedia\.org)\/|\| DK LAO archive: /);
      expect(row, topic).toMatch(/\| (Unsplash|Pexels|Public domain|DK LAO|Nilfisk dealer material|LPI dealer material|Jungheinrich dealer material) \|/);
    }
  });

  it("gives every content page a hero photo from the library", () => {
    for (const page of [forkliftRentalPage, contactPage, requestQuotePage, ...sitemapPageList]) {
      expect(libraryTopics, page.id).toContain(topicForPage(page.id));
    }
    for (const topic of Object.values(pageTopics)) expect(libraryTopics).toContain(topic);
  });

  it("reuses the linked page's photo on a card", () => {
    expect(topicForCard({ title: "Anything", routeId: "maintenance" }, "rental")).toBe("maintenance");
    expect(topicForCard({ title: "Anything", href: "/forklift-rental/short-term" }, "sales")).toBe(topicForPage("rental-short"));
  });

  it("matches a card that links back to its own page by title, not the hero photo", () => {
    expect(topicForCard({ title: "Manufacturing", href: "/industries" }, "industries")).toBe("manufacturing");
  });

  it("matches unlinked cards by their title", () => {
    const cases: [string, string][] = [
      ["Tyres and wheels", "tyres"],
      ["Batteries and chargers", "batteries"],
      ["Hydraulic parts", "maintenance"],
      ["Filters and fluids", "filters"],
      ["Lights and safety devices", "safety"],
      ["Logistics and warehousing", "logistics"],
      ["Manufacturing", "manufacturing"],
      ["Construction", "construction"],
      ["Food and beverage", "food-beverage"],
      ["Retail and wholesale", "retail"],
      ["Hospitality and facilities", "hospitality"],
      ["What to check on a used forklift", "knowledge"],
      ["Choosing a floor scrubber", "cleaning"],
    ];

    for (const [title, topic] of cases) expect(topicForCard({ title }, "industries"), title).toBe(topic);
  });

  it("marks exactly the DK LAO-licensed photos as own, so only stock photos get the illustration treatment", () => {
    for (const topic of libraryTopics) {
      const row = register.split("\n").find((line) => line.startsWith(`| ${topic}.webp |`)) ?? "";
      expect(isOwnPhoto(topic), topic).toBe(/\| DK LAO \|/.test(row));
    }
  });

  it("shows card photos in original colour, turns them brand blue on hover or focus, and stripes stock photos", () => {
    const page = readFileSync(join(process.cwd(), "src", "components", "dklao", "content-page.tsx"), "utf8");

    expect(page).not.toContain("mix-blend-luminosity");
    expect(page).toMatch(/bg-brand-blue opacity-0 mix-blend-color[^"]*group-focus-within:opacity-100 group-hover:opacity-100/);
    expect(page).toContain("const stock = !isOwnPhoto(topic);");
  });

  it("gives Preventive maintenance and Breakdown repair different photos on the Maintenance page", () => {
    const preventive = topicForCard({ title: "Preventive maintenance" }, "maintenance");
    const breakdown = topicForCard({ title: "Breakdown repair" }, "maintenance");

    expect(breakdown).toBe("maintenance");
    expect(preventive).toBe("preventive");
    expect(preventive).not.toBe(breakdown);
  });

  it("is wired into the content page as a decorative hero photo and card images", () => {
    const source = readFileSync(join(process.cwd(), "src", "components", "dklao", "content-page.tsx"), "utf8");
    const css = readFileSync(join(process.cwd(), "src", "app", "(site)", "globals.css"), "utf8");

    expect(source).toContain("page-hero__photo");
    expect(source).toContain('alt=""');
    expect(source).toContain("topic={topicForCard(");
    expect(source).toMatch(/page-card__media[^"]*aspect-\[16\/10\]/);
    expect(source).toContain("rgba(7,17,31,0.95)");
    expect(css).not.toContain(".page-card__media");
  });
});
