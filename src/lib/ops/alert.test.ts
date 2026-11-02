/**
 * Ops alerts: logged always, sent to the webhook and/or email when configured, at most once per kind per
 * throttle window (held-back alerts are counted into the next one), never carrying customer details, and
 * never throwing when a channel fails.
 */
import { createHmac } from "node:crypto";

import { afterEach, describe, expect, it, vi } from "vitest";

import { buildAlert, raiseAlert, readAlertConfig, resetAlerts } from "./alert";

afterEach(() => resetAlerts());

const webhookEnv = { OPS_ALERT_WEBHOOK_URL: "https://hooks.example.com/ops", APP_URL: "https://preview.dklao.com" };
const ok = () => vi.fn(async () => new Response(null, { status: 200 }));

describe("alert settings", () => {
  it("is log-only without channels and refuses unsafe webhook addresses", () => {
    expect(readAlertConfig({})).toMatchObject({ webhookUrl: null, email: null, throttleMs: 900_000 });
    expect(readAlertConfig({ OPS_ALERT_WEBHOOK_URL: "http://hooks.example.com" }).webhookUrl).toBeNull();
    expect(readAlertConfig({ OPS_ALERT_WEBHOOK_URL: "https://u:p@hooks.example.com" }).webhookUrl).toBeNull();
  });

  it("emails only with SMTP set and valid addresses", () => {
    const smtp = { SMTP_HOST: "mail.dklao.com", SMTP_PORT: "465", SMTP_USER: "notify@dklao.com", SMTP_PASS: "x" };
    expect(readAlertConfig({ ...smtp, OPS_ALERT_EMAIL: "ops@dklao.com, it@bizera.la" }).email?.to).toEqual(["ops@dklao.com", "it@bizera.la"]);
    expect(readAlertConfig({ ...smtp, OPS_ALERT_EMAIL: "not an address" }).email).toBeNull();
    expect(readAlertConfig({ OPS_ALERT_EMAIL: "ops@dklao.com" }).email).toBeNull();
  });
});

describe("alert content", () => {
  it("works for Slack and Discord and carries no customer details", () => {
    const alert = buildAlert("lead.all_failed", { leadId: "DKL-1", reason: "Error\nBcc: x@y.z <script>" }, "https://www.dklao.com", 2, new Date(0));
    expect(alert.severity).toBe("critical");
    expect(alert.text).toBe(alert.content);
    expect(alert.text).toContain("Lead: DKL-1");
    expect(alert.text).toContain("2 more of these since the last alert");
    expect(alert.reason).not.toMatch(/[\n<>@]/);
  });
});

describe("raiseAlert", () => {
  it("logs and posts a signed alert to the webhook", async () => {
    const send = ok();
    const log = vi.fn();
    const outcome = await raiseAlert("lead.email_failed", { leadId: "DKL-2" }, { env: { ...webhookEnv, OPS_ALERT_WEBHOOK_SECRET: "s3" }, send, log });

    expect(outcome).toEqual({ webhook: "sent", email: "skipped" });
    expect(log).toHaveBeenCalledWith("[alert] warning lead.email_failed DKL-2");
    const [url, init] = send.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://hooks.example.com/ops");
    const expected = `sha256=${createHmac("sha256", "s3").update(init.body as string).digest("hex")}`;
    expect((init.headers as Record<string, string>)["X-DKLAO-Signature"]).toBe(expected);
    expect(JSON.parse(init.body as string)).toMatchObject({ event: "ops.alert", kind: "lead.email_failed", site: "https://preview.dklao.com" });
  });

  it("sends each kind at most once per window and counts what it held back", async () => {
    const send = ok();
    const deps = { env: webhookEnv, send, log: () => {} };
    expect(await raiseAlert("lead.webhook_failed", {}, { ...deps, now: 0 })).not.toBe("throttled");
    expect(await raiseAlert("lead.webhook_failed", {}, { ...deps, now: 60_000 })).toBe("throttled");
    expect(await raiseAlert("lead.webhook_failed", {}, { ...deps, now: 120_000 })).toBe("throttled");
    // Another kind is not held back by this one.
    expect(await raiseAlert("lead.not_in_cms", {}, { ...deps, now: 120_000 })).not.toBe("throttled");
    // After the window: sent again, reporting the two held back.
    await raiseAlert("lead.webhook_failed", {}, { ...deps, now: 901_000 });

    expect(send).toHaveBeenCalledTimes(3);
    expect(JSON.parse((send.mock.calls[2] as unknown as [string, RequestInit])[1].body as string).suppressed).toBe(2);
  });

  it("emails through the SMTP account", async () => {
    const sendMail = vi.fn(async () => ({}));
    const env = { SMTP_HOST: "mail.dklao.com", SMTP_PORT: "465", SMTP_USER: "notify@dklao.com", SMTP_PASS: "x", OPS_ALERT_EMAIL: "ops@dklao.com" };
    const outcome = await raiseAlert("lead.not_in_cms", { leadId: "DKL-3" }, { env, createTransport: () => ({ sendMail }), log: () => {} });

    expect(outcome).toEqual({ webhook: "skipped", email: "sent" });
    expect(sendMail.mock.calls[0]).toMatchObject([{ to: ["ops@dklao.com"], subject: "[DK LAO WARNING] lead.not_in_cms DKL-3" }]);
  });

  it("never throws when every channel fails", async () => {
    const send = vi.fn(async () => {
      throw new Error("offline");
    });
    const env = { ...webhookEnv, SMTP_HOST: "mail.dklao.com", SMTP_FROM: "notify@dklao.com", OPS_ALERT_EMAIL: "ops@dklao.com" };
    const createTransport = () => ({ sendMail: async () => Promise.reject(new Error("smtp down")) });
    const log = vi.fn();

    const outcome = await raiseAlert("lead.all_failed", {}, { env, send, createTransport, log });

    expect(outcome).toEqual({ webhook: "failed", email: "failed" });
    expect(log).toHaveBeenCalledWith("[alert] delivery of lead.all_failed: webhook failed, email failed");
  });
});
