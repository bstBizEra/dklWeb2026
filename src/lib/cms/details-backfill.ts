import { isCompleteDetails, type ItemDetails, type PageSection } from "@/lib/data/pages";

type Row = Record<string, unknown>;

// The admin stores a card section as a group: lead, facts[], topics[], checklistHeading and checklist[] of
// { point }. These two functions convert between that row and the site's ItemDetails.
export type DetailsRow = {
  lead?: string | null;
  facts?: { value?: string | null; label?: string | null }[] | null;
  topics?: { heading?: string | null; body?: string | null }[] | null;
  checklistHeading?: string | null;
  checklist?: { point?: string | null }[] | null;
};

// What the seed writes: every row filled, as the admin's required fields expect.
export type DetailsRowInput = {
  lead: string;
  facts: { value: string; label: string }[];
  topics: { heading: string; body: string }[];
  checklistHeading?: string;
  checklist: { point: string }[];
};

export function toDetailsRow(details: ItemDetails): DetailsRowInput {
  return {
    lead: details.lead,
    facts: details.facts?.map((fact) => ({ ...fact })) ?? [],
    topics: details.topics.map((topic) => ({ ...topic })),
    checklistHeading: details.checklist?.heading,
    checklist: details.checklist?.items.map((point) => ({ point })) ?? [],
  };
}

const clean = (value: unknown) => (typeof value === "string" ? value.trim() : "");

// Complete details from an admin row, or undefined (no section) when the lead or two topics are missing.
export function fromDetailsRow(row: DetailsRow | null | undefined): ItemDetails | undefined {
  if (!row) return undefined;
  const facts = (row.facts ?? []).flatMap((fact) => (clean(fact.value) && clean(fact.label) ? [{ value: clean(fact.value), label: clean(fact.label) }] : []));
  const topics = (row.topics ?? []).flatMap((topic) => (clean(topic.heading) && clean(topic.body) ? [{ heading: clean(topic.heading), body: clean(topic.body) }] : []));
  const points = (row.checklist ?? []).flatMap((entry) => (clean(entry.point) ? [clean(entry.point)] : []));
  const details: ItemDetails = {
    lead: clean(row.lead),
    ...(facts.length ? { facts } : {}),
    topics,
    ...(clean(row.checklistHeading) && points.length ? { checklist: { heading: clean(row.checklistHeading), items: points } } : {}),
  };
  return isCompleteDetails(details) ? details : undefined;
}

const isEmpty = (row: DetailsRow | undefined) => !clean(row?.lead) && !(row?.topics ?? []).length && !(row?.facts ?? []).length && !(row?.checklist ?? []).length;

// For a page row that already exists in the CMS: copy the built-in card section onto card items whose
// section is still completely empty. Items are matched by section title and item title. Anything an
// editor has written, even one field, is left untouched. Returns the updated sections and how many items
// were filled, so the seed can skip the save when nothing changed.
export function fillMissingDetails(rowSections: Row[], builtIn: PageSection[]): { sections: Row[]; filled: number } {
  let filled = 0;

  const sections = rowSections.map((section) => {
    const source = builtIn.find((candidate) => candidate.kind === "cards" && candidate.title === section.title);
    if (section.kind !== "cards" || !source || !Array.isArray(section.items)) return section;

    const items = (section.items as Row[]).map((item) => {
      const details = source.items.find((candidate) => candidate.title === item.title)?.details;
      if (!details || !isEmpty(item.details as DetailsRow | undefined)) return item;
      filled++;
      return { ...item, details: toDetailsRow(details) };
    });

    return { ...section, items };
  });

  return { sections, filled };
}
