/**
 * The quote endpoint end to end, with storage and notification replaced: the honeypot, the per-address
 * limit, the size cap, validation, and the order of events (save first, notify second, never notify a
 * refused or fake request). Email to the inbox and the webhook both run after saving; when the save fails,
 * the email still goes out, and only when everything fails is the visitor told to call.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { resetLeadLimiter } from "@/lib/leads/guard";

const storeLead = vi.fn();
const notifyNewLead = vi.fn();
const emailNewLead = vi.fn();

vi.mock("@/lib/leads/store", () => ({ storeLead: (lead: unknown) => storeLead(lead) }));
vi.mock("@/lib/leads/notify", () => ({ notifyNewLead: (lead: unknown) => notifyNewLead(lead) }));
vi.mock("@/lib/leads/email", () => ({ emailNewLead: (lead: unknown) => emailNewLead(lead) }));

const { POST } = await import("./route");

const good = {
  companyName: "Mekong Cold Chain",
  contactPerson: "Somsack Vong",
  phone: "+856 20 5555 1234",
  equipmentOrServiceCategory: "Forklift rental",
  message: "Need a 3 tonne forklift for two weeks from Monday.",
};

function post(body: unknown, ip = "203.0.113.10", raw?: string) {
  return POST(
    new Request("http://localhost/api/leads/quote", {
      method: "POST",
      headers: { "content-type": "application/json", "x-real-ip": ip },
      body: raw ?? JSON.stringify(body),
    }),
  );
}

beforeEach(() => {
  vi.stubEnv("LEAD_RATE_LIMIT", "3");
  vi.stubEnv("LEAD_RATE_WINDOW_SECONDS", "600");
  resetLeadLimiter();
  storeLead.mockReset().mockImplementation(async (lead: object) => ({ ...lead, leadId: "DKL-777", recordId: 9 }));
  notifyNewLead.mockReset().mockResolvedValue("sent");
  emailNewLead.mockReset().mockResolvedValue("sent");
});

afterEach(() => {
  vi.unstubAllEnvs();
  resetLeadLimiter();
});

describe("POST /api/leads/quote", () => {
  it("saves a valid request, then notifies with the saved lead", async () => {
    const response = await post(good);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data.leadId).toBe("DKL-777");
    expect(storeLead).toHaveBeenCalledTimes(1);
    expect(notifyNewLead).toHaveBeenCalledTimes(1);
    expect(notifyNewLead.mock.calls[0][0]).toMatchObject({ leadId: "DKL-777", recordId: 9, companyName: "Mekong Cold Chain" });
  });

  it("still answers success when the notification fails", async () => {
    notifyNewLead.mockResolvedValue("failed");
    const response = await post(good);

    expect(response.status).toBe(200);
    expect(storeLead).toHaveBeenCalledTimes(1);
  });

  it("emails the saved lead to the inbox as well as the webhook", async () => {
    await post(good);

    expect(emailNewLead).toHaveBeenCalledTimes(1);
    expect(emailNewLead.mock.calls[0][0]).toMatchObject({ leadId: "DKL-777", companyName: "Mekong Cold Chain", phone: good.phone });
  });

  it("still receives the request when saving fails but the email goes out, with a fresh reference", async () => {
    storeLead.mockRejectedValue(new Error("database down"));
    notifyNewLead.mockResolvedValue("skipped");
    const response = await post(good);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.leadId).toMatch(/^DKL-[0-9a-f-]{36}$/);
    expect(emailNewLead.mock.calls[0][0]).toMatchObject({ leadId: json.data.leadId, message: good.message });
  });

  it("refuses with 500 only when saving and every notification fail", async () => {
    storeLead.mockRejectedValue(new Error("database down"));
    emailNewLead.mockResolvedValue("failed");
    notifyNewLead.mockResolvedValue("skipped");
    const response = await post(good);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error.code).toBe("INTEGRATION_FAILED");
    expect(json.error.message).toMatch(/call or WhatsApp/);
  });

  it("treats a filled hidden field as a bot: normal thank-you, nothing saved, nobody notified", async () => {
    const response = await post({ ...good, homepageUrl: "http://spam.example" });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(storeLead).not.toHaveBeenCalled();
    expect(notifyNewLead).not.toHaveBeenCalled();
    expect(emailNewLead).not.toHaveBeenCalled();
  });

  it("accepts a request whose hidden field is empty or only spaces", async () => {
    expect((await post({ ...good, homepageUrl: "" })).status).toBe(200);
    expect(storeLead).toHaveBeenCalledTimes(1);
  });

  it("counts bot attempts against the address limit", async () => {
    for (let i = 0; i < 3; i++) await post({ ...good, homepageUrl: "x" });
    const response = await post(good);

    expect(response.status).toBe(429);
    expect(storeLead).not.toHaveBeenCalled();
  });

  it("refuses the fourth request in the window with 429 and a Retry-After time", async () => {
    for (let i = 0; i < 3; i++) expect((await post(good)).status).toBe(200);
    const response = await post(good);
    const json = await response.json();

    expect(response.status).toBe(429);
    expect(json.error.code).toBe("RATE_LIMITED");
    expect(Number(response.headers.get("Retry-After"))).toBeGreaterThan(0);
    expect(storeLead).toHaveBeenCalledTimes(3);
    expect(notifyNewLead).toHaveBeenCalledTimes(3);
  });

  it("limits each address separately", async () => {
    for (let i = 0; i < 3; i++) await post(good, "198.51.100.1");
    expect((await post(good, "198.51.100.1")).status).toBe(429);
    expect((await post(good, "198.51.100.2")).status).toBe(200);
  });

  it("rejects invalid input with 400 and saves nothing", async () => {
    const bodies = [{}, { ...good, message: "hi" }, { ...good, phone: "abc" }, { ...good, email: "nope" }];

    for (const [index, body] of bodies.entries()) {
      const response = await post(body, `203.0.113.${100 + index}`);
      expect(response.status).toBe(400);
      expect((await response.json()).error.code).toBe("VALIDATION_ERROR");
    }
    expect(storeLead).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON and oversized bodies with 400", async () => {
    expect((await post(null, "203.0.113.20", "{not json")).status).toBe(400);
    expect((await post({ ...good, message: "x".repeat(25_000) }, "203.0.113.21")).status).toBe(400);
    expect(storeLead).not.toHaveBeenCalled();
  });

  it("does not let the hidden field reach storage", async () => {
    await post({ ...good, homepageUrl: "   " });

    expect(storeLead.mock.calls[0][0]).not.toHaveProperty("homepageUrl");
    expect(notifyNewLead.mock.calls[0][0]).not.toHaveProperty("homepageUrl");
  });
});
