/**
 * Phase 2 rules: the CMS may supply facts and pages, but nothing unconfirmed may be published.
 * An empty fact hides its item, masked numbers and [CONFIRM] markers never render, and a page
 * row from the admin behaves exactly like a built-in page.
 */
import { describe, expect, it } from "vitest";

import { Articles } from "@/payload/collections/articles";
import { Pages } from "@/payload/collections/pages";
import { publishedOrStaff } from "@/payload/access";
import { hasConfirmMarker, noConfirmMarker } from "@/lib/data/confirm";
import { contactPage, forkliftRentalPage, visibleSections, type PageContent } from "@/lib/data/pages";
import { factKeys, siteFacts } from "@/lib/data/site-facts";

import { pageFromDoc } from "./pages";
import { sanitizeFacts } from "./site-facts";

describe("confirm markers", () => {
  it("detects planning markers in any spelling", () => {
    for (const text of ["[[Areas: CONFIRM]]", "Brands [CONFIRM]", "[ confirm ]", "x [[y]]"]) {
      expect(hasConfirmMarker(text), text).toBe(true);
      expect(noConfirmMarker(text), text).not.toBe(true);
    }
    expect(hasConfirmMarker("We confirm every quotation.")).toBe(false);
    expect(noConfirmMarker("Forklift rental in Laos")).toBe(true);
  });

  it("hides items and sections whose text carries a marker, even without a bound fact", () => {
    const page: PageContent = {
      id: "rental",
      metaTitle: "t",
      metaDescription: "d",
      eyebrow: "e",
      h1: "h",
      intro: "i",
      ctas: [],
      sections: [
        { kind: "cards", title: "Visible", items: [{ title: "Ok", description: "Fine" }, { title: "Bad", description: "[[Areas: CONFIRM]]" }] },
        { kind: "cards", title: "[CONFIRM] hidden section", items: [{ title: "Anything", description: "x" }] },
      ],
    };
    const sections = visibleSections(page);
    expect(sections.map((s) => s.title)).toEqual(["Visible"]);
    expect(sections[0].items.map((i) => i.title)).toEqual(["Ok"]);
  });
});

describe("site facts from the CMS", () => {
  it("turns empty, masked and placeholder values into null", () => {
    const facts = sanitizeFacts({
      phone: "+85620xxxxxxxx",
      whatsapp: "   ",
      email: "[CONFIRM]",
      facebook: " https://www.facebook.com/DKLAOonline ",
      hours: "Open 24/7",
    });
    expect(facts.phone).toBeNull();
    expect(facts.whatsapp).toBeNull();
    expect(facts.email).toBeNull();
    expect(facts.facebook).toBe("https://www.facebook.com/DKLAOonline");
    expect(facts.hours).toBe("Open 24/7");
    expect(facts.address).toBeNull();
  });

  it("returns every fact key and tolerates a missing record", () => {
    expect(Object.keys(sanitizeFacts(null)).sort()).toEqual([...factKeys].sort());
  });

  it("keeps the admin fact choices in step with the built-in fact keys", () => {
    const pageFields = Pages.fields as { name: string; fields?: { name: string; fields?: { name: string; options?: { value: string }[] }[] }[] }[];
    const items = pageFields.find((f) => f.name === "sections")?.fields?.find((f) => f.name === "items");
    const fact = items?.fields?.find((f) => f.name === "fact");
    expect(fact?.options?.map((o) => o.value)).toEqual(Object.keys(siteFacts));
  });

  it("hides a fact-bound item once the CMS clears the fact", () => {
    const cleared = sanitizeFacts({ ...siteFacts, hours: "" });
    const titles = visibleSections(contactPage, cleared).flatMap((s) => s.items.map((i) => i.title));
    expect(titles).not.toContain("Opening hours");
    expect(titles).toContain("Facebook");
  });
});

describe("pages from the CMS", () => {
  const row = {
    routeId: "rental",
    h1: "Forklift Rental in Laos",
    metaTitle: "Rental",
    metaDescription: "Desc",
    eyebrow: "Forklift rental",
    intro: "Intro",
    ctas: [{ label: "Ask", href: "/request-quote" }, { label: "", href: "/x" }],
    sections: [
      {
        kind: "faq",
        title: "Questions",
        items: [
          { title: "Brands?", fact: "brands", description: null },
          { title: "Unknown fact", fact: "notAFact", description: "kept as plain text" },
          { title: "", description: "dropped" },
        ],
      },
      { kind: "cards", title: "[[CONFIRM]] draft section", items: [{ title: "x" }] },
    ],
    closing: { title: "Get a quote", copy: "Tell us.", primary: { label: "Go", href: "/request-quote" } },
  };

  it("maps a row to the same shape as a built-in page", () => {
    const page = pageFromDoc(row)!;
    expect(page.id).toBe("rental");
    expect(page.ctas).toEqual([{ label: "Ask", href: "/request-quote" }]);
    expect(page.closing?.primary.label).toBe("Go");
    expect(page.sections).toHaveLength(1);
    expect(page.sections[0].items.map((i) => i.title)).toEqual(["Brands?", "Unknown fact"]);
    expect(page.sections[0].items[0].fact).toBe("brands");
    expect(page.sections[0].items[1].fact).toBeUndefined();
  });

  it("refuses rows without a route id or headline", () => {
    expect(pageFromDoc({ ...row, routeId: "" })).toBeNull();
    expect(pageFromDoc({ ...row, h1: "" })).toBeNull();
  });

  it("built-in pages and CMS pages hide an empty fact the same way", () => {
    const fromCms = pageFromDoc(row)!;
    const noFacts = sanitizeFacts({});
    const cmsTitles = visibleSections(fromCms, noFacts).flatMap((s) => s.items.map((i) => i.title));
    const builtIn = visibleSections(forkliftRentalPage, noFacts).flatMap((s) => s.items.map((i) => i.title));
    expect(cmsTitles).not.toContain("Brands?");
    expect(builtIn).not.toContain("Which forklift brands do you supply?");
  });
});

describe("page and article access", () => {
  const as = (role?: string) => ({ req: { user: role ? { id: 1, role } : null } }) as never;

  it("shows visitors and advisors published rows only; owners and editors see drafts", () => {
    expect(publishedOrStaff(as())).toEqual({ _status: { equals: "published" } });
    expect(publishedOrStaff(as("advisor"))).toEqual({ _status: { equals: "published" } });
    expect(publishedOrStaff(as("editor"))).toBe(true);
    expect(publishedOrStaff(as("owner"))).toBe(true);
  });

  it("uses drafts and the same read rule on pages and articles", () => {
    for (const collection of [Pages, Articles]) {
      expect(collection.versions).toMatchObject({ drafts: true });
      expect(collection.access?.read).toBe(publishedOrStaff);
    }
  });
});
