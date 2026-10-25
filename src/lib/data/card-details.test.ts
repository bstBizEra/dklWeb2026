/**
 * Card sections: a card can carry editorial content (an opening paragraph, key figures, topics with their
 * own headings and a checklist), shown in its own section under the cards and reached from "Read more".
 * These tests keep the content complete and written per service (no generic What/Why/When labels), the
 * anchors unique, hidden (unconfirmed) cards out, and the CMS conversion and seed backfill in step.
 */
import { describe, expect, it } from "vitest";

import { fillMissingDetails, fromDetailsRow, toDetailsRow } from "@/lib/cms/details-backfill";
import { pageFromDoc } from "@/lib/cms/pages";

import { detailAnchor, forkliftRentalPage, visibleSections, type ItemDetails } from "./pages";
import { sitemapPageList } from "./sitemap-pages";

const pages = [forkliftRentalPage, ...sitemapPageList];
const allDetails = pages.flatMap((page) =>
  page.sections.flatMap((section) => section.items.flatMap((item) => (item.details ? [{ page: page.id, section, title: item.title, details: item.details }] : []))),
);
// The bare template labels the owner asked not to use; headings must be written for the service instead.
const genericHeading = /^(what|why|when|who|where)(\s+(it is|it matters|you need it|it suits|it applies))?\??$/i;

describe("card sections", () => {
  it("are written per service: an opening paragraph, two or more topics with their own headings, sourced figures kept short", () => {
    expect(allDetails.length).toBeGreaterThanOrEqual(8);
    for (const { page, section, title, details } of allDetails) {
      const name = `${page}: ${title}`;
      expect(section.kind, name).toBe("cards");
      expect(details.lead.length, name).toBeGreaterThan(100);
      expect(details.topics.length, name).toBeGreaterThanOrEqual(2);
      expect(new Set(details.topics.map((topic) => topic.heading)).size, name).toBe(details.topics.length);
      for (const topic of details.topics) {
        expect(topic.heading, name).not.toMatch(genericHeading);
        expect(topic.body.length, `${name}: ${topic.heading}`).toBeGreaterThan(100);
      }
      expect(details.facts?.length ?? 0, name).toBeLessThanOrEqual(3);
      for (const fact of details.facts ?? []) expect(fact.value.length, name).toBeLessThanOrEqual(12);
      if (details.checklist) expect(details.checklist.items.length, name).toBeGreaterThanOrEqual(3);
    }
  });

  it("gives each card section a unique anchor on its page, matching its Read more link", () => {
    for (const page of pages) {
      const anchors = visibleSections(page).flatMap((section) => section.items.flatMap((item) => (item.anchor ? [item.anchor] : [])));
      expect(new Set(anchors).size, page.id).toBe(anchors.length);
      for (const anchor of anchors) expect(anchor).toMatch(/^detail-[a-z0-9-]+$/);
    }
    expect(detailAnchor("Lights & safety devices")).toBe("detail-lights-and-safety-devices");
  });

  it("covers the in-page cards on Maintenance and Spare Parts", () => {
    const titles = (id: string) =>
      visibleSections(pages.find((page) => page.id === id)!).flatMap((section) => section.items.flatMap((item) => (item.anchor ? [item.title] : [])));

    expect(titles("maintenance")).toEqual(["Preventive maintenance", "Breakdown repair", "Inspection"]);
    expect(titles("parts")).toEqual(["Filters and fluids", "Tyres and wheels", "Forks and attachments", "Hydraulic parts", "Lights and safety devices"]);
    for (const id of ["batteries", "rental", "sales", "warehouse", "cleaning"]) expect(titles(id).length, id).toBeGreaterThanOrEqual(3);
    expect(titles("industries")).toHaveLength(6);
    // Every "What we recommend" card on every industry page has its own section.
    for (const page of pages.filter((candidate) => candidate.id.startsWith("ind-"))) {
      const recommend = page.sections.find((section) => section.title === "What we recommend")!;
      expect(titles(page.id), page.id).toEqual(recommend.items.map((item) => item.title));
    }
  });

  it("never shows a section for a hidden card or incomplete content", () => {
    const complete: ItemDetails = { lead: "Lead", topics: [{ heading: "A", body: "a" }, { heading: "B", body: "b" }] };
    const page = {
      ...forkliftRentalPage,
      sections: [
        {
          kind: "cards" as const,
          title: "Test",
          items: [
            { title: "Hidden", needsConfirmation: true, details: complete },
            { title: "One topic", details: { lead: "Lead", topics: [{ heading: "A", body: "a" }] } },
            { title: "Complete", details: complete },
          ],
        },
      ],
    };
    const items = visibleSections(page).flatMap((section) => section.items);
    expect(items.map((item) => [item.title, Boolean(item.anchor)])).toEqual([
      ["One topic", false],
      ["Complete", true],
    ]);
  });

  it("converts to the admin row and back without losing anything", () => {
    for (const { details } of allDetails) expect(fromDetailsRow(toDetailsRow(details))).toEqual(details);
    expect(fromDetailsRow({ lead: "Lead", topics: [{ heading: "Only one", body: "Body" }] })).toBeUndefined();
    expect(fromDetailsRow({ lead: "", topics: [] })).toBeUndefined();
  });

  it("reads a card section from a CMS page row", () => {
    const details = allDetails[0].details;
    const page = pageFromDoc({
      routeId: "maintenance",
      h1: "Maintenance",
      sections: [{ kind: "cards", title: "Cards", items: [{ title: "With", details: toDetailsRow(details) }, { title: "Without", details: { lead: null, topics: [] } }] }],
    });

    expect(page?.sections[0].items[0].details).toEqual(details);
    expect(page?.sections[0].items[1].details).toBeUndefined();
  });

  it("backfills existing CMS rows only where an item's section is still empty", () => {
    const maintenance = pages.find((page) => page.id === "maintenance")!;
    const rows = [
      {
        kind: "cards",
        title: "What we service",
        items: [
          { id: "a", title: "Preventive maintenance", details: { lead: null, facts: [], topics: [], checklistHeading: null, checklist: [] } },
          { id: "b", title: "Breakdown repair", details: { lead: "Editor wording", topics: [] } },
          { id: "c", title: "Inspection" },
          { id: "d", title: "Not in the built-in page" },
        ],
      },
      { kind: "faq", title: "Maintenance questions", items: [{ title: "Preventive maintenance" }] },
    ];

    const { sections, filled } = fillMissingDetails(rows, maintenance.sections);
    const items = sections[0].items as { details?: { lead?: string | null } }[];

    expect(filled).toBe(2);
    expect(items[0].details?.lead).toMatch(/serviced on schedule/i);
    expect(items[1].details?.lead).toBe("Editor wording");
    expect(items[2].details?.lead).toMatch(/thorough inspection/i);
    expect(items[3].details).toBeUndefined();
    expect(sections[1]).toBe(rows[1]);
  });
});
