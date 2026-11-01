/**
 * The quote form speaks the page's language: on /lo pages its labels, category names, validation messages
 * and button are Lao, while the category value sent to the server stays the English one the CRM expects.
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { en } from "@/messages/en";
import { lo } from "@/messages/lo";

import { QuoteRequestForm } from "./quote-request-form";

const read = (...parts: string[]) => readFileSync(join(process.cwd(), "src", ...parts), "utf8");

describe("quote form language", () => {
  it("shows Lao labels, categories and button when given the Lao messages", () => {
    render(<QuoteRequestForm labels={lo.quoteForm} defaultCategory="Spare parts" showHeader={false} />);

    expect(screen.getByLabelText(lo.quoteForm.contactPerson)).toBeTruthy();
    expect(screen.getByLabelText(lo.quoteForm.phone)).toBeTruthy();
    expect(screen.getByRole("button", { name: lo.quoteForm.submit })).toBeTruthy();
    const parts = screen.getByRole("option", { name: lo.quoteForm.categories.parts }) as HTMLOptionElement;
    expect(parts.value).toBe("Spare parts"); // the value sent stays English
    expect(parts.selected).toBe(true);
  });

  it("checks fields with the Lao validation messages", async () => {
    render(<QuoteRequestForm labels={lo.quoteForm} showHeader={false} />);
    fireEvent.submit(screen.getByRole("button", { name: lo.quoteForm.submit }).closest("form")!);

    expect(await screen.findByText(lo.quoteForm.validation.contactPerson)).toBeTruthy();
  });

  it("stays English without labels", () => {
    render(<QuoteRequestForm showHeader={false} />);
    expect(screen.getByLabelText(en.quoteForm.contactPerson)).toBeTruthy();
  });

  it("is given the page's messages wherever a page shows it", () => {
    for (const page of [
      ["app", "(site)", "[locale]", "request-quote", "page.tsx"],
      ["components", "dklao", "content-page.tsx"],
      ["components", "dklao", "homepage-sections.tsx"],
    ]) {
      expect(read(...page), page.join("/")).toMatch(/<QuoteRequestForm[^>]*labels=\{/);
    }
    // The contact page has its own inquiry form, with its own and the shared quote-form texts.
    expect(read("app", "(site)", "[locale]", "contact", "page.tsx")).toMatch(/<ContactInquiryForm[^>]*labels=\{[^}]*\}[^>]*shared=\{/);
  });
});
