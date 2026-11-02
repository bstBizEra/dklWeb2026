/**
 * Keyboard and screen-reader rules found in the 2026-10-25 check of Home, Contact and Request a Quote:
 * landmarks and the skip link, focus never landing on faded content, and the quote form's required fields
 * and focus after sending.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { en } from "@/messages/en";
import { lo } from "@/messages/lo";

const read = (...parts: string[]) => readFileSync(join(process.cwd(), "src", ...parts), "utf8").replace(/\r\n/g, "\n");

const shells = [
  ["app", "(site)", "[locale]", "page.tsx"],
  ["app", "(site)", "[locale]", "about", "page.tsx"],
  // The 404's markup, shared by the route's not-found.tsx and app/global-not-found.tsx.
  ["components", "dklao", "not-found-content.tsx"],
  ["components", "dklao", "content-page.tsx"],
];

describe("landmarks and skip link", () => {
  it("keeps the header and footer outside <main>, so they are the banner and contentinfo and the skip link skips the header", () => {
    for (const parts of shells) {
      const source = read(...parts);
      const header = source.indexOf("<SiteHeader locale={locale} />");
      const main = source.indexOf('<main id="main-content" tabIndex={-1}');
      const mainEnd = source.indexOf("</main>");
      const footer = source.indexOf("<IndustrialFooter locale={locale} />");

      expect(header, parts.join("/")).toBeGreaterThan(-1);
      expect(main, parts.join("/")).toBeGreaterThan(header);
      expect(mainEnd, parts.join("/")).toBeLessThan(footer);
    }
  });
});

describe("focus and motion", () => {
  it("never leaves focused content faded: a focused reveal target is shown at once", () => {
    const site = read("components", "dklao", "site-motion.tsx");
    const footer = read("components", "dklao", "footer-motion.tsx");

    expect(site).toContain('document.addEventListener("focusin", showFocused)');
    expect(site).toContain('document.removeEventListener("focusin", showFocused)');
    expect(site).toContain("el.contains(document.activeElement)");
    expect(footer).toContain('addEventListener("focusin", onFocus)');
    expect(footer).toContain("timeline.progress(1)");
  });

  it("gives standalone links and the Solutions button at least 24px height (WCAG 2.5.8)", () => {
    expect(read("components", "dklao", "service-card.tsx")).toMatch(/service-card__link[^"]*min-h-6/);
    expect(read("components", "dklao", "mega-menu.tsx")).toMatch(/const topLinkClass =\s*"[^"]*min-h-6/);
    expect(read("components", "dklao", "content-page.tsx").match(/min-h-6/g)?.length).toBeGreaterThanOrEqual(3);
  });

  it("starts each card link's accessible name with its visible text (WCAG 2.5.3)", () => {
    // Voice-control users say the words they see ("click View details"); the aria-label must begin with them.
    // Each link shows {t.<visible>} and is named by fill(t.<label>, ...), in English and in Lao.
    const pairs = [...read("components", "dklao", "content-page.tsx").matchAll(/aria-label=\{fill\(t\.(\w+), \{ title \}\)\}>\s*\{t\.(\w+)\}/g)];
    expect(pairs.length).toBe(4); // a new card link must be added here, not skipped silently
    for (const t of [en.contentPage, lo.contentPage] as Record<string, string>[]) {
      for (const [, label, visible] of pairs) expect(t[label].startsWith(t[visible])).toBe(true);
    }
  });

  it("starts the app back button's accessible name with the screen name it shows (WCAG 2.5.3)", () => {
    const back = read("components", "app", "back-button.tsx");
    expect(back).toContain("<span className=\"android:sr-only\">{label}</span>");
    expect(back).toContain("aria-label={fill(t.back, { label })}");
    for (const file of [["messages", "app-en.ts"], ["messages", "lo", "mobile-app.ts"]]) expect(read(...file)).toMatch(/\bback: "\{label\}/);
  });
});

describe("quote form", () => {
  const form = read("components", "dklao", "quote-request-form.tsx");

  it("says which fields are required up front and marks Email as optional", () => {
    expect(form).toContain('"aria-required": required || undefined');
    expect(form).toContain('describedBy("email", errors.email, false)');
    expect(form).toMatch(/<Field id="email"[^>]*optional=\{t\.optional\}>/);
    expect(en.quoteForm.optional).toBe("(optional)");
  });

  it("keeps the send button focusable while sending, so focus is not lost", () => {
    expect(form).toContain("aria-disabled={isSubmitting || undefined}");
    expect(form).not.toMatch(/disabled=\{isSubmitting\}/);
    expect(form).toContain("if (isSubmitting) {");
  });
});
