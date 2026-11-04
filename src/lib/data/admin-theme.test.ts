/**
 * Check the copied official BizEra brandkit's light and dark text/action pairs
 * and the CMS integration. Source: https://bizera.la/bizera_brandkit/
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const read = (...parts: string[]) => readFileSync(join(process.cwd(), "src", ...parts), "utf8").replace(/\r\n/g, "\n");
const scss = read("app", "(payload)", "custom.scss");
const tokens = read("app", "(payload)", "bizera-tokens.css");
const config = read("payload.config.ts");

const variable = (name: string): string => {
  const found = tokens.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, "i"));
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
  it("uses the official brandkit palette and fonts", () => {
    expect(variable("color-palette-night")).toBe("#0b1a16");
    expect(variable("color-palette-mint")).toBe("#69c6b5");
    expect(variable("color-palette-green")).toBe("#3db389");
    expect(variable("color-palette-deep")).toBe("#1d7a5a");
    expect(scss).toContain("--font-bizera-text");
    expect(scss).toContain("--font-bizera-display");
  });

  it("keeps text and actions legible in both themes", () => {
    for (const [foreground, background] of [
      ["ink", "white"],
      ["pine", "white"],
      ["slate", "white"],
      ["white", "deep"],
      ["white", "ink"], // light primary hover
      ["night-text", "night"],
      ["night-soft", "night-raised"],
      ["night-muted", "night"],
      ["night-muted", "night-raised"],
      ["ink", "green"],
      ["ink", "mint"], // dark primary hover
    ] as const) {
      expect(
        contrast(variable(`color-palette-${foreground}`), variable(`color-palette-${background}`)),
        `${foreground} on ${background}`,
      ).toBeGreaterThanOrEqual(4.5);
    }

    for (const [ring, surface] of [["deep", "white"], ["mint", "night"]] as const) {
      expect(
        contrast(variable(`color-palette-${ring}`), variable(`color-palette-${surface}`)),
        `${ring} focus ring on ${surface}`,
      ).toBeGreaterThanOrEqual(3);
    }
  });

  it("keeps Payload's dark editor labels legible on raised surfaces", () => {
    const darkTheme = scss.match(/:root\[data-theme="dark"\]\s*\{([\s\S]*?)\n  \}/)?.[1];
    const elevation500Base = darkTheme?.match(/--theme-elevation-500:\s*var\(--color-base-(\d+)\)/)?.[1];
    expect(elevation500Base).toBeDefined();
    const label = scss.match(new RegExp(`--color-base-${elevation500Base}:\\s*(#[0-9a-f]{6})`, "i"))?.[1];
    expect(label).toBeDefined();
    expect(contrast(label as string, variable("color-palette-night-raised"))).toBeGreaterThanOrEqual(4.5);
  });

  it("wires the admin to the brand components and offers both themes", () => {
    for (const part of ["graphics", "payload/admin/logo", "payload/admin/icon", "payload/admin/developed-by"]) {
      expect(config).toContain(part);
    }
    expect(config).not.toMatch(/theme:\s*"dark"/);
    expect(read("payload", "admin", "logo.tsx")).not.toContain("/images/bizera/");
  });
});
