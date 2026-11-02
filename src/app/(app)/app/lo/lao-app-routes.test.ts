/**
 * The app's EN / ລາວ switch links every screen to /app/lo/...; each of those addresses must be a real
 * route, rendering the shared screen in Lao (found 2026-11-01: the switch led to a 404).
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { appAlternatePath } from "@/lib/i18n/app-locale";

const appDir = join(process.cwd(), "src", "app", "(app)", "app");
const screens = ["", "services", "request", "location", "info", "offline"];

describe("Lao app routes", () => {
  it("has a page for every screen the language switch links to", () => {
    for (const screen of screens) {
      const lao = appAlternatePath(`/app${screen ? `/${screen}` : ""}`, "lo");
      const page = join(appDir, ...lao.split("/").slice(2), "page.tsx");
      expect(existsSync(page), lao).toBe(true);
      expect(readFileSync(page, "utf8"), lao).toMatch(/Screen locale="lo"/);
    }
  });
});
