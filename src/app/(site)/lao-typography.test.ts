/**
 * Lao stacks vowels and tone marks above and below each letter, so the tight heading leading tuned for
 * Inter (1.0 to 1.2) made two-line Lao titles touch. Lao titles get their own line height, outside the
 * Tailwind layers so it wins over every leading-* utility; English keeps its spacing.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const read = (...parts: string[]) => readFileSync(join(process.cwd(), "src", "app", ...parts), "utf8").replace(/\r\n/g, "\n");

describe("Lao title spacing", () => {
  it("gives Lao headings room for their marks, outside any @layer, on the website and in the app", () => {
    for (const css of [read("(site)", "globals.css"), read("(app)", "app.css")]) {
      // At column 0: rules inside @layer blocks in these files are indented, so this one is unlayered.
      const rule = css.match(/^:lang\(lo\) :is\(h1, h2, h3\) \{\n  line-height: ([\d.]+);\n\}/m);
      expect(rule).not.toBeNull();
      expect(Number(rule![1])).toBeGreaterThanOrEqual(1.35);
    }
  });

  it("gives Lao body text room too, outside titles, on the website and in the app", () => {
    for (const css of [read("(site)", "globals.css"), read("(app)", "app.css")]) {
      const rule = css.match(/^:lang\(lo\) :is\(p, li, dd, dt, small, span, strong, label, figcaption\):not\(:is\(h1, h2, h3\) \*\) \{\n  line-height: ([\d.]+);\n\}/m);
      expect(rule).not.toBeNull();
      expect(Number(rule![1])).toBeGreaterThanOrEqual(1.6);
    }
  });
});
