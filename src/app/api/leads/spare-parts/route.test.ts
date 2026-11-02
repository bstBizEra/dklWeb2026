/**
 * The spare parts request endpoint runs the shared lead pipeline (lib/leads/intake.ts). Storage and
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
  productGroup: "warehouse",
  partType: "ACCESSORY",
  companyName: "Mekong Cold Chain",
  contactPerson: "Somsack Vong",
  phone: "+856 20 5555 1234",
  preferredContactMethod: "Phone",
  equipmentType: "Pallet truck",
  equipmentBrand: "Toyota",
  partDescription: "Replacement load wheels for a hand pallet truck.",
  quantity: "4",
  urgency: "URGENT",
  installationNeed: "NO",
  location: "Vientiane",
};

const post = (body: unknown) =>
  POST(new Request("http://localhost/api/leads/spare-parts", { method: "POST", headers: { "content-type": "application/json", "x-real-ip": "203.0.113.21" }, body: JSON.stringify(body) }));

beforeEach(() => {
  vi.stubEnv("LEAD_RATE_STORE", "memory");
  resetLeadLimiter();
  storeLead.mockReset().mockImplementation(async (lead: object) => ({ ...lead, leadId: "DKL-998", recordId: 6 }));
});

afterEach(() => {
  vi.unstubAllEnvs();
  resetLeadLimiter();
});

describe("POST /api/leads/spare-parts", () => {
  it("saves the request as a NEW parts lead, whatever status the visitor sends", async () => {
    const response = await post({ ...good, status: "WON" });

    expect(response.status).toBe(200);
    expect((await response.json()).data).toEqual({ leadId: "DKL-998", status: "NEW" });
    expect(storeLead.mock.calls[0][0]).toMatchObject({
      leadType: "SPARE_PARTS_INQUIRY",
      equipmentOrServiceCategory: "Warehouse parts",
      status: "NEW",
    });
  });

  it("refuses a request without a part description", async () => {
    const response = await post({ ...good, partDescription: "" });

    expect(response.status).toBe(400);
    expect(storeLead).not.toHaveBeenCalled();
  });

  it("saves nothing for a filled honeypot", async () => {
    expect((await post({ ...good, homepageUrl: "x" })).status).toBe(200);
    expect(storeLead).not.toHaveBeenCalled();
  });
});
