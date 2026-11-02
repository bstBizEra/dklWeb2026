/**
 * The phone menu. Every control in it speaks the page's language, the sheet's own close button
 * included: it used to carry a hard-coded English "Close menu" inside the shared sheet component.
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { resolveNavigation } from "@/lib/data/navigation";
import { navigationFor } from "@/lib/data/navigation";
import { lo } from "@/messages/lo";

import { MobileMenu } from "./mobile-menu";

describe("MobileMenu", () => {
  it("labels the close button in the page's language", () => {
    const { defaultNavigation, menuGroupTitles } = navigationFor("lo");
    render(
      <MobileMenu
        items={resolveNavigation(defaultNavigation)}
        quoteHref="/lo/request-quote"
        groupTitles={menuGroupTitles}
        labels={{ ...lo.mobileMenu, requestQuote: lo.header.requestQuote }}
      />,
    );

    fireEvent.click(screen.getByLabelText(lo.mobileMenu.open));

    expect(screen.getByRole("button", { name: lo.mobileMenu.close })).toBeTruthy();
  });
});
