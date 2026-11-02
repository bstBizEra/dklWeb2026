/**
 * The CMS session secret: a running production server with a database refuses to start without a secret
 * of at least 32 characters; builds, development and database-less sites are not blocked.
 */
import { describe, expect, it } from "vitest";

import { minSecretLength, payloadSecret } from "./payload-secret";

const strong = "a".repeat(minSecretLength);
const prodWithDb = { NODE_ENV: "production", DATABASE_URL: "postgresql://u:p@127.0.0.1:5432/dklao_cms" };

describe("payloadSecret", () => {
  it("returns a proper secret", () => {
    expect(payloadSecret({ ...prodWithDb, PAYLOAD_SECRET: strong })).toBe(strong);
  });

  it("refuses to start a production server with a database and a missing or short secret", () => {
    expect(() => payloadSecret(prodWithDb)).toThrow(/PAYLOAD_SECRET must be at least 32 characters.*it is not set/);
    expect(() => payloadSecret({ ...prodWithDb, PAYLOAD_SECRET: "short" })).toThrow(/it has 5/);
    expect(() => payloadSecret({ ...prodWithDb, PAYLOAD_SECRET: `  ${"a".repeat(31)}  ` })).toThrow(/it has 31/);
  });

  it("never puts the secret itself in the error", () => {
    let message = "";
    try {
      payloadSecret({ ...prodWithDb, PAYLOAD_SECRET: "hunter2-not-long" });
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toContain("PAYLOAD_SECRET");
    expect(message).not.toContain("hunter2");
  });

  it("does not block `next build`, which runs without the server's settings", () => {
    expect(payloadSecret({ ...prodWithDb, NEXT_PHASE: "phase-production-build" })).toBe("");
  });

  it("does not block a site without a database, or development", () => {
    expect(payloadSecret({ NODE_ENV: "production" })).toBe("");
    expect(payloadSecret({ ...prodWithDb, DATABASE_URL: " " })).toBe("");
    expect(payloadSecret({ ...prodWithDb, NODE_ENV: "development" })).toBe("");
  });
});
