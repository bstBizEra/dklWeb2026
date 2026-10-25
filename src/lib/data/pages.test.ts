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

  it("links to a route only while that route is published", () => {
    const cards = visibleSections(forkliftRentalPage).find((section) => section.kind === "cards");
    const rentalShort = cards?.items.find((item) => item.title === "Short-term rental");

    expect(rentalShort?.href).toBe("/forklift-rental/short-term");

    const unpublished = {
      ...forkliftRentalPage,
      sections: [{ kind: "cards" as const, title: "x", items: [{ title: "Ghost", description: "d", routeId: "no-such-route" }] }],
    };
    expect(visibleSections(unpublished)[0].items[0].href).toBeUndefined();
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

  it("gives each value of a multi-value fact its own link", () => {
    const channels = contactChannels({
      ...noFacts,
      whatsapp: "+85620 2802 3355, +85620 2323 1922",
      email: "info@dklao.com, salescenter@dklao.com",
    });

    expect(channels.map((c) => c.href)).toEqual([
      "https://wa.me/8562028023355",
      "https://wa.me/8562023231922",
      "mailto:info@dklao.com",
      "mailto:salescenter@dklao.com",
    ]);
  });

  it("publishes the contact details the owner supplied on 23 October 2026", () => {
    const hrefs = contactChannels().map((c) => c.href);

    expect(hrefs).toEqual(
      expect.arrayContaining([
        "tel:+85621480248",
        "https://wa.me/8562028023355",
        "https://wa.me/8562023231922",
        "https://wa.me/8562023231911",
        "mailto:info@dklao.com",
        "mailto:salescenter@dklao.com",
        "https://www.facebook.com/DKLAOonline",
      ]),
    );
    expect(siteFacts.address).toContain("Kamphaengmeuang");
  });

  it("labels WhatsApp numbers by team when the value says Sales or Aftersales", () => {
    const whatsapp = contactChannels().filter((c) => c.href.startsWith("https://wa.me/"));

    expect(whatsapp.map((c) => [c.label, c.href])).toEqual([
      ["WhatsApp Sales", "https://wa.me/8562028023355"],
      ["WhatsApp Aftersales", "https://wa.me/8562023231922"],
      ["WhatsApp Aftersales", "https://wa.me/8562023231911"],
    ]);
    expect(contactChannels({ ...noFacts, whatsapp: "+85620 1 2345" })[0].label).toBe("WhatsApp");
  });

  it("adds YouTube and X links after Facebook, and hides them when unset", () => {
    const withSocial = contactChannels({
      ...noFacts,
      facebook: "https://www.facebook.com/DKLAOonline",
      youtube: "https://www.youtube.com/channel/UCONgeO8Upbiwk1ba681-Erg",
      twitter: "https://twitter.com/DKLaoTrading",
    });

    expect(withSocial.map((c) => c.label)).toEqual(["Facebook", "YouTube", "X"]);
    expect(withSocial[1].text).toBe("youtube.com/channel/UCONgeO8Upbiwk1ba681-Erg");
    expect(withSocial[2]).toMatchObject({ href: "https://twitter.com/DKLaoTrading", text: "twitter.com/DKLaoTrading", external: true });
    expect(contactChannels({ ...noFacts, youtube: "https://www.youtube.com/channel/x" }).map((c) => c.label)).toEqual(["YouTube"]);
    expect(contactChannels(noFacts).some((c) => c.label === "X" || c.label === "YouTube")).toBe(false);
  });

  it("shows the supplied YouTube and X links on the Contact page rows", () => {
    const titles = visibleSections(contactPage).flatMap((s) => s.items.map((i) => i.title));

    expect(titles).toEqual(expect.arrayContaining(["Facebook", "YouTube", "X (Twitter)"]));
    expect(visibleSections(contactPage, noFacts).flatMap((s) => s.items.map((i) => i.title))).not.toContain("YouTube");
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
