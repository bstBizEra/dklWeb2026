/**
 * The forklift rental inquiry endpoint runs the shared lead pipeline (lib/leads/intake.ts). Storage and
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
  rentalPeriod: "LONG_TERM",
  companyName: "Mekong Cold Chain",
  contactPerson: "Somsack Vong",
  phone: "+856 20 5555 1234",
  preferredContactMethod: "Phone",
  location: "Vientiane",
  capacity: "3 tonnes",
  liftHeight: "3 m",
  environment: "OUTDOOR",
  requirementDetail: "One forklift for a year at our new depot.",
};

const post = (body: unknown) =>
  POST(new Request("http://localhost/api/leads/rental", { method: "POST", headers: { "content-type": "application/json", "x-real-ip": "203.0.113.24" }, body: JSON.stringify(body) }));

beforeEach(() => {
  vi.stubEnv("LEAD_RATE_STORE", "memory");
  resetLeadLimiter();
  storeLead.mockReset().mockImplementation(async (lead: object) => ({ ...lead, leadId: "DKL-995", recordId: 9 }));
});

afterEach(() => {
  vi.unstubAllEnvs();
  resetLeadLimiter();
});

describe("POST /api/leads/rental", () => {
  it("saves the request as a NEW rental lead, whatever status the visitor sends", async () => {
    const response = await post({ ...good, status: "WON" });

    expect(response.status).toBe(200);
    expect((await response.json()).data).toEqual({ leadId: "DKL-995", status: "NEW" });
    expect(storeLead.mock.calls[0][0]).toMatchObject({
      leadType: "RENTAL_INQUIRY",
      equipmentOrServiceCategory: "Forklift rental: long term",
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
