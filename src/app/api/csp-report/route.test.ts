/**
 * The CSP report endpoint always answers 204, logs a valid report once, and drops oversized, malformed
 * and rate-limited reports without logging them.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import { resetCspReports } from "@/lib/csp-report";

const { POST } = await import("./route");

const report = JSON.stringify({
  "csp-report": { "document-uri": "https://www.dklao.com/about", "effective-directive": "img-src", "blocked-uri": "https://cdn.example/a.png" },
});
const send = (body: string, ip = "203.0.113.50") =>
  POST(new Request("http://localhost/api/csp-report", { method: "POST", headers: { "content-type": "application/csp-report", "x-real-ip": ip }, body }));

afterEach(() => {
  resetCspReports();
  vi.restoreAllMocks();
});

describe("POST /api/csp-report", () => {
  it("logs a report and answers 204 with no body", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const response = await send(report);

    expect(response.status).toBe(204);
    expect(await response.text()).toBe("");
    expect(warn).toHaveBeenCalledWith("[csp] img-src blocked https://cdn.example on /about");
  });

  it("drops malformed and oversized reports quietly", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect((await send("{not json")).status).toBe(204);
    expect((await send(JSON.stringify({ "csp-report": { "effective-directive": "img-src", pad: "x".repeat(20_000) } }))).status).toBe(204);
    expect(warn).not.toHaveBeenCalled();
  });

  it("stops reading reports from an address that floods the endpoint", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const unique = (n: number) =>
      JSON.stringify({ "csp-report": { "document-uri": `https://www.dklao.com/p${n}`, "effective-directive": "img-src", "blocked-uri": "data" } });

    for (let n = 0; n < 30; n++) expect((await send(unique(n), "198.51.100.77")).status).toBe(204);
    expect(warn).toHaveBeenCalledTimes(20);
  });
});
