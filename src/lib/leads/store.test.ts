/**
 * Without DATABASE_URL the quote form keeps saving to the local JSONL file, so the site still works
 * before the CMS database exists. With it, leads go to the Payload "leads" collection.
 */
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
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
    // Without a database the file is the store, not a fallback.
    expect(stored.notInCms).toBeUndefined();
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
    // Marked, so the email and the webhook tell staff it is not in /admin, and logged with the fix.
    expect(stored.notInCms).toBe(true);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining(`FALLBACK ${stored.leadId}`));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("pnpm cms:import-fallback-leads"));
    // Customer details: readable by the app's own user only.
    if (process.platform !== "win32") {
      expect((await stat(path.join(dir, "data", "leads-local.jsonl"))).mode & 0o777).toBe(0o600);
    }
    vi.doUnmock("payload");
    vi.doUnmock("@payload-config");
    await rm(dir, { recursive: true, force: true });
  });

  it("falls back to the file, with the same reference, when the database stops answering", async () => {
    // A database that went away mid-connection: the save never settles.
    vi.doMock("payload", () => ({ getPayload: async () => ({ db: {}, create: () => new Promise(() => {}) }) }));
    vi.doMock("@payload-config", () => ({ default: {} }));
    vi.stubEnv("DATABASE_URL", "postgres://127.0.0.1:1/none");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const dir = await mkdtemp(path.join(tmpdir(), "dkl-"));
    vi.spyOn(process, "cwd").mockReturnValue(dir);

    const started = Date.now();
    const stored = await storeLead(sample, 50);

    expect(Date.now() - started).toBeLessThan(2000);
    expect(stored.notInCms).toBe(true);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("database save failed (SaveTimeout)"));
    const saved = JSON.parse((await readFile(path.join(dir, "data", "leads-local.jsonl"), "utf8")).trim());
    expect(saved.leadId).toBe(stored.leadId);
    vi.doUnmock("payload");
    vi.doUnmock("@payload-config");
    await rm(dir, { recursive: true, force: true });
  });

  it("gives the database row the reference chosen before saving", async () => {
    const create = vi.fn(async ({ data }: { data: { leadId: string } }) => ({ id: 7, leadId: data.leadId }));
    vi.doMock("payload", () => ({ getPayload: async () => ({ db: {}, create }) }));
    vi.doMock("@payload-config", () => ({ default: {} }));
    vi.stubEnv("DATABASE_URL", "postgres://127.0.0.1:1/none");

    const stored = await storeLead(sample);

    expect(stored.leadId).toMatch(/^DKL-[0-9a-f-]{36}$/);
    expect(create.mock.calls[0][0].data.leadId).toBe(stored.leadId);
    expect(stored.recordId).toBe(7);
    vi.doUnmock("payload");
    vi.doUnmock("@payload-config");
  });
});
