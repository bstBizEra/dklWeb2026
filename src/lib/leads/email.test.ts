/**
 * Lead email to DK LAO's inbox: settings come only from the environment (info@dklao.com by default),
 * the email carries the whole request with Reply-To set to the visitor, visitor text cannot add mail
 * headers, and a failed send never throws.
 */
import { describe, expect, it, vi } from "vitest";

import { buildLeadEmail, defaultLeadInbox, emailNewLead, payloadEmailOptions, readEmailConfig } from "./email";
import type { NotifiableLead } from "./notify";

const lead: NotifiableLead = {
  leadId: "DKL-42",
  leadType: "RENTAL_INQUIRY",
  companyName: "Mekong Cold Chain",
  contactPerson: "Somsack Vong",
  phone: "+856 20 5555 1234",
  email: "somsack@example.com",
  equipmentOrServiceCategory: "Forklift rental",
  message: "Need a 3 tonne forklift for two weeks from Monday.",
  sourcePage: "/forklift-rental",
  submissionTimestamp: "2026-10-25T09:00:00.000Z",
  status: "NEW",
};

const smtp = { SMTP_HOST: "smtp.example.com", SMTP_USER: "web@dklao.com", SMTP_PASS: "secret" };

describe("lead email settings", () => {
  it("sends nothing without an SMTP host", () => {
    expect(readEmailConfig({})).toBeNull();
  });

  it("goes to info@dklao.com by default, from the SMTP account, on port 587 with STARTTLS", () => {
    expect(defaultLeadInbox).toBe("info@dklao.com");
    expect(readEmailConfig(smtp)).toEqual({
      host: "smtp.example.com",
      port: 587,
      secure: false,
      auth: { user: "web@dklao.com", pass: "secret" },
      from: "web@dklao.com",
      to: ["info@dklao.com"],
    });
  });

  it("uses TLS on port 465 and accepts several inboxes", () => {
    const config = readEmailConfig({ ...smtp, SMTP_PORT: "465", LEAD_NOTIFY_EMAIL: "info@dklao.com, salescenter@dklao.com" });
    expect(config?.secure).toBe(true);
    expect(config?.to).toEqual(["info@dklao.com", "salescenter@dklao.com"]);
  });

  it("refuses a half-set account, a bad port or a bad inbox address", () => {
    expect(readEmailConfig({ ...smtp, SMTP_PASS: "" })).toBeNull();
    expect(readEmailConfig({ ...smtp, SMTP_PORT: "abc" })).toBeNull();
    expect(readEmailConfig({ ...smtp, LEAD_NOTIFY_EMAIL: "not an address" })).toBeNull();
  });
});

describe("lead email", () => {
  it("carries the whole request and replies to the visitor", () => {
    const message = buildLeadEmail(lead, { from: "web@dklao.com", to: ["info@dklao.com"] });

    expect(message.to).toEqual(["info@dklao.com"]);
    expect(message.replyTo).toBe("somsack@example.com");
    expect(message.subject).toBe("New Forklift rental request from Mekong Cold Chain (DKL-42)");
    for (const value of [lead.leadId, lead.contactPerson, lead.phone, lead.email!, lead.message, lead.sourcePage]) expect(message.text).toContain(value);
  });

  it("has no Reply-To when the visitor gave no email, and says to call instead", () => {
    const message = buildLeadEmail({ ...lead, email: undefined }, { from: "web@dklao.com", to: ["info@dklao.com"] });

    expect(message).not.toHaveProperty("replyTo");
    expect(message.text).toContain("call or WhatsApp");
  });

  it("keeps visitor text on one line in the subject, so it cannot add headers", () => {
    const message = buildLeadEmail({ ...lead, companyName: "Acme\r\nBcc: victim@example.com" }, { from: "web@dklao.com", to: ["info@dklao.com"] });
    expect(message.subject).not.toMatch(/[\r\n]/);
  });

  it("reports sent, skipped or failed, and never throws", async () => {
    const sendMail = vi.fn().mockResolvedValue({});
    expect(await emailNewLead(lead, smtp, () => ({ sendMail }))).toBe("sent");
    expect(sendMail.mock.calls[0][0].to).toEqual(["info@dklao.com"]);

    expect(await emailNewLead(lead, {}, () => ({ sendMail }))).toBe("skipped");

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(await emailNewLead(lead, smtp, () => ({ sendMail: vi.fn().mockRejectedValue(new Error("ECONNREFUSED")) }))).toBe("failed");
    expect(warn.mock.calls[0][0]).not.toContain(lead.phone);
    warn.mockRestore();
  });
});

describe("CMS email settings", () => {
  it("uses no adapter without an SMTP host", () => {
    expect(payloadEmailOptions({})).toBeNull();
  });

  it("sends CMS email from the lead SMTP account", () => {
    expect(payloadEmailOptions({ ...smtp, SMTP_PORT: "465" })).toEqual({
      defaultFromAddress: "web@dklao.com",
      defaultFromName: "DK LAO",
      transportOptions: { host: "smtp.example.com", port: 465, secure: true, auth: { user: "web@dklao.com", pass: "secret" } },
    });
  });
});
