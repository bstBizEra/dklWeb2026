import nodemailer from "nodemailer";

import { readEmailConfig, type EmailConfig } from "@/lib/leads/email";
import { safeWebhookUrl, signBody } from "@/lib/leads/notify";

// Operations alerts: tells whoever runs the site that the lead pipeline is degraded, so a failure is not
// only a line in a log nobody reads. Settings (all optional; without them alerts are only logged):
//
//   OPS_ALERT_WEBHOOK_URL       https address (Slack or Discord incoming webhook, n8n, Make, a WhatsApp
//                               gateway). The body carries `text` (Slack) and `content` (Discord).
//   OPS_ALERT_WEBHOOK_SECRET    optional. Signs the body: X-DKLAO-Signature: sha256=<hex hmac>.
//   OPS_ALERT_EMAIL             one or more addresses, comma-separated, sent through the lead SMTP account.
//                               Useless when SMTP itself is the problem, which is why the webhook exists.
//   OPS_ALERT_THROTTLE_SECONDS  at most one alert per kind per this many seconds (default 900). Held-back
//                               alerts are counted and reported with the next one.
//
// Every alert is logged as `[alert] <severity> <kind> ...`, whether or not a channel is set, so the journal
// can be searched too. Alerts carry the lead reference and a reason, never customer details.

export type AlertKind =
  | "lead.all_failed"
  | "lead.not_in_cms"
  | "lead.email_failed"
  | "lead.webhook_failed"
  | "lead.photos_failed"
  | "lead.photos_not_in_cms"
  | "ratelimit.no_address"
  | "ratelimit.store_failed";

type Severity = "critical" | "warning";

const catalogue: Record<AlertKind, { severity: Severity; message: string }> = {
  "lead.all_failed": {
    severity: "critical",
    message: "A quote request could not be saved, emailed or sent to the webhook. The visitor was asked to call. Check the database, SMTP and webhook settings now.",
  },
  "lead.not_in_cms": {
    severity: "warning",
    message: "The database save failed, so a quote request is only in data/leads-local.jsonl on the server. Fix the database, then run pnpm cms:import-fallback-leads.",
  },
  "lead.email_failed": {
    severity: "warning",
    message: "A quote request was saved, but the email to the inbox failed. Check the SMTP settings and the mail server.",
  },
  "lead.webhook_failed": {
    severity: "warning",
    message: "A quote request was saved, but the new-lead webhook failed. Check LEAD_NOTIFY_WEBHOOK_URL and the receiving service.",
  },
  "lead.photos_not_in_cms": {
    severity: "warning",
    message: "A lead is in the CMS, but the CMS refused its photos, so they are only in data/lead-photos on the server. Check the disk (LEAD_PHOTOS_DIR or data/cms-lead-photos), then run pnpm cms:import-fallback-leads.",
  },
  "lead.photos_failed": {
    severity: "warning",
    message: "A request came with photos, but they could not be saved, so its message mentions photos the CMS does not have. Check the disk (LEAD_PHOTOS_DIR or data/cms-lead-photos) and the database, then ask the customer to resend them.",
  },
  "ratelimit.no_address": {
    severity: "warning",
    message: "Quote requests arrive without X-Real-IP, so they share one rate limit. Check the proxy in front of the app.",
  },
  "ratelimit.store_failed": {
    severity: "warning",
    message: "The shared rate-limit store in the database failed; this server process is limiting from memory instead. Check the database.",
  },
};

export type AlertConfig = {
  webhookUrl: string | null;
  webhookSecret?: string;
  email: (EmailConfig & { to: string[] }) | null;
  throttleMs: number;
  site: string;
};

const address = /^[^\s@,<>]+@[^\s@,<>]+\.[a-z]{2,}$/i;

export function readAlertConfig(env: Record<string, string | undefined> = process.env): AlertConfig {
  const to = (env.OPS_ALERT_EMAIL ?? "").split(",").map((entry) => entry.trim()).filter(Boolean);
  const smtp = to.length && to.every((entry) => address.test(entry)) ? readEmailConfig(env) : null;
  const seconds = Number.parseInt(env.OPS_ALERT_THROTTLE_SECONDS ?? "", 10);

  return {
    webhookUrl: safeWebhookUrl(env.OPS_ALERT_WEBHOOK_URL),
    webhookSecret: env.OPS_ALERT_WEBHOOK_SECRET?.trim() || undefined,
    email: smtp ? { ...smtp, to } : null,
    throttleMs: (Number.isFinite(seconds) && seconds >= 0 ? seconds : 900) * 1000,
    site: (env.APP_URL ?? "https://www.dklao.com").replace(/\/$/, ""),
  };
}

export type AlertDetail = { leadId?: string; reason?: string };
export type ChannelResult = "sent" | "skipped" | "failed";
export type AlertOutcome = "throttled" | { webhook: ChannelResult; email: ChannelResult };

type Deps = {
  env?: Record<string, string | undefined>;
  now?: number;
  send?: typeof fetch;
  createTransport?: (config: EmailConfig) => { sendMail: (message: Record<string, unknown>) => Promise<unknown> };
  log?: (line: string) => void;
};

const lastSent = new Map<AlertKind, number>();
const heldBack = new Map<AlertKind, number>();

export function resetAlerts(): void {
  lastSent.clear();
  heldBack.clear();
}

// Only references and short machine reasons: anything else is dropped.
const safe = (value: string | undefined) => value?.replace(/[^\w\-.: ]/g, "").slice(0, 80) || undefined;

export function buildAlert(kind: AlertKind, detail: AlertDetail, site: string, suppressed: number, now: Date) {
  const { severity, message } = catalogue[kind];
  const leadId = safe(detail.leadId);
  const reason = safe(detail.reason);
  const extra = [leadId && `Lead: ${leadId}`, reason && `Reason: ${reason}`, suppressed > 0 && `${suppressed} more of these since the last alert`]
    .filter(Boolean)
    .join(". ");
  const text = `DK LAO website ${severity.toUpperCase()}: ${message}${extra ? ` ${extra}.` : ""} (${site})`;

  return {
    event: "ops.alert",
    kind,
    severity,
    message,
    ...(leadId ? { leadId } : {}),
    ...(reason ? { reason } : {}),
    suppressed,
    site,
    at: now.toISOString(),
    text,
    content: text,
  };
}

// Never throws. Returns what happened, for tests and the log.
export async function raiseAlert(kind: AlertKind, detail: AlertDetail = {}, deps: Deps = {}): Promise<AlertOutcome> {
  const env = deps.env ?? process.env;
  const now = deps.now ?? Date.now();
  const log = deps.log ?? console.warn;
  const config = readAlertConfig(env);

  const last = lastSent.get(kind);
  if (last !== undefined && now - last < config.throttleMs) {
    heldBack.set(kind, (heldBack.get(kind) ?? 0) + 1);
    return "throttled";
  }
  const suppressed = heldBack.get(kind) ?? 0;
  lastSent.set(kind, now);
  heldBack.delete(kind);

  const alert = buildAlert(kind, detail, config.site, suppressed, new Date(now));
  log(`[alert] ${alert.severity} ${kind}${alert.leadId ? ` ${alert.leadId}` : ""}${alert.reason ? ` (${alert.reason})` : ""}`);

  const [webhook, email] = await Promise.all([sendWebhook(alert, config, deps.send ?? fetch), sendEmail(alert, config, deps)]);
  if (webhook === "failed" || email === "failed") log(`[alert] delivery of ${kind}: webhook ${webhook}, email ${email}`);
  return { webhook, email };
}

async function sendWebhook(alert: ReturnType<typeof buildAlert>, config: AlertConfig, send: typeof fetch): Promise<ChannelResult> {
  if (!config.webhookUrl) return "skipped";
  const body = JSON.stringify(alert);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": "dklao-ops-alert/1",
    "X-DKLAO-Event": "ops.alert",
  };
  if (config.webhookSecret) headers["X-DKLAO-Signature"] = signBody(config.webhookSecret, body);

  try {
    const response = await send(config.webhookUrl, { method: "POST", headers, body, redirect: "error", signal: AbortSignal.timeout(4000) });
    return response.ok ? "sent" : "failed";
  } catch {
    return "failed";
  }
}

async function sendEmail(alert: ReturnType<typeof buildAlert>, config: AlertConfig, deps: Deps): Promise<ChannelResult> {
  if (!config.email) return "skipped";
  const smtp = config.email;
  const transport = (deps.createTransport ??
    ((c: EmailConfig) =>
      nodemailer.createTransport({ host: c.host, port: c.port, secure: c.secure, auth: c.auth, connectionTimeout: 8000, greetingTimeout: 8000, socketTimeout: 10000 })))(smtp);

  try {
    await transport.sendMail({
      from: smtp.from,
      to: smtp.to,
      subject: `[DK LAO ${alert.severity.toUpperCase()}] ${alert.kind}${alert.leadId ? ` ${alert.leadId}` : ""}`,
      text: alert.text,
    });
    return "sent";
  } catch {
    return "failed";
  }
}
