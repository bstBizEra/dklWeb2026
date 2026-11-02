/**
 * The CMS admin wears BizEra's corporate identity, as the developer of the DK LAO backend: the navy,
 * mint and text ramp read off bizera.la (2026-11-03), since BizEra publishes no brand kit or logo file.
 * The checks here keep the palette honest — every colour the admin puts text in must stay legible on
 * the surface behind it — and keep the admin wired to the brand components.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const read = (...parts: string[]) => readFileSync(join(process.cwd(), "src", ...parts), "utf8").replace(/\r\n/g, "\n");
const scss = read("app", "(payload)", "custom.scss");
const config = read("payload.config.ts");

const variable = (name: string): string => {
  const found = scss.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, "i"));
  expect(found, name).not.toBeNull();
  return (found as RegExpMatchArray)[1];
};

const channels = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const luminance = (hex: string) =>
  channels(hex)
    .map((value) => value / 255)
    .map((value) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4))
    .reduce((total, value, index) => total + value * [0.2126, 0.7152, 0.0722][index], 0);
const contrast = (a: string, b: string) => {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
};

describe("BizEra admin theme", () => {
  it("uses the colours BizEra uses on bizera.la", () => {
    expect(variable("color-base-900")).toBe("#0d1a26");
    expect(variable("bizera-mint")).toBe("#64ffda");
    expect(scss).toContain("Noto Sans Lao");
  });

  it("keeps every text colour legible on the surface behind it", () => {
    const page = variable("color-base-900");
    const input = variable("color-base-850");
    const mint = variable("bizera-mint");

    // Payload's dark ramp: text is base-0, body base-250, the faintest text we use is base-450.
    for (const [key, behind] of [
      ["color-base-0", page],
      ["color-base-250", page],
      ["color-base-450", page],
      ["color-base-250", input],
    ] as const) {
      expect(contrast(variable(key), behind), `${key} on ${behind}`).toBeGreaterThanOrEqual(4.5);
    }

    expect(contrast(mint, page), "mint on the page").toBeGreaterThanOrEqual(4.5);
    expect(contrast(variable("bizera-ink"), mint), "button text on mint").toBeGreaterThanOrEqual(4.5);
  });

  it("wires the admin to the brand components", () => {
    for (const part of ["graphics", "payload/admin/logo", "payload/admin/icon", "payload/admin/developed-by"]) {
      expect(config).toContain(part);
    }
    // BizEra's identity is dark; a light admin would not be their identity at all.
    expect(config).toMatch(/theme:\s*"dark"/);
  });
});
