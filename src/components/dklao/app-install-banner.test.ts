/**
 * Website pages invite phone visitors to install the app, and the icons carry the release version so
 * browsers do not keep showing a cached favicon. Source checks: the banner itself is a small client component.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const read = (...parts: string[]) => readFileSync(join(process.cwd(), ...parts), "utf8");

describe("app install banner", () => {
  it("is on every website page and opens the app's install card", () => {
    expect(read("src", "app", "(site)", "[locale]", "layout.tsx")).toContain("<AppInstallBanner labels={getMessages(locale).appBanner} />");
    expect(read("src", "components", "dklao", "app-install-banner.tsx")).toContain('href="/app?install"');
    const helpers = read("src", "components", "app", "app-helpers.tsx");
    expect(helpers).toContain('.has("install")');
    // Without Chrome's install prompt, the card falls back to the browser-menu steps.
    expect(helpers).toContain('asked ? "menu" : null');
  });

  it("shows on phones only", () => {
    expect(read("src", "components", "dklao", "app-install-banner.tsx")).toMatch(/\bhidden\b[^"]*max-\[780px\]:flex/);
  });
});

describe("favicon", () => {
  it("adds the release version to every icon URL", () => {
    const layout = read("src", "app", "(site)", "[locale]", "layout.tsx");
    expect(layout).toContain("const iconVersion = siteFooterMetadata.version");
    for (const icon of ["/favicon.ico", "/images/fav-icon/FAV-Icon.png"]) expect(layout).toContain(`${icon}?v=\${iconVersion}`);
  });
});
