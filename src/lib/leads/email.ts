import nodemailer from "nodemailer";

import { notInCmsNote, type NotifiableLead, type NotifyResult } from "@/lib/leads/notify";

// New-lead email to DK LAO's own inbox, sent over SMTP. The mailbox and the SMTP account come from
// environment variables, so no password lives in the repository. The email carries the full request,
// because it goes to DK LAO's own address; Reply-To is the visitor's email when they gave one.
//
//   SMTP_HOST, SMTP_PORT      the outgoing mail server (port 465 = TLS, 587 or 25 = STARTTLS).
//   SMTP_USER, SMTP_PASS      the sending account. Both or neither.
//   SMTP_FROM                 sender shown in the inbox. Defaults to SMTP_USER.
//   LEAD_NOTIFY_EMAIL         where leads go. Defaults to info@dklao.com. Several addresses: comma-separated.
// Without SMTP_HOST no email is sent ("skipped"), as on a developer machine.

export const defaultLeadInbox = "info@dklao.com";

export type EmailConfig = {
  host: string;
  port: number;
  secure: boolean;
  auth?: { user: string; pass: string };
  from: string;
  to: string[];
};

const address = /^[^\s@,<>]+@[^\s@,<>]+\.[a-z]{2,}$/i;

export function readEmailConfig(env: Record<string, string | undefined> = process.env): EmailConfig | null {
  const host = env.SMTP_HOST?.trim();
  if (!host) return null;

  const port = Number(env.SMTP_PORT?.trim() || 587);
  const user = env.SMTP_USER?.trim();
  const pass = env.SMTP_PASS;
  const from = env.SMTP_FROM?.trim() || user;
  const to = (env.LEAD_NOTIFY_EMAIL?.trim() || defaultLeadInbox).split(",").map((entry) => entry.trim()).filter(Boolean);

  if (!Number.isInteger(port) || port <= 0 || !from || !to.every((entry) => address.test(entry))) return null;
  if (Boolean(user) !== Boolean(pass)) return null;

  return { host, port, secure: port === 465, ...(user && pass ? { auth: { user, pass } } : {}), from, to };
}

// Header values come from the visitor: strip line breaks so nothing can be added to the headers.
const oneLine = (value: string) => value.replace(/[\r\n]+/g, " ").trim();

export function buildLeadEmail(lead: NotifiableLead, config: Pick<EmailConfig, "from" | "to">, now: Date = new Date()) {
  const subject = oneLine(
    `${lead.notInCms ? "[NOT IN CMS] " : ""}New ${lead.equipmentOrServiceCategory} request from ${lead.companyName} (${lead.leadId})`,
  );
  const text = [
    `New request from the DK LAO website.`,
    ``,
    ...(lead.notInCms ? [notInCmsNote, ``] : []),
    `Reference:  ${lead.leadId}`,
    `Category:   ${lead.equipmentOrServiceCategory}`,
    `Company:    ${lead.companyName}`,
    `Contact:    ${lead.contactPerson}`,
    `Phone:      ${lead.phone}`,
    `Email:      ${lead.email ?? "not given"}`,
    `Sent from:  ${lead.sourcePage}`,
    `Received:   ${now.toISOString()}`,
    ``,
    `Requirement:`,
    lead.message,
    ``,
    `Reply to this email to answer the customer${lead.email ? "" : " (no email given: call or WhatsApp the phone number)"}.`,
  ].join("\n");

  return {
    from: config.from,
    to: config.to,
    subject,
    text,
    ...(lead.email ? { replyTo: oneLine(lead.email) } : {}),
  };
}

type Transport = { sendMail: (message: ReturnType<typeof buildLeadEmail>) => Promise<unknown> };

// Never throws. Logs only the lead id and a reason, never the lead's details.
export async function emailNewLead(
  lead: NotifiableLead,
  env: Record<string, string | undefined> = process.env,
  createTransport: (config: EmailConfig) => Transport = (config) =>
    nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 10000,
    }),
): Promise<NotifyResult> {
  const config = readEmailConfig(env);
  if (!config) return "skipped";

  try {
    await createTransport(config).sendMail(buildLeadEmail(lead, config));
    return "sent";
  } catch (error) {
    console.warn(`[leads] email for ${lead.leadId} failed: ${error instanceof Error ? error.name : "error"}`);
    return "failed";
  }
}

// The same SMTP account sends the CMS's own emails (password reset, account invites) through Payload's
// nodemailer adapter. Without SMTP settings there is no adapter: Payload then writes emails to the log,
// instead of the adapter's default of creating an online test mailbox.
export function payloadEmailOptions(env: Record<string, string | undefined> = process.env) {
  const config = readEmailConfig(env);
  if (!config) return null;
  const { host, port, secure, auth, from } = config;
  return { defaultFromAddress: from, defaultFromName: "DK LAO", transportOptions: { host, port, secure, auth } };
}
