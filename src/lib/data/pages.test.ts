import { describe, expect, it } from "vitest";

import {
  leadTypeForCategory,
  resolveIntent,
  safeFromPath,
} from "@/lib/leads/intents";

import { contactPage, forkliftRentalPage, requestQuotePage, visibleSections } from "./pages";
import { siteFacts, type SiteFacts } from "./site-facts";

const allPages = [requestQuotePage, contactPage, forkliftRentalPage];

function titles(sections: ReturnType<typeof visibleSections>) {
  return sections.flatMap((section) => section.items.map((item) => item.title));
}

describe("content pages", () => {
  it("never publishes placeholder or unsafe claims", () => {
    const text = JSON.stringify(allPages);

    expect(text).not.toMatch(/\[\[?confirm/i);
    expect(text).not.toMatch(
      /cheapest|guaranteed lowest|always available|official distributor|best in laos/i,
    );
  });

  it("hides every item bound to an unconfirmed fact", () => {
    expect(Object.values(siteFacts).every((value) => value === null)).toBe(true);

    expect(visibleSections(contactPage).map((section) => section.title)).not.toContain(
      "Reach us directly",
    );
    expect(titles(visibleSections(forkliftRentalPage))).not.toContain("Do you deliver?");
    expect(titles(visibleSections(requestQuotePage))).not.toContain("How fast will you reply?");
  });

  it("shows fact-bound items once the owner confirms the fact", () => {
    const facts: SiteFacts = { ...siteFacts, phone: "+856 00 000 000", deliveryCoverage: "Test" };
    const contact = visibleSections(contactPage, facts).find(
      (section) => section.title === "Reach us directly",
    );

    expect(contact?.items).toEqual([{ title: "Phone", description: "+856 00 000 000", href: undefined }]);
    expect(titles(visibleSections(forkliftRentalPage, facts))).toContain("Do you deliver?");
  });

  it("links to a planned route only after it is published", () => {
    const cards = visibleSections(forkliftRentalPage).find((section) => section.kind === "cards");

    expect(cards?.items.every((item) => item.href === undefined)).toBe(true);
  });
});

describe("quote intents", () => {
  it("falls back to forklift rental for unknown categories", () => {
    expect(resolveIntent("nonsense").category).toBe("Forklift rental");
    expect(resolveIntent("toString").category).toBe("Forklift rental");
    expect(resolveIntent("parts").leadType).toBe("SPARE_PARTS_INQUIRY");
  });

  it("derives the lead type from the selected category", () => {
    expect(leadTypeForCategory("Maintenance service")).toBe("SERVICE_BOOKING");
    expect(leadTypeForCategory("General inquiry")).toBe("CONTACT_GENERAL");
    expect(leadTypeForCategory("Something else")).toBe("QUOTE_REQUEST");
  });

  it("accepts only same-site paths for ?from=", () => {
    expect(safeFromPath("/forklift-rental")).toBe("/forklift-rental");
    expect(safeFromPath("//evil.example")).toBeUndefined();
    expect(safeFromPath("https://evil.example")).toBeUndefined();
    expect(safeFromPath(undefined)).toBeUndefined();
  });
});
