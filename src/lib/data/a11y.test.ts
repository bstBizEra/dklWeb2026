/**
 * Keyboard and screen-reader rules found in the 2026-10-25 check of Home, Contact and Request a Quote:
 * landmarks and the skip link, focus never landing on faded content, and the quote form's required fields
 * and focus after sending.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const read = (...parts: string[]) => readFileSync(join(process.cwd(), "src", ...parts), "utf8").replace(/\r\n/g, "\n");

const shells = [
  ["app", "(site)", "page.tsx"],
  ["app", "(site)", "about", "page.tsx"],
  ["app", "(site)", "not-found.tsx"],
  ["components", "dklao", "content-page.tsx"],
];

describe("landmarks and skip link", () => {
  it("keeps the header and footer outside <main>, so they are the banner and contentinfo and the skip link skips the header", () => {
    for (const parts of shells) {
      const source = read(...parts);
      const header = source.indexOf("<SiteHeader />");
      const main = source.indexOf('<main id="main-content" tabIndex={-1}');
      const mainEnd = source.indexOf("</main>");
      const footer = source.indexOf("<IndustrialFooter />");

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
});

describe("quote form", () => {
  const form = read("components", "dklao", "quote-request-form.tsx");

  it("says which fields are required up front and marks Email as optional", () => {
    expect(form).toContain('"aria-required": required || undefined');
    expect(form).toContain('describedBy("email", errors.email, false)');
    expect(form).toMatch(/<Field id="email"[^>]*optional>/);
    expect(form).toContain("(optional)");
  });

  it("keeps the send button focusable while sending, so focus is not lost", () => {
    expect(form).toContain("aria-disabled={isSubmitting || undefined}");
    expect(form).not.toMatch(/disabled=\{isSubmitting\}/);
    expect(form).toContain("if (isSubmitting) {");
  });
});
