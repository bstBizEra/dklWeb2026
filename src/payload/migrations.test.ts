/**
 * Supabase exposes the public schema through its Data API. supabase-lockdown.ts closes it, but only for
 * tables that exist when it runs, so every migration after the lockdown that creates a table must call it
 * again. This test fails if one forgets.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const dir = join(process.cwd(), "src", "payload", "migrations");
const lockdown = "20261022_150000_supabase_lockdown";

describe("CMS migrations", () => {
  it("re-runs the Supabase lockdown in every migration that adds tables after it", () => {
    const later = readdirSync(dir)
      .filter((name) => /^\d{8}_\d{6}_.+\.ts$/.test(name) && name.replace(/\.ts$/, "") > lockdown)
      .sort();

    expect(later.length).toBeGreaterThan(0);
    for (const name of later) {
      const source = readFileSync(join(dir, name), "utf8");
      if (/CREATE TABLE/i.test(source)) expect(source, name).toContain("await lockdownPublicSchema(db)");
    }
  });

  it("are applied automatically when the production app starts", () => {
    const config = readFileSync(join(process.cwd(), "src", "payload.config.ts"), "utf8");

    expect(config).toContain('import { migrations } from "./payload/migrations"');
    expect(config).toContain("prodMigrations: migrations");
    expect(config).toContain("push: false");
  });

  it("registers every migration file in the index", () => {
    const index = readFileSync(join(dir, "index.ts"), "utf8");
    for (const name of readdirSync(dir).filter((file) => /^\d{8}_\d{6}_.+\.ts$/.test(file))) {
      expect(index, name).toContain(`name: '${name.replace(/\.ts$/, "")}'`);
    }
  });
});
