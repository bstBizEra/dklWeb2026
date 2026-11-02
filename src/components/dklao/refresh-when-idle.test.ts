/**
 * ScrollTrigger.refresh() jumps to the top and back to measure, which cancels a smooth scroll in progress
 * (found 2026-11-01: a page-height change during a "Read more" scroll left the section 387px short).
 * The motion components re-measure after a resize only once scrolling has stopped.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { refreshWhenIdle } from "./refresh-when-idle";

let resize: () => void = () => {};

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: () => void) {
        resize = callback;
      }
      observe() {}
      disconnect() {
        resize = () => {};
      }
    },
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const scrollFor = (ms: number) => {
  for (let t = 0; t < ms; t += 16) {
    window.dispatchEvent(new Event("scroll"));
    vi.advanceTimersByTime(16);
  }
};

describe("refreshWhenIdle", () => {
  it("re-measures shortly after a resize when the page is still", () => {
    const refresh = vi.fn();
    const stop = refreshWhenIdle(refresh);

    resize();
    vi.advanceTimersByTime(149);
    expect(refresh).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(refresh).toHaveBeenCalledTimes(1);
    stop();
  });

  it("waits while a smooth scroll runs, then re-measures once it stops", () => {
    const refresh = vi.fn();
    const stop = refreshWhenIdle(refresh);

    window.dispatchEvent(new Event("scroll"));
    resize(); // the page grows during the scroll
    scrollFor(800);
    expect(refresh).not.toHaveBeenCalled();

    vi.advanceTimersByTime(150); // scrolling has stopped
    expect(refresh).toHaveBeenCalledTimes(1);
    stop();
  });

  it("stops listening when cleaned up", () => {
    const refresh = vi.fn();
    refreshWhenIdle(refresh)();

    resize();
    vi.advanceTimersByTime(1000);
    expect(refresh).not.toHaveBeenCalled();
  });
});
