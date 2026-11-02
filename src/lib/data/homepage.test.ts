import { describe, expect, it } from "vitest";

import {
  homepageCtas,
  homepageFor,
  industrySolutions,
  productCategories,
  quickQuoteActions,
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

  // Stage 8 of the feature-branch port: homepage actions open the page forms ported in stages 1 to 7, on this
  // branch's URLs, and the solution cards gain warehouse and cleaning.
  it("sends service-led homepage actions straight to the page forms", () => {
    expect(homepageCtas.find((cta) => cta.label === "Book Maintenance Service")?.href).toBe("/maintenance-service#service-booking");
    expect(quickQuoteActions.map((action) => action.href)).toEqual([
      "/forklift-rental#rental-inquiry",
      "/maintenance-service#service-booking",
      "/spare-parts#parts-request",
      "/warehouse-equipment#warehouse-inquiry",
    ]);
  });

  it("shows warehouse and cleaning among the solution cards, in English and Lao", () => {
    expect(solutionCards.slice(4).map((card) => card.href)).toEqual(["/warehouse-equipment", "/cleaning-equipment#cleaning-request"]);
    const lo = homepageFor("lo").solutionCards;
    expect(lo).toHaveLength(solutionCards.length);
    expect(lo.slice(4).every((card) => /[຀-໿]/.test(card.title + card.description + card.ctaLabel))).toBe(true);
  });

  it("defines industry solution CTAs for operational buyers", () => {
    expect(industrySolutions.length).toBeGreaterThanOrEqual(4);
    expect(industrySolutions.every((item) => item.ctaLabel.length > 0)).toBe(
      true,
    );
  });
});
