import pg from "pg";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { createEmailEntryStore } from "./email-entry";

const url = process.env.TEST_DATABASE_URL;
const pool = url ? new pg.Pool({ connectionString: url, max: 10 }) : undefined;
const email = "entry-test@example.com";
const store = pool ? createEmailEntryStore(pool, "test-only-signing-secret-0000000000") : undefined;

describe.skipIf(!url)("CMS email entry on PostgreSQL", () => {
  beforeEach(async () => {
    await pool!.query("DELETE FROM cms_email_entry WHERE email = $1", [email]);
    await pool!.query("DELETE FROM users WHERE email = $1", [email]);
    await pool!.query("INSERT INTO users (email, role, updated_at, created_at) VALUES ($1, 'advisor', now(), now())", [email]);
  });

  afterAll(async () => {
    await pool?.query("DELETE FROM cms_email_entry WHERE email = $1", [email]);
    await pool?.query("DELETE FROM users WHERE email = $1", [email]);
    await pool?.end();
  });

  it("issues keys only for existing accounts and expires them after 10 minutes", async () => {
    const now = new Date("2026-11-05T12:00:00Z");
    expect(await store!.issue("unknown@example.com", now)).toBeNull();
    const code = await store!.issue(email, now);
    expect(code).toMatch(/^\d{6}$/);
    expect(await store!.verify(email, code!, new Date(now.getTime() + 600_001))).toBeNull();
  });

  it("locks a key after five wrong guesses", async () => {
    const now = new Date();
    const code = await store!.issue(email, now);
    const wrong = code === "000000" ? "111111" : "000000";
    for (let i = 0; i < 5; i++) expect(await store!.verify(email, wrong, now)).toBeNull();
    expect(await store!.verify(email, code!, now)).toBeNull();
  });

  it("supersedes an older key on resend", async () => {
    const now = new Date();
    const oldCode = await store!.issue(email, now);
    const newCode = await store!.issue(email, new Date(now.getTime() + 1000));
    if (oldCode !== newCode) expect(await store!.verify(email, oldCode!, now)).toBeNull();
    expect(await store!.verify(email, newCode!, now)).not.toBeNull();
  });

  it("allows one verification and one matching password-login proof", async () => {
    const now = new Date();
    const code = await store!.issue(email, now);
    const results = await Promise.all(Array.from({ length: 6 }, () => store!.verify(email, code!, now)));
    const proofs = results.filter((result) => result !== null);
    expect(proofs).toHaveLength(1);
    expect(await store!.hasProof(email, proofs[0]!.token, now)).toBe(true);
    expect(await store!.consumeProof("other@example.com", proofs[0]!.token, now)).toBe(false);
    expect(await store!.consumeProof(email, proofs[0]!.token, now)).toBe(true);
    expect(await store!.consumeProof(email, proofs[0]!.token, now)).toBe(false);
  });
});
