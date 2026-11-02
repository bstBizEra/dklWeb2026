/**
 * The cleaning recommendation endpoint runs the shared lead pipeline (lib/leads/intake.ts). Storage and
 * notification are replaced here.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { resetLeadLimiter } from "@/lib/leads/guard";

const storeLead = vi.fn();

vi.mock("@/lib/leads/store", () => ({ storeLead: (lead: unknown) => storeLead(lead) }));
vi.mock("@/lib/leads/notify", () => ({ notifyNewLead: vi.fn(async () => "sent") }));
vi.mock("@/lib/leads/email", () => ({ emailNewLead: vi.fn(async () => "sent") }));
vi.mock("@/lib/ops/alert", () => ({ raiseAlert: vi.fn(async () => "throttled") }));

const { POST } = await import("./route");

const good = {
  machine: "sweeper",
  site: "DUST_DEBRIS",
  customerType: "BUSINESS",
  companyName: "Mekong Cold Chain",
  contactPerson: "Somsack Vong",
  phone: "+856 20 5555 1234",
  preferredContactMethod: "Phone",
  location: "Vientiane",
  requirementDetail: "Sand and pallet debris in a yard of 2,000 m2.",
};

const post = (body: unknown) =>
  POST(new Request("http://localhost/api/leads/cleaning", { method: "POST", headers: { "content-type": "application/json", "x-real-ip": "203.0.113.25" }, body: JSON.stringify(body) }));

beforeEach(() => {
  vi.stubEnv("LEAD_RATE_STORE", "memory");
  resetLeadLimiter();
  storeLead.mockReset().mockImplementation(async (lead: object) => ({ ...lead, leadId: "DKL-994", recordId: 10 }));
});

afterEach(() => {
  vi.unstubAllEnvs();
  resetLeadLimiter();
});

describe("POST /api/leads/cleaning", () => {
  it("saves the request as a NEW cleaning lead, whatever status the visitor sends", async () => {
    const response = await post({ ...good, status: "WON" });

    expect(response.status).toBe(200);
    expect((await response.json()).data).toEqual({ leadId: "DKL-994", status: "NEW" });
    expect(storeLead.mock.calls[0][0]).toMatchObject({
      leadType: "CLEANING_EQUIPMENT_RECOMMENDATION",
      equipmentOrServiceCategory: "Cleaning: sweeper",
      status: "NEW",
    });
  });

  it("refuses a request without a location", async () => {
    const response = await post({ ...good, location: "" });

    expect(response.status).toBe(400);
    expect(storeLead).not.toHaveBeenCalled();
  });

  it("saves nothing for a filled honeypot", async () => {
    expect((await post({ ...good, homepageUrl: "x" })).status).toBe(200);
    expect(storeLead).not.toHaveBeenCalled();
  });
});
