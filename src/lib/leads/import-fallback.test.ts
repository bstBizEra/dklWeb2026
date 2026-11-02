/**
 * Importing leads saved to data/leads-local.jsonl while the database was down: every valid line is
 * imported once with its original reference, leads already in the CMS are skipped (safe to re-run),
 * bad lines are reported by number, and one failed save never stops the rest.
 */
import { describe, expect, it, vi } from "vitest";

import { importFallbackLeads, parseFallbackFile, type FallbackLead } from "./import-fallback";

const base = {
  leadType: "RENTAL_INQUIRY",
  companyName: "Mekong Cold Chain",
  contactPerson: "Somsack Vong",
  phone: "+856 20 5555 1234",
  equipmentOrServiceCategory: "Forklift rental",
  message: "Need a 3 tonne forklift for two weeks from Monday.",
  sourcePage: "/forklift-rental",
  submissionTimestamp: "2026-10-25T09:00:00.000Z",
  status: "NEW",
};
const id = (n: number) => `DKL-00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const line = (n: number, extra: object = {}) => JSON.stringify({ ...base, leadId: id(n), ...extra });

describe("parseFallbackFile", () => {
  it("reads every valid line, keeps its reference and keeps the original time", () => {
    const { leads, invalidLines } = parseFallbackFile(`${line(1)}\n${line(2)}\n`);
    expect(invalidLines).toEqual([]);
    expect(leads.map((entry) => entry.leadId)).toEqual([id(1), id(2)]);
    expect(leads[0].lead.submissionTimestamp).toBe(base.submissionTimestamp);
    expect(leads[0].lead).not.toHaveProperty("leadId");
  });

  it("reports broken, invalid and reference-less lines by number and skips blank ones", () => {
    const text = [line(1), "{not json", "", JSON.stringify(base), line(3, { phone: "abc" }), line(4)].join("\n");
    const { leads, invalidLines } = parseFallbackFile(text);
    expect(leads.map((entry) => entry.leadId)).toEqual([id(1), id(4)]);
    expect(invalidLines).toEqual([2, 4, 5]);
  });

  it("imports a line written twice only once and drops the spam-trap field", () => {
    const { leads } = parseFallbackFile([line(1, { homepageUrl: "" }), line(1)].join("\n"));
    expect(leads).toHaveLength(1);
    expect(leads[0].lead).not.toHaveProperty("homepageUrl");
  });
});

describe("importFallbackLeads", () => {
  const entries = (...ns: number[]): FallbackLead[] => parseFallbackFile(ns.map((n) => line(n)).join("\n")).leads;

  it("creates missing leads and skips ones already in the CMS", async () => {
    const create = vi.fn<(entry: FallbackLead) => Promise<void>>(async () => {});
    const summary = await importFallbackLeads(entries(1, 2), { exists: async (leadId) => leadId === id(1), create });

    expect(summary).toEqual({ imported: [id(2)], alreadyInCms: [id(1)], failed: [] });
    expect(create).toHaveBeenCalledTimes(1);
    expect(create.mock.calls[0][0]).toMatchObject({ leadId: id(2), lead: { companyName: "Mekong Cold Chain" } });
  });

  it("is safe to run twice", async () => {
    const saved = new Set<string>();
    const target = { exists: async (leadId: string) => saved.has(leadId), create: async (entry: FallbackLead) => void saved.add(entry.leadId) };

    expect((await importFallbackLeads(entries(1, 2), target)).imported).toHaveLength(2);
    expect(await importFallbackLeads(entries(1, 2), target)).toEqual({ imported: [], alreadyInCms: [id(1), id(2)], failed: [] });
  });

  it("reports a failed save and carries on with the rest", async () => {
    const summary = await importFallbackLeads(entries(1, 2), {
      exists: async () => false,
      create: async (entry) => {
        if (entry.leadId === id(1)) throw new Error("db down");
      },
    });
    expect(summary).toEqual({ imported: [id(2)], alreadyInCms: [], failed: [id(1)] });
  });
});
