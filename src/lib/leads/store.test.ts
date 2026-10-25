/**
 * Without DATABASE_URL the quote form keeps saving to the local JSONL file, so the site still works
 * before the CMS database exists. With it, leads go to the Payload "leads" collection.
 */
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { storeLead } from "./store";
import { quoteRequestSchema } from "@/lib/validation/leads";

const sample = quoteRequestSchema.parse({
  companyName: "Test Co",
  contactPerson: "Test Person",
  phone: "+856 20 0000 0000",
  equipmentOrServiceCategory: "Forklift rental",
  message: "We need a 3 tonne forklift for two weeks.",
});

describe("storeLead", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("falls back to the local file when no database is configured", async () => {
    vi.stubEnv("DATABASE_URL", "");
    const dir = await mkdtemp(path.join(tmpdir(), "dkl-"));
    vi.spyOn(process, "cwd").mockReturnValue(dir);
    const stored = await storeLead(sample);
    expect(stored.leadId).toMatch(/^DKL-/);
    const line = (await readFile(path.join(dir, "data", "leads-local.jsonl"), "utf8")).trim();
    expect(JSON.parse(line).companyName).toBe("Test Co");
    await rm(dir, { recursive: true, force: true });
  });

  it("saves to the local file instead of losing the lead when the database cannot be reached", async () => {
    vi.doMock("payload", () => ({ getPayload: async () => Promise.reject(new Error("ECONNREFUSED")) }));
    vi.doMock("@payload-config", () => ({ default: {} }));
    vi.stubEnv("DATABASE_URL", "postgres://127.0.0.1:1/none");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const dir = await mkdtemp(path.join(tmpdir(), "dkl-"));
    vi.spyOn(process, "cwd").mockReturnValue(dir);

    const stored = await storeLead(sample);

    expect(stored.leadId).toMatch(/^DKL-/);
    expect(JSON.parse((await readFile(path.join(dir, "data", "leads-local.jsonl"), "utf8")).trim()).message).toBe(sample.message);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("database save failed"));
    vi.doUnmock("payload");
    vi.doUnmock("@payload-config");
    await rm(dir, { recursive: true, force: true });
  });
});
