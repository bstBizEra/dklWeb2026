/**
 * Share buttons: each network link carries the page URL, copy link writes it to the clipboard and says so,
 * and touch phones with the Web Share API get the system share sheet. Placed on content pages and About.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SocialShare } from "./social-share";

const url = "https://www.dklao.com/forklift-rental";
const title = "Forklift Rental in Laos";

function stubPhone(coarse: boolean, share?: () => Promise<void>) {
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: coarse && query === "(pointer: coarse)" }));
  Object.defineProperty(navigator, "share", { value: share, configurable: true });
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("social share", () => {
  it("links each network to the page, opening in a new tab", () => {
    stubPhone(false);
    render(<SocialShare url={url} title={title} />);
    const href = (name: string) => screen.getByRole("link", { name: `Share on ${name} (opens in a new tab)` }).getAttribute("href");

    expect(href("Facebook")).toBe(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
    expect(href("WhatsApp")).toBe(`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`);
    expect(href("LINE")).toBe(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`);
    expect(href("X")).toBe(`https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`);
    for (const link of screen.getAllByRole("link")) expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("copies the link and announces it, then resets", async () => {
    stubPhone(false);
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    render(<SocialShare url={url} title={title} />);

    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Copy link" })));
    expect(writeText).toHaveBeenCalledWith(url);
    expect(screen.getByRole("status").textContent).toBe("Link copied");

    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByRole("status").textContent).toBe("");
  });

  it("says so when the clipboard is blocked", async () => {
    stubPhone(false);
    Object.defineProperty(navigator, "clipboard", { value: { writeText: vi.fn().mockRejectedValue(new Error("denied")) }, configurable: true });
    render(<SocialShare url={url} title={title} />);

    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Copy link" })));
    expect(screen.getByRole("status").textContent).toContain("Could not copy the link");
  });

  it("uses the system share sheet on touch phones", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    stubPhone(true, share);
    render(<SocialShare url={url} title={title} />);

    expect(screen.queryByRole("link")).toBeNull();
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Share" })));
    expect(share).toHaveBeenCalledWith({ title, url });
  });

  it("falls back to the buttons when the share sheet fails", async () => {
    stubPhone(true, vi.fn().mockRejectedValue(new Error("not allowed")));
    render(<SocialShare url={url} title={title} />);

    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Share" })));
    expect(screen.getAllByRole("link")).toHaveLength(4);
  });

  it("sits right below the hero on content pages and the About page", () => {
    const read = (...parts: string[]) => readFileSync(join(process.cwd(), ...parts), "utf8");
    expect(read("src", "components", "dklao", "content-page.tsx")).toMatch(/<\/section>\s*\{route \? \(\s*<div className="page-share/);
    expect(read("src", "app", "(site)", "about", "page.tsx")).toMatch(/<AboutHero \/>\s*<div className="about-share/);
    expect(read("src", "app", "(site)", "page.tsx")).toMatch(/<MainHero [^>]*\/>\s*<div className="home-share/);
  });
});
