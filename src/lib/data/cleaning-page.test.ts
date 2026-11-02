/**
 * The cleaning equipment page after stage 7 of the feature-branch port: its "Get a recommendation" section
 * uses the cleaning recommendation form instead of the generic quote form.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("cleaning equipment page", () => {
  it("uses the cleaning recommendation form", () => {
    const source = readFileSync(join(process.cwd(), "src", "components", "dklao", "content-page.tsx"), "utf8");
    expect(source).toMatch(/pageId === "cleaning"[\s\S]{0,200}<CleaningRequestForm/);
  });
});
