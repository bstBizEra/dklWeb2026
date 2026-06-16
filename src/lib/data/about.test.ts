import { describe, expect, it } from "vitest";

import {
  aboutHeroCtas,
  aboutSolutions,
  companySnapshot,
  servedIndustries,
  servicePromiseSteps,
} from "./about";

describe("about page content", () => {
  it("defines the approved About DK LAO conversion actions", () => {
    expect(aboutHeroCtas.map((cta) => cta.label)).toEqual(
      expect.arrayContaining(["Request a Quote", "View Our Solutions", "Contact DK LAO"]),
    );
  });

  it("covers the required DK LAO about page business scope", () => {
    const searchableContent = [
      ...companySnapshot.map((item) => `${item.label} ${item.value} ${item.detail}`),
      ...aboutSolutions.map((item) => `${item.title} ${item.description}`),
      ...servedIndustries.map((item) => `${item.title} ${item.description}`),
      servicePromiseSteps.join(" "),
    ].join(" ");

    expect(searchableContent).toContain("Since 2010");
    expect(searchableContent).toContain("Forklift Rental");
    expect(searchableContent).toContain("Spare Parts");
    expect(searchableContent).toContain("Warehouse");
    expect(searchableContent).toContain("Professional Cleaning Equipment");
    expect(searchableContent).not.toMatch(
      /cheapest|guaranteed lowest|always available|official distributor/i,
    );
  });
});
