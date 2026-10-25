import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { publishedRoutes } from "./routes";

import {
  aboutHeroCtas,
  aboutSolutions,
  aboutTrustPoints,
  companySnapshot,
  servedIndustries,
  servicePromiseSteps,
} from "./about";

describe("about page content", () => {
  it("shows one primary and one secondary action in the hero", () => {
    expect(aboutHeroCtas.map((cta) => [cta.label, cta.variant])).toEqual([
      ["Request a Quote", "primary"],
      ["Talk to a DK LAO Advisor", "secondary"],
    ]);
    expect(aboutHeroCtas.every((cta) => cta.href.startsWith("/"))).toBe(true);
  });

  it("uses the planned hero copy: forklift and warehouse partner, no one-stop wording", () => {
    const source = readFileSync(join(process.cwd(), "src", "components", "dklao", "about-sections.tsx"), "utf8");

    expect(source).toContain("Your Forklift and Warehouse Equipment Partner in Laos");
    expect(source).not.toMatch(/one-stop/i);
    expect(source).not.toContain("about-hero__badges");
  });

  it("names the first trust card as the forklift and warehouse equipment partner", () => {
    expect(aboutTrustPoints[0].title).toBe("Forklift and warehouse equipment partner");
  });

  it("has no generic one-stop wording anywhere in the About data", () => {
    const text = JSON.stringify([
      aboutHeroCtas,
      aboutTrustPoints.map(({ title, description }) => ({ title, description })),
      aboutSolutions.map(({ title, description }) => ({ title, description })),
      companySnapshot,
      servedIndustries.map(({ title, description }) => ({ title, description })),
      servicePromiseSteps,
    ]);

    expect(text).not.toMatch(/one-stop/i);
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

describe("About industry cards", () => {
  it("are one linked card per industry page, with no card left without a page", () => {
    const industryPages = publishedRoutes().filter((route) => route.id.startsWith("ind-")).map((route) => route.href);

    expect(servedIndustries).toHaveLength(industryPages.length);
    expect(servedIndustries.map((card) => card.href).sort()).toEqual([...industryPages].sort());
  });

  it("keeps the merged sectors findable in the card wording", () => {
    const text = servedIndustries.map((card) => `${card.title} ${card.description}`).join(" ");

    for (const word of ["transport", "Industrial", "public buildings", "Warehousing"]) expect(text).toContain(word);
  });
});
