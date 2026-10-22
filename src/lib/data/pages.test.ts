import { describe, expect, it } from "vitest";

import {
  leadTypeForCategory,
  resolveIntent,
  safeFromPath,
} from "@/lib/leads/intents";

import { contactPage, forkliftRentalPage, requestQuotePage, visibleSections } from "./pages";
import { contactChannels, siteFacts, type SiteFacts } from "./site-facts";

const allPages = [requestQuotePage, contactPage, forkliftRentalPage];

// Every fact unset, so these tests do not change when the owner confirms more facts.
const noFacts = Object.fromEntries(Object.keys(siteFacts).map((key) => [key, null])) as SiteFacts;

function titles(sections: ReturnType<typeof visibleSections>) {
  return sections.flatMap((section) => section.items.map((item) => item.title));
}

describe("content pages", () => {
  it("never publishes placeholder or unsafe claims", () => {
    const text = JSON.stringify(allPages);

    expect(text).not.toMatch(/\[\[?confirm/i);
    expect(text).not.toMatch(
      /cheapest|guaranteed lowest|always available|official distributor|authorised dealer|authorized dealer|best in laos/i,
    );
  });

  it("only holds real values in site facts, never masked or bracketed placeholders", () => {
    for (const [key, value] of Object.entries(siteFacts)) {
      if (value) {
        expect(value, key).not.toMatch(/x{3,}|\[|\]|confirm|todo/i);
      }
    }
  });

  it("hides every item bound to an unset fact", () => {
    expect(visibleSections(contactPage, noFacts).map((section) => section.title)).not.toContain(
      "Reach us directly",
    );
    expect(titles(visibleSections(forkliftRentalPage, noFacts))).not.toContain("Do you deliver?");
    expect(titles(visibleSections(forkliftRentalPage, noFacts))).not.toContain(
      "Which forklift brands do you supply?",
    );
    expect(titles(visibleSections(requestQuotePage, noFacts))).not.toContain("How fast will you reply?");
  });

  it("shows fact-bound items once the owner confirms the fact", () => {
    const facts: SiteFacts = { ...noFacts, phone: "+856 20 000 0000", deliveryCoverage: "Test" };
    const contact = visibleSections(contactPage, facts).find(
      (section) => section.title === "Reach us directly",
    );

    expect(contact?.items).toEqual([
      { title: "Phone", description: "+856 20 000 0000", href: undefined },
    ]);
    expect(titles(visibleSections(forkliftRentalPage, facts))).toContain("Do you deliver?");
  });

  it("shows the confirmed Facebook page and brand answer today", () => {
    expect(titles(visibleSections(contactPage))).toContain("Facebook");
    expect(titles(visibleSections(forkliftRentalPage))).toContain("Which forklift brands do you supply?");
  });

  it("links to a planned route only after it is published", () => {
    const cards = visibleSections(forkliftRentalPage).find((section) => section.kind === "cards");

    expect(cards?.items.every((item) => item.href === undefined)).toBe(true);
  });
});

describe("contact channels", () => {
  it("lists phone, WhatsApp and Facebook together when all are set", () => {
    const channels = contactChannels({
      ...noFacts,
      phone: "+856 20 000 0000",
      whatsapp: "+856 20 111 1111",
      facebook: "https://www.facebook.com/DKLAOonline",
    });

    expect(channels.map((channel) => channel.label)).toEqual(["Phone", "WhatsApp", "Facebook"]);
    expect(channels[0].href).toBe("tel:+856200000000");
    expect(channels[1].href).toBe("https://wa.me/856201111111");
    expect(channels[2].text).toBe("facebook.com/DKLAOonline");
  });

  it("returns only confirmed channels", () => {
    expect(contactChannels(noFacts)).toEqual([]);
    expect(contactChannels().map((channel) => channel.label)).toContain("Facebook");
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
