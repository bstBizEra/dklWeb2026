/**
 * The warehouse inquiry endpoint runs the shared lead pipeline (lib/leads/intake.ts). Storage and
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
  need: "material-handling",
  companyName: "Mekong Cold Chain",
  contactPerson: "Somsack Vong",
  phone: "+856 20 5555 1234",
  preferredContactMethod: "Phone",
  siteLocation: "Vientiane",
  installationNeed: "NO",
  requirementDetail: "Two stackers for a new cold store.",
};

const post = (body: unknown) =>
  POST(new Request("http://localhost/api/leads/warehouse", { method: "POST", headers: { "content-type": "application/json", "x-real-ip": "203.0.113.22" }, body: JSON.stringify(body) }));

beforeEach(() => {
  vi.stubEnv("LEAD_RATE_STORE", "memory");
  resetLeadLimiter();
  storeLead.mockReset().mockImplementation(async (lead: object) => ({ ...lead, leadId: "DKL-997", recordId: 7 }));
});

afterEach(() => {
  vi.unstubAllEnvs();
  resetLeadLimiter();
});

describe("POST /api/leads/warehouse", () => {
  it("saves the request as a NEW warehouse lead, whatever status the visitor sends", async () => {
    const response = await post({ ...good, status: "WON" });

    expect(response.status).toBe(200);
    expect((await response.json()).data).toEqual({ leadId: "DKL-997", status: "NEW" });
    expect(storeLead.mock.calls[0][0]).toMatchObject({
      leadType: "QUOTE_REQUEST",
      equipmentOrServiceCategory: "Warehouse: material handling",
      status: "NEW",
    });
  });

  it("refuses a request without a site location", async () => {
    const response = await post({ ...good, siteLocation: "" });

    expect(response.status).toBe(400);
    expect(storeLead).not.toHaveBeenCalled();
  });

  it("saves nothing for a filled honeypot", async () => {
    expect((await post({ ...good, homepageUrl: "x" })).status).toBe(200);
    expect(storeLead).not.toHaveBeenCalled();
  });
});
