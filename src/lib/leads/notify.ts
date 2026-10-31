import { createHmac } from "node:crypto";

import type { QuoteRequest } from "@/lib/validation/leads";

// New-lead notification through one outbound webhook. A webhook reaches email, WhatsApp and chat through
// any automation service (Make, n8n, Zapier, a WhatsApp Business gateway, Slack) without this code knowing
// about any of them, and nothing secret lives in the repository: the address and the signing secret come
// from environment variables. The visitor's request is saved first; a failed notification never fails it.
//
//   LEAD_NOTIFY_WEBHOOK_URL     https address to call (http only for localhost). Empty means no notification.
//   LEAD_NOTIFY_WEBHOOK_SECRET  optional. When set, the body is signed: X-DKLAO-Signature: sha256=<hex hmac>.
//   LEAD_NOTIFY_DETAILS         "summary" (default) sends no personal details; "full" adds name, phone, email, message.

export type NotifiableLead = QuoteRequest & { leadId: string; recordId?: string | number; notInCms?: true };

export type NotifyConfig = {
  url: string;
  secret?: string;
  details: "summary" | "full";
  timeoutMs: number;
  appUrl: string;
};

export type NotifyResult = "sent" | "skipped" | "failed";

const localHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function readNotifyConfig(env: Record<string, string | undefined> = process.env): NotifyConfig | null {
  const raw = env.LEAD_NOTIFY_WEBHOOK_URL?.trim();
  if (!raw) return null;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  const secure = url.protocol === "https:" || (url.protocol === "http:" && localHosts.has(url.hostname));
  if (!secure || url.username || url.password) return null;

  return {
    url: url.toString(),
    secret: env.LEAD_NOTIFY_WEBHOOK_SECRET?.trim() || undefined,
    details: env.LEAD_NOTIFY_DETAILS === "full" ? "full" : "summary",
    timeoutMs: 4000,
    appUrl: (env.APP_URL ?? "https://www.dklao.com").replace(/\/$/, ""),
  };
}

// Shown when the database save failed and the lead is only in the server's local file.
export const notInCmsNote =
  "NOT IN THE CMS YET: the database was unavailable, so this request is only in data/leads-local.jsonl on the server. Import it with: pnpm cms:import-fallback-leads";

const clip = (value: string, max: number) => (value.length > max ? `${value.slice(0, max - 1)}…` : value);

export type Notification = Record<string, unknown> & { subject: string; text: string };

export function buildNotification(lead: NotifiableLead, config: Pick<NotifyConfig, "details" | "appUrl">, now: Date = new Date()): Notification {
  const adminUrl = lead.recordId !== undefined ? `${config.appUrl}/admin/collections/leads/${lead.recordId}` : undefined;
  const subject = `New quote request ${lead.leadId}: ${lead.equipmentOrServiceCategory}`;
  const lines = [subject, `Company: ${lead.companyName}`, `Came from: ${lead.sourcePage}`];

  const payload: Record<string, unknown> = {
    event: "lead.created",
    leadId: lead.leadId,
    leadType: lead.leadType,
    category: lead.equipmentOrServiceCategory,
    company: lead.companyName,
    sourcePage: lead.sourcePage,
    receivedAt: now.toISOString(),
    ...(adminUrl ? { adminUrl } : {}),
    ...(lead.notInCms ? { notInCms: true } : {}),
  };

  if (config.details === "full") {
    payload.contact = { name: lead.contactPerson, phone: lead.phone, ...(lead.email ? { email: lead.email } : {}) };
    payload.message = clip(lead.message, 500);
    lines.push(`Contact: ${lead.contactPerson}, ${lead.phone}${lead.email ? `, ${lead.email}` : ""}`, `Message: ${clip(lead.message, 500)}`);
  }

  if (adminUrl) lines.push(`Open: ${adminUrl}`);
  if (lead.notInCms) lines.push(notInCmsNote);

  return { ...payload, subject, text: lines.join("\n") };
}

export function signBody(secret: string, body: string): string {
  return `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
}

// Never throws. Logs only the lead id and a reason, never the lead's details.
export async function notifyNewLead(
  lead: NotifiableLead,
  env: Record<string, string | undefined> = process.env,
  send: typeof fetch = fetch,
): Promise<NotifyResult> {
  const config = readNotifyConfig(env);
  if (!config) return "skipped";

  const body = JSON.stringify(buildNotification(lead, config));
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": "dklao-lead-notifier/1",
    "X-DKLAO-Event": "lead.created",
  };
  if (config.secret) headers["X-DKLAO-Signature"] = signBody(config.secret, body);

  try {
    const response = await send(config.url, {
      method: "POST",
      headers,
      body,
      redirect: "error",
      signal: AbortSignal.timeout(config.timeoutMs),
    });
    if (!response.ok) {
      console.warn(`[leads] notification for ${lead.leadId} was refused with status ${response.status}`);
      return "failed";
    }
    return "sent";
  } catch (error) {
    console.warn(`[leads] notification for ${lead.leadId} failed: ${error instanceof Error ? error.name : "error"}`);
    return "failed";
  }
}
