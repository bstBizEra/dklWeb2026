/**
 * The maintenance page after stage 2 of the feature-branch port: its form section books a service with the
 * service booking form, and the maintenance checklist exists in both languages, at the same place.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { sitemapPagesFor } from "./sitemap-pages";

const checklist = (locale: "en" | "lo") => {
  const sections = sitemapPagesFor(locale).maintenance.sections;
  return { index: sections.findIndex((section) => section.items.length === 11 && section.kind === "list"), sections };
};

describe("maintenance page", () => {
  it("shows the checklist before the booking form, in English and Lao", () => {
    const en = checklist("en");
    const lo = checklist("lo");

    expect(en.index).toBeGreaterThan(-1);
    expect(en.sections[en.index + 1].kind).toBe("form");
    expect(lo.index).toBe(en.index);
    expect(lo.sections[lo.index].title).toBe("ການກວດບຳລຸງຮັກສາກວດຫຍັງແດ່");
    expect(lo.sections[lo.index].items.every((item) => item.description && !/[a-z]{4}/.test(item.description))).toBe(true);
  });

  it("books a service with the service booking form instead of the generic quote form", () => {
    const source = readFileSync(join(process.cwd(), "src", "components", "dklao", "content-page.tsx"), "utf8");
    expect(source).toMatch(/pageId === "maintenance"[\s\S]{0,200}<ServiceBookingForm/);
  });
});
