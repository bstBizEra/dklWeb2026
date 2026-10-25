/**
 * The spam trap in the quote form: present in the markup for bots, hidden from people, from the keyboard
 * and from screen readers, and named the same as the field the server checks.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { honeypotField } from "@/lib/leads/guard";
import { quoteRequestSchema } from "@/lib/validation/leads";

const form = readFileSync(join(process.cwd(), "src", "components", "dklao", "quote-request-form.tsx"), "utf8");

describe("quote form spam trap", () => {
  it("renders an input named like the field the server checks", () => {
    expect(form).toContain(`id="${honeypotField}"`);
    expect(form).toContain(`register("${honeypotField}")`);
  });

  it("is hidden from screen readers, skipped by the keyboard and not autofilled", () => {
    const wrapper = form.slice(form.indexOf("quote-form__trap") - 40, form.indexOf("quote-form__trap") + 400);

    expect(wrapper).toContain('aria-hidden="true"');
    expect(form).toContain("tabIndex={-1}");
    expect(form).toContain('autoComplete="off"');
  });

  it("is moved off-screen rather than hidden with display: none", () => {
    const wrapper = form.slice(form.indexOf("quote-form__trap"), form.indexOf("quote-form__trap") + 120);

    expect(wrapper).toContain("absolute");
    expect(wrapper).toMatch(/-left-\[\d+px\]/);
    // The Tailwind `hidden` utility is display: none; overflow-hidden is fine.
    expect(wrapper).not.toMatch(/(^|[\s"])hidden(?=[\s"])/);
  });

  it("is accepted by the request schema, and an empty value passes validation", () => {
    const base = { companyName: "Test Co", contactPerson: "Tester", phone: "+856 20 0000 0000", equipmentOrServiceCategory: "Forklift rental", message: "A real requirement for two weeks." };

    expect(quoteRequestSchema.safeParse({ ...base, [honeypotField]: "" }).success).toBe(true);
    expect(quoteRequestSchema.safeParse(base).success).toBe(true);
  });
});
