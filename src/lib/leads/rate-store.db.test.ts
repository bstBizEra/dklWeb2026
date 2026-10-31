/**
 * The shared rate limiter against a real PostgreSQL with the CMS migrations applied (CI's migrations job,
 * or locally: TEST_DATABASE_URL=postgresql://... after pnpm cms:migrate). Skipped without TEST_DATABASE_URL.
 * It proves the point of the database store: two server processes share one count, and simultaneous
 * requests cannot slip past the limit.
 */
import pg from "pg";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { createDatabaseRateLimiter } from "./rate-store";

const url = process.env.TEST_DATABASE_URL;
const pool = url ? new pg.Pool({ connectionString: url, max: 10 }) : undefined;
const config = { limit: 5, windowMs: 10 * 60_000 };

describe.skipIf(!url)("database rate limiter on PostgreSQL", () => {
  beforeEach(async () => {
    await pool!.query("DELETE FROM lead_rate_limits WHERE bucket LIKE 'test:%'", []);
  });

  afterAll(async () => {
    await pool?.query("DELETE FROM lead_rate_limits WHERE bucket LIKE 'test:%'", []);
    await pool?.end();
  });

  it("has the table from the migration", async () => {
    const { rows } = await pool!.query("SELECT to_regclass('public.lead_rate_limits') AS name", []);
    expect(rows[0].name).toBe("lead_rate_limits");
  });

  it("shares one count between two server processes", async () => {
    // Two limiters with separate state stand in for two processes.
    const first = createDatabaseRateLimiter(pool!, config, { prefix: "test" });
    const second = createDatabaseRateLimiter(pool!, config, { prefix: "test" });
    const now = Date.now();

    const results = [];
    for (let i = 0; i < 6; i++) results.push((await (i % 2 ? second : first).check("198.51.100.1", now)).allowed);

    expect(results).toEqual([true, true, true, true, true, false]);
  });

  it("lets exactly the limit through when requests arrive at the same moment", async () => {
    const now = Date.now();
    const limiters = Array.from({ length: 4 }, () => createDatabaseRateLimiter(pool!, config, { prefix: "test" }));
    const results = await Promise.all(Array.from({ length: 20 }, (_, i) => limiters[i % 4].check("198.51.100.2", now)));

    expect(results.filter((result) => result.allowed)).toHaveLength(5);
  });

  it("keeps addresses apart and clears old windows", async () => {
    const limiter = createDatabaseRateLimiter(pool!, config, { prefix: "test", cleanupEvery: 1 });
    const now = Date.now();
    await limiter.check("old", now - 3 * config.windowMs);
    for (let i = 0; i < 5; i++) await limiter.check("198.51.100.3", now);

    expect((await limiter.check("198.51.100.4", now)).allowed).toBe(true);
    // The cleanup is not awaited by check(); give it a moment.
    await new Promise((resolve) => setTimeout(resolve, 100));
    const { rows } = await pool!.query("SELECT count(*)::int AS n FROM lead_rate_limits WHERE bucket = 'test:old'", []);
    expect(rows[0].n).toBe(0);
  });
});
