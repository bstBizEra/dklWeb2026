/**
 * The spare parts page after stage 3 of the feature-branch port: its form section asks for a part with
 * the parts request form instead of the generic quote form.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("spare parts page", () => {
  it("asks for a part with the parts request form", () => {
    const source = readFileSync(join(process.cwd(), "src", "components", "dklao", "content-page.tsx"), "utf8");
    expect(source).toMatch(/pageId === "parts"[\s\S]{0,200}<PartsRequestForm/);
  });
});
