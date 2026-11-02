/**
 * The language toggles show the Lao and UK flags beside "ລາວ" and "EN". The flags are decoration: the
 * visible text stays, so each button's name is still the language it shows.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Flag } from "./flag";

const read = (...parts: string[]) => readFileSync(join(process.cwd(), "src", ...parts), "utf8").replace(/\r\n/g, "\n");

describe("language flags", () => {
  it("draws the Lao flag: red, blue, red bands with the white disc", () => {
    const svg = renderToStaticMarkup(<Flag locale="lo" />);
    expect(svg).toContain('aria-hidden="true"');
    expect(svg).toContain("#CE1126");
    expect(svg).toContain("#002868");
    expect(svg).toMatch(/<circle[^>]*fill="#fff"/);
  });

  it("draws the UK flag for English", () => {
    const svg = renderToStaticMarkup(<Flag locale="en" />);
    expect(svg).toContain('aria-hidden="true"');
    expect(svg).toContain("#012169");
    expect(svg).toContain("#C8102E");
  });

  it("puts a flag before the visible language name in the website and app toggles", () => {
    for (const toggle of [["components", "i18n", "language-toggle.tsx"], ["components", "app", "language-switch.tsx"]]) {
      expect(read(...toggle)).toMatch(/<Flag locale=\{locale\} \/>\s*\{locale === "lo" \? \w+\.lo : \w+\.en\}/);
    }
  });
});
