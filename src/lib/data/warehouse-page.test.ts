/**
 * The warehouse page after stage 4 of the feature-branch port: it gains a form section with
 * the warehouse inquiry form, in English and Lao at the same place.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("warehouse page", () => {
  it("uses the warehouse inquiry form", () => {
    const source = readFileSync(join(process.cwd(), "src", "components", "dklao", "content-page.tsx"), "utf8");
    expect(source).toMatch(/pageId === "warehouse"[\s\S]{0,200}<WarehouseInquiryForm/);
  });
});

describe("warehouse page sections", () => {
  it("ends with the inquiry form in English and Lao", async () => {
    const { sitemapPagesFor } = await import("./sitemap-pages");
    const en = sitemapPagesFor("en").warehouse.sections;
    const lo = sitemapPagesFor("lo").warehouse.sections;

    expect(en.at(-1)?.kind).toBe("form");
    expect(lo.length).toBe(en.length);
    expect(lo.at(-1)?.title).toMatch(/[\u0E80-\u0EFF]/);
  });
});
