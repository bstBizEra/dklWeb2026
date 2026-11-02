/**
 * The forklift rental page after stage 6 of the feature-branch port: it gains a form section with the
 * rental inquiry form, in English and Lao at the same place.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { forkliftRentalPage, localizePage } from "./pages";

describe("forklift rental page", () => {
  it("uses the rental inquiry form", () => {
    const source = readFileSync(join(process.cwd(), "src", "components", "dklao", "content-page.tsx"), "utf8");
    expect(source).toMatch(/pageId === "rental"[\s\S]{0,200}<RentalInquiryForm/);
  });

  it("ends with the inquiry form in English and Lao", () => {
    const en = forkliftRentalPage.sections;
    const lo = localizePage(forkliftRentalPage, "lo").sections;

    expect(en.at(-1)?.kind).toBe("form");
    expect(lo.length).toBe(en.length);
    expect(lo.at(-1)?.title).toMatch(/[\u0E80-\u0EFF]/);
  });
});
