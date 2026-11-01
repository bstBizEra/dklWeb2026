/**
 * The contact endpoint runs the same pipeline as the quote endpoint (lib/leads/intake.ts): per-address limit,
 * size cap, honeypot, validation, save, then email and webhook. Storage and notification are replaced here.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { resetLeadLimiter } from "@/lib/leads/guard";

const storeLead = vi.fn();
const notifyNewLead = vi.fn();
const emailNewLead = vi.fn();

vi.mock("@/lib/leads/store", () => ({ storeLead: (lead: unknown) => storeLead(lead) }));
vi.mock("@/lib/leads/notify", () => ({ notifyNewLead: (lead: unknown) => notifyNewLead(lead) }));
vi.mock("@/lib/leads/email", () => ({ emailNewLead: (lead: unknown) => emailNewLead(lead) }));
vi.mock("@/lib/ops/alert", () => ({ raiseAlert: vi.fn(async () => "throttled") }));

const { POST } = await import("./route");

const good = {
  inquiryType: "Maintenance Service",
  companyName: "Mekong Cold Chain",
  contactPerson: "Somsack Vong",
  phone: "+856 20 5555 1234",
  preferredContactMethod: "Phone",
  message: "Our reach truck stops lifting after an hour of work.",
};

const post = (body: unknown, ip = "203.0.113.10") =>
  POST(new Request("http://localhost/api/contact", { method: "POST", headers: { "content-type": "application/json", "x-real-ip": ip }, body: JSON.stringify(body) }));

beforeEach(() => {
  vi.stubEnv("LEAD_RATE_LIMIT", "3");
  vi.stubEnv("LEAD_RATE_STORE", "memory");
  resetLeadLimiter();
  storeLead.mockReset().mockImplementation(async (lead: object) => ({ ...lead, leadId: "DKL-888", recordId: 4 }));
  notifyNewLead.mockReset().mockResolvedValue("sent");
  emailNewLead.mockReset().mockResolvedValue("sent");
});

afterEach(() => {
  vi.unstubAllEnvs();
  resetLeadLimiter();
});

describe("POST /api/contact", () => {
  it("saves the inquiry as a NEW contact lead at the server's time and notifies the team", async () => {
    const before = Date.now();
    const response = await post({ ...good, status: "WON", submissionTimestamp: "2000-01-01T00:00:00.000Z" });

    expect(response.status).toBe(200);
    expect((await response.json()).data).toEqual({ leadId: "DKL-888", status: "NEW" });
    const saved = storeLead.mock.calls[0][0];
    expect(saved).toMatchObject({ leadType: "CONTACT_GENERAL", equipmentOrServiceCategory: "Maintenance Service", status: "NEW" });
    expect(saved.message).toContain("Preferred contact: Phone");
    expect(Date.parse(saved.submissionTimestamp)).toBeGreaterThanOrEqual(before);
    expect(emailNewLead).toHaveBeenCalledTimes(1);
    expect(notifyNewLead).toHaveBeenCalledTimes(1);
  });

  it("refuses an invalid inquiry with the field problems", async () => {
    const response = await post({ ...good, phone: "call me" });

    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe("VALIDATION_ERROR");
    expect(storeLead).not.toHaveBeenCalled();
  });

  it("answers a filled honeypot with a thank-you and saves nothing", async () => {
    const response = await post({ ...good, homepageUrl: "https://spam.example" });

    expect(response.status).toBe(200);
    expect(storeLead).not.toHaveBeenCalled();
  });

  it("shares the per-address limit with the other lead forms", async () => {
    for (let i = 0; i < 3; i++) expect((await post(good)).status).toBe(200);
    expect((await post(good)).status).toBe(429);
  });
});
