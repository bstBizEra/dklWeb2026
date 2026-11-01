/**
 * The app's before-paint script: /app/lo/... is Lao, so <html lang> must say "lo" there (screen readers
 * pick their voice from it, and the Lao title spacing in app.css keys on it); /app stays "en".
 */
import { afterEach, describe, expect, it } from "vitest";

import { platformScript } from "./platform-script";

function runAt(path: string) {
  window.history.replaceState(null, "", path);
  document.documentElement.lang = "en";
  new Function(platformScript)();
  return document.documentElement.lang;
}

afterEach(() => window.history.replaceState(null, "", "/"));

describe("app platform script", () => {
  it("marks Lao app screens as Lao", () => {
    expect(runAt("/app/lo")).toBe("lo");
    expect(runAt("/app/lo/services")).toBe("lo");
    expect(runAt("/app/lo?install")).toBe("lo");
  });

  it("leaves English app screens English", () => {
    expect(runAt("/app")).toBe("en");
    expect(runAt("/app/location")).toBe("en");
    expect(runAt("/app/logo")).toBe("en"); // not /app/lo/...
  });

  it("still marks the platform", () => {
    runAt("/app");
    expect(document.documentElement.dataset.platform).toMatch(/^(ios|android)$/);
  });
});
