/**
 * The phone app's request form must fit a 390px screen. With an auto grid column, the widest select's
 * option text set the form width and the page scrolled sideways (417px form on a 390px iPhone, found in a
 * browser walk on 2026-11-01). grid-cols-1 caps the column at the container width (minmax(0, 1fr)).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const source = readFileSync(join(process.cwd(), "src", "components", "app", "request-form.tsx"), "utf8");

describe("app request form layout", () => {
  it("caps the form's grid column at the screen width", () => {
    expect(source).toMatch(/<form[^>]*className="grid grid-cols-1 gap-7"/);
  });

  it("caps the sent screen too, which shows the long DKL reference", () => {
    expect(source).toContain('<div className="grid grid-cols-1 gap-7">\n        <section role="status"');
  });
});
