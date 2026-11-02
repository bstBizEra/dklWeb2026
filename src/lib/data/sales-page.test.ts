/**
 * The forklift sales page after stage 5 of the feature-branch port: it gains a form section with
 * the forklift sales inquiry form, in English and Lao at the same place.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("forklift sales page", () => {
  it("uses the forklift sales inquiry form", () => {
    const source = readFileSync(join(process.cwd(), "src", "components", "dklao", "content-page.tsx"), "utf8");
    expect(source).toMatch(/pageId === "sales"[\s\S]{0,200}<SalesInquiryForm/);
  });
});

describe("forklift sales page sections", () => {
  it("ends with the inquiry form in English and Lao", async () => {
    const { sitemapPagesFor } = await import("./sitemap-pages");
    const en = sitemapPagesFor("en").sales.sections;
    const lo = sitemapPagesFor("lo").sales.sections;

    expect(en.at(-1)?.kind).toBe("form");
    expect(lo.length).toBe(en.length);
    expect(lo.at(-1)?.title).toMatch(/[\u0E80-\u0EFF]/);
  });
});
