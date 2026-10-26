/**
 * Site-wide motion, checked against the 12 principles of animation adapted for the web:
 * entrances ease out, staggers stay at 50ms or less, presses squash gently, user-triggered
 * transitions finish within 300ms, linear easing is not used for timed motion, and visitors
 * who ask for reduced motion are respected.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const read = (...parts: string[]) => readFileSync(join(process.cwd(), ...parts), "utf8").replace(/\r\n/g, "\n");
const css = read("src", "app", "(site)", "globals.css");
const layout = read("src", "app", "(site)", "[locale]", "layout.tsx");
const site = read("src", "components", "dklao", "site-motion.tsx");
const footer = read("src", "components", "dklao", "footer-motion.tsx");

describe("site motion", () => {
  it("is mounted once in the site layout as a client component", () => {
    expect(site.startsWith('"use client"')).toBe(true);
    expect(layout).toContain("<SiteMotion />");
  });

  it("only moves anything when the visitor has not asked for reduced motion", () => {
    expect(site).toContain('mm.add("(prefers-reduced-motion: no-preference)"');
    expect(site).toContain("mm.revert()");
  });

  it("keeps every stagger at 50ms or less and eases entrances out", () => {
    for (const source of [site, footer]) {
      for (const [, value] of source.matchAll(/stagger:\s*([\d.]+)/g)) expect(Number(value)).toBeLessThanOrEqual(0.05);
      for (const [, ease] of source.matchAll(/ease:\s*"([^"]+)"/g)) expect(["power3.out", "none"]).toContain(ease);
    }
  });

  it("uses linear (none) easing only for scroll-linked parallax", () => {
    expect(site.match(/ease: "none"/g)?.length).toBe(1);
    expect(site).toMatch(/ease: "none",[^\n]*scroll-linked[\s\S]*?scrub:/);
  });

  it("hides only content that starts below the fold, and never a parent and its child together", () => {
    expect(site).toContain("window.innerHeight * 0.92");
    expect(site).toContain("other.contains(el)");
    expect(site).toContain('!el.closest(".industrial-footer")');
    expect(site).toContain("once: true");
    // Opacity, not visibility: hidden content stays readable to screen readers and page search.
    expect(site).not.toContain("autoAlpha");
  });

  it("replaces the Chrome-only scroll-timeline reveal so every browser gets the same motion", () => {
    expect(css).not.toContain("animation-timeline");
  });

  it("gives presses a gentle squash and keeps transitions out of linear easing", () => {
    for (const [, scale] of css.matchAll(/:active[^{]*{[^}]*scale\(([\d.]+)\)/g)) {
      expect(Number(scale)).toBeGreaterThanOrEqual(0.95);
      expect(Number(scale)).toBeLessThanOrEqual(1.05);
    }
    // Tailwind components carry their press squash in their classes; keep it within 0.95 to 1.05.
    const components = ["dklao/industrial-footer.tsx", "dklao/service-card.tsx", "ui/button.tsx"].map((file) =>
      read("src", "components", ...file.split("/")),
    );
    for (const component of components) {
      const scales = [...component.matchAll(/active:scale-\[([\d.]+)\]/g)].map((match) => Number(match[1]));

      expect(scales.length).toBeGreaterThan(0);
      for (const scale of scales) expect(scale).toBeGreaterThanOrEqual(0.95);
    }
    expect(css).not.toMatch(/transition:[^;]*\blinear\b/);
    expect(css).not.toMatch(/transition:[^;]*\b0\.15s ease\b/);
  });

  it("keeps the hover and press timing tokens under 300ms", () => {
    const ms = (name: string) => Number(css.match(new RegExp(`--dk-motion-duration-${name}:\\s*(\\d+)ms`))?.[1]);

    expect(ms("fast")).toBeLessThan(300);
    expect(ms("base")).toBeLessThan(300);
  });

  it("darkens the header once the page scrolls", () => {
    expect(site).toContain('className: "is-scrolled"');
    const header = read("src", "components", "dklao", "site-header.tsx");

    expect(header).toContain("[&.is-scrolled]:shadow-[");
    expect(header).toContain("className=\"site-header ");
  });
});
