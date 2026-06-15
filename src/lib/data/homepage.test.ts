import { describe, expect, it } from "vitest";

import {
  homepageCtas,
  industrySolutions,
  productCategories,
  solutionCards,
} from "./homepage";

describe("homepage content", () => {
  it("includes the required homepage conversion actions", () => {
    expect(homepageCtas.map((cta) => cta.label)).toEqual(
      expect.arrayContaining([
        "Request a Quote",
        "View Rental Fleet",
        "Book Maintenance Service",
      ]),
    );
  });

  it("covers DK LAO core business categories without fake pricing", () => {
    const searchableContent = [
      ...solutionCards.map((item) => `${item.title} ${item.description}`),
      ...productCategories.map((item) => `${item.title} ${item.description}`),
    ].join(" ");

    expect(searchableContent).toContain("Forklift rental");
    expect(searchableContent).toContain("Spare parts");
    expect(searchableContent).toContain("Cleaning equipment");
    expect(searchableContent).not.toMatch(/\$|LAK|USD|price from|in stock/i);
  });

  it("defines industry solution CTAs for operational buyers", () => {
    expect(industrySolutions.length).toBeGreaterThanOrEqual(4);
    expect(industrySolutions.every((item) => item.ctaLabel.length > 0)).toBe(
      true,
    );
  });
});
