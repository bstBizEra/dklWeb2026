/**
 * Button wording. Every call to action is in Title Case, and one intent has one label everywhere:
 * advisor, recommendation, quote, rental price, site survey, spare parts, maintenance and inspection.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { aboutHeroCtas } from "./about";
import * as about from "./about";
import * as home from "./homepage";
import { contactPage, forkliftRentalPage, requestQuotePage } from "./pages";
import { sitemapPageList } from "./sitemap-pages";
import { en } from "@/messages/en";

const small = new Set(["a", "an", "and", "for", "of", "the", "to", "in", "on", "with", "at"]);

function isTitleCase(label: string): boolean {
  return label.split(" ").every((word, index) => {
    if (index > 0 && small.has(word)) return true;
    return /^[A-Z0-9&]/.test(word);
  });
}

// Labels from data modules: any array item with a ctaLabel, plus the hero button lists.
function dataLabels(module: Record<string, unknown>): string[] {
  const labels: string[] = [];
  for (const value of Object.values(module)) {
    if (!Array.isArray(value)) continue;
    for (const item of value) {
      if (item && typeof item === "object" && "ctaLabel" in item && typeof item.ctaLabel === "string") labels.push(item.ctaLabel);
    }
  }
  return labels;
}

const pages = [requestQuotePage, contactPage, forkliftRentalPage, ...sitemapPageList];
const pageLabels = pages.flatMap((page) => [
  ...page.ctas.map((cta) => cta.label),
  ...(page.closing ? [page.closing.primary.label, ...(page.closing.secondary ? [page.closing.secondary.label] : [])] : []),
]);

// Labels written straight into components.
const componentSource = ["about-sections.tsx", "homepage-sections.tsx", "industrial-footer.tsx"]
  .map((file) => readFileSync(join(process.cwd(), "src", "components", "dklao", file), "utf8"))
  .join("\n");
const componentLabels = [...componentSource.matchAll(/(?:primary|secondary|tertiary)Label="([^"]+)"/g)].map((m) => m[1]);
const footerLabels = [...componentSource.matchAll(/<Link href=\{?[^>]*>([A-Z][^<{]+)<\/Link>/g)].map((m) => m[1]);

// Text written inside a styled button link, on one line or several.
const buttonLabels = [...componentSource.matchAll(/<Button[^>]*asChild[^>]*>\s*<Link[^>]*>\s*([A-Z][^<{]*?)\s*(?:<|\{)/g)].map((m) => m[1].trim());

// Button text the components take from the English messages (Lao pages show the Lao version).
const messageLabels = [
  en.home.rental.askPrice,
  en.home.rental.requestQuote,
  en.home.final.primary,
  en.home.final.secondary,
  en.about.final.primary,
  en.about.final.secondary,
  en.contentPage.requestQuote,
  en.quoteForm.submit,
];

const labels = [
  ...buttonLabels,
  ...messageLabels,
  ...dataLabels(home),
  ...dataLabels(about),
  ...home.homepageCtas.map((cta) => cta.label),
  ...aboutHeroCtas.map((cta) => cta.label),
  ...pageLabels,
  ...componentLabels,
  ...footerLabels,
];

describe("call to action wording", () => {
  it("finds the button text written inside components or taken from the messages", () => {
    expect(messageLabels).toEqual(expect.arrayContaining(["Ask for Rental Price"]));
    expect([...buttonLabels, ...messageLabels].every((label) => label.length > 2)).toBe(true);
  });

  it("collects a meaningful set of labels", () => {
    expect(labels.length).toBeGreaterThan(60);
    expect(new Set(labels).size).toBeGreaterThan(10);
  });

  it("writes every label in Title Case", () => {
    for (const label of new Set(labels)) expect(isTitleCase(label), label).toBe(true);
  });

  it("uses one label per intent", () => {
    const canon: [RegExp, string][] = [
      [/advisor/i, "Talk to a DK LAO Advisor"],
      [/recommend/i, "Get a Recommendation"],
      [/\bquote\b/i, "Request a Quote"],
      [/rental price/i, "Ask for Rental Price"],
      [/site survey/i, "Schedule Site Survey"],
      [/spare parts/i, "Request Spare Parts"],
      [/maintenance service/i, "Book Maintenance Service"],
      [/inspection/i, "Request Inspection"],
    ];

    for (const label of new Set(labels)) {
      for (const [pattern, expected] of canon) {
        if (pattern.test(label)) expect(label, `${label} should be "${expected}"`).toBe(expected);
      }
    }
  });

  it("sends only advisor and recommendation buttons to the contact page, each with its own label", () => {
    const toContact = [
      ...aboutHeroCtas.filter((cta) => cta.href === "/contact").map((cta) => cta.label),
      ...pages.flatMap((page) => [...page.ctas, ...(page.closing ? [page.closing.primary, ...(page.closing.secondary ? [page.closing.secondary] : [])] : [])]).filter((cta) => cta.href === "/contact").map((cta) => cta.label),
    ];

    expect(toContact.length).toBeGreaterThan(3);
    for (const label of new Set(toContact)) {
      expect(["Talk to a DK LAO Advisor", "Get a Recommendation"], label).toContain(label);
    }
  });
});
