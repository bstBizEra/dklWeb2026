/**
 * New-lead notification: configured only from environment variables, https only (http for localhost),
 * signed when a secret is set, personal details sent only when asked for, and never able to fail a lead.
 */
import { createHmac } from "node:crypto";

import { afterEach, describe, expect, it, vi } from "vitest";

import { buildNotification, notifyNewLead, readNotifyConfig, signBody, type NotifiableLead } from "./notify";
import { quoteRequestSchema } from "@/lib/validation/leads";

const lead: NotifiableLead = {
  ...quoteRequestSchema.parse({
    companyName: "Mekong Cold Chain",
    contactPerson: "Somsack Vong",
    phone: "+856 20 5555 1234",
    email: "ops@example.com",
    equipmentOrServiceCategory: "Forklift rental",
    message: "Need a 3 tonne forklift for two weeks from Monday.",
    sourcePage: "/forklift-rental",
  }),
  leadId: "DKL-1234",
  recordId: 42,
};

const env = { LEAD_NOTIFY_WEBHOOK_URL: "https://hooks.example.com/dklao", APP_URL: "https://www.dklao.com/" };

afterEach(() => vi.restoreAllMocks());

describe("notification settings", () => {
  it("is off without an address", () => {
    expect(readNotifyConfig({})).toBeNull();
    expect(readNotifyConfig({ LEAD_NOTIFY_WEBHOOK_URL: "   " })).toBeNull();
  });

  it("accepts https, and http only for localhost", () => {
    expect(readNotifyConfig(env)?.url).toBe("https://hooks.example.com/dklao");
    expect(readNotifyConfig({ LEAD_NOTIFY_WEBHOOK_URL: "http://localhost:8080/hook" })?.url).toBe("http://localhost:8080/hook");
    expect(readNotifyConfig({ LEAD_NOTIFY_WEBHOOK_URL: "http://hooks.example.com/dklao" })).toBeNull();
  });

  it("rejects malformed addresses, other schemes and embedded credentials", () => {
    for (const url of ["not a url", "ftp://hooks.example.com", "javascript:alert(1)", "https://user:pass@hooks.example.com/x"]) {
      expect(readNotifyConfig({ LEAD_NOTIFY_WEBHOOK_URL: url }), url).toBeNull();
    }
  });

  it("defaults to summary mode and only switches to full when asked", () => {
    expect(readNotifyConfig(env)?.details).toBe("summary");
    expect(readNotifyConfig({ ...env, LEAD_NOTIFY_DETAILS: "everything" })?.details).toBe("summary");
    expect(readNotifyConfig({ ...env, LEAD_NOTIFY_DETAILS: "full" })?.details).toBe("full");
    expect(readNotifyConfig(env)?.appUrl).toBe("https://www.dklao.com");
  });
});

describe("notification content", () => {
  it("summary mode sends no personal details", () => {
    const body = buildNotification(lead, { details: "summary", appUrl: "https://www.dklao.com" }, new Date("2026-10-23T03:00:00Z"));
    const json = JSON.stringify(body);

    expect(body).toMatchObject({ event: "lead.created", leadId: "DKL-1234", category: "Forklift rental", company: "Mekong Cold Chain", receivedAt: "2026-10-23T03:00:00.000Z" });
    expect(body.adminUrl).toBe("https://www.dklao.com/admin/collections/leads/42");
    for (const secret of ["Somsack", "+856 20 5555 1234", "ops@example.com", "3 tonne"]) expect(json).not.toContain(secret);
    expect(String(body.text)).toContain("DKL-1234");
  });

  it("full mode adds the contact and the message, trimmed", () => {
    const long = { ...lead, message: "x".repeat(900) };
    const body = buildNotification(long, { details: "full", appUrl: "https://www.dklao.com" });

    expect(body.contact).toEqual({ name: "Somsack Vong", phone: "+856 20 5555 1234", email: "ops@example.com" });
    expect(String(body.message).length).toBe(500);
    expect(String(body.text)).toContain("+856 20 5555 1234");
  });

  it("leaves out the admin link when the lead has no record id", () => {
    const local: NotifiableLead = { ...lead, recordId: undefined };
    expect(buildNotification(local, { details: "summary", appUrl: "https://www.dklao.com" }).adminUrl).toBeUndefined();
  });
});

describe("fallback leads", () => {
  it("tells the receiver when a lead is not in the CMS", () => {
    const body = buildNotification({ ...lead, notInCms: true }, { details: "summary", appUrl: "https://www.dklao.com" });
    expect(body.notInCms).toBe(true);
    expect(body.text).toContain("NOT IN THE CMS YET");
    expect(buildNotification(lead, { details: "summary", appUrl: "https://www.dklao.com" })).not.toHaveProperty("notInCms");
  });
});

describe("sending", () => {
  it("skips quietly when not configured", async () => {
    const send = vi.fn();
    expect(await notifyNewLead(lead, {}, send as unknown as typeof fetch)).toBe("skipped");
    expect(send).not.toHaveBeenCalled();
  });

  it("posts JSON with a signature that verifies, when a secret is set", async () => {
    const send = vi.fn().mockResolvedValue(new Response("ok", { status: 200 }));
    const result = await notifyNewLead(lead, { ...env, LEAD_NOTIFY_WEBHOOK_SECRET: "shared-secret" }, send as unknown as typeof fetch);

    expect(result).toBe("sent");
    const [url, init] = send.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://hooks.example.com/dklao");
    expect(init.method).toBe("POST");
    expect(init.redirect).toBe("error");
    const headers = init.headers as Record<string, string>;
    expect(headers["X-DKLAO-Event"]).toBe("lead.created");
    expect(headers["X-DKLAO-Signature"]).toBe("sha256=" + createHmac("sha256", "shared-secret").update(init.body as string).digest("hex"));
    expect(headers["X-DKLAO-Signature"]).toBe(signBody("shared-secret", init.body as string));
  });

  it("sends no signature header when there is no secret", async () => {
    const send = vi.fn().mockResolvedValue(new Response("ok"));
    await notifyNewLead(lead, env, send as unknown as typeof fetch);

    expect((send.mock.calls[0][1].headers as Record<string, string>)["X-DKLAO-Signature"]).toBeUndefined();
  });

  it("reports failure without throwing, and logs no personal details", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    for (const send of [vi.fn().mockResolvedValue(new Response("no", { status: 500 })), vi.fn().mockRejectedValue(new Error("boom +856 20 5555 1234"))]) {
      expect(await notifyNewLead(lead, { ...env, LEAD_NOTIFY_DETAILS: "full" }, send as unknown as typeof fetch)).toBe("failed");
    }

    const logged = warn.mock.calls.flat().join(" ");
    expect(logged).toContain("DKL-1234");
    for (const secret of ["Somsack", "+856", "ops@example.com", "boom"]) expect(logged).not.toContain(secret);
  });
});
