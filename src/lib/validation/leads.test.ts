import { describe, expect, it } from "vitest";

import { quoteRequestSchema } from "./leads";

const validQuoteRequest = {
  leadType: "QUOTE_REQUEST",
  companyName: "Vientiane Logistics",
  contactPerson: "Operations Manager",
  phone: "+856 20 5555 1234",
  email: "ops@example.com",
  equipmentOrServiceCategory: "Forklift rental",
  message: "We need a forklift recommendation for warehouse loading.",
  sourcePage: "/",
};

describe("quoteRequestSchema", () => {
  it("accepts a valid quote request and applies a NEW status", () => {
    const parsed = quoteRequestSchema.parse(validQuoteRequest);

    expect(parsed.status).toBe("NEW");
    expect(parsed.submissionTimestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("rejects requests without a phone number", () => {
    const result = quoteRequestSchema.safeParse({
      ...validQuoteRequest,
      phone: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["phone"]);
    }
  });

  it("rejects unsupported lead types", () => {
    const result = quoteRequestSchema.safeParse({
      ...validQuoteRequest,
      leadType: "NEWSLETTER_SIGNUP",
    });

    expect(result.success).toBe(false);
  });
});

describe("Content-Security-Policy compatibility", () => {
  it("runs Zod without eval, so form pages file no CSP report (no new Function probe)", async () => {
    const { z } = await import("zod");
    await import("./leads");
    expect(z.config().jitless).toBe(true);
  });
});
