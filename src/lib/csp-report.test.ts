/**
 * CSP violation reports: both browser formats are read, only the directive, the blocked origin and the
 * page path are logged (never query strings or script samples), each violation once, and a flood of
 * reports or a malformed one never reaches the log or causes an error.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import { logViolations, parseCspReports, resetCspReports } from "./csp-report";

afterEach(() => {
  resetCspReports();
  vi.restoreAllMocks();
});

const legacy = {
  "csp-report": {
    "document-uri": "https://www.dklao.com/contact?name=Somsack&phone=020555",
    "violated-directive": "script-src-elem",
    "effective-directive": "script-src-elem",
    "blocked-uri": "https://evil.example/x.js?token=abc",
    "script-sample": "alert('secret')",
  },
};
const modern = [
  {
    type: "csp-violation",
    body: { documentURL: "https://www.dklao.com/app/request?x=1", effectiveDirective: "img-src", blockedURL: "https://cdn.example/a.png" },
  },
  { type: "deprecation", body: { id: "x" } },
];

describe("parseCspReports", () => {
  it("reads the report-uri format and keeps only directive, origin and path", () => {
    expect(parseCspReports(legacy)).toEqual([{ directive: "script-src-elem", blocked: "https://evil.example", page: "/contact" }]);
  });

  it("reads the Reporting API format and ignores other report types", () => {
    expect(parseCspReports(modern)).toEqual([{ directive: "img-src", blocked: "https://cdn.example", page: "/app/request" }]);
  });

  it("keeps keywords such as inline and eval", () => {
    const inline = { "csp-report": { "document-uri": "https://www.dklao.com/", "effective-directive": "script-src-elem", "blocked-uri": "inline" } };
    expect(parseCspReports(inline)[0].blocked).toBe("inline");
  });

  it("ignores anything that is not a report", () => {
    expect(parseCspReports(null)).toEqual([]);
    expect(parseCspReports("x")).toEqual([]);
    expect(parseCspReports({ "csp-report": { "blocked-uri": "x" } })).toEqual([]);
    expect(parseCspReports(Array.from({ length: 100 }, () => modern[0]))).toHaveLength(20);
  });
});

describe("logViolations", () => {
  it("logs each distinct violation once, with no visitor data", () => {
    const log = vi.fn();
    logViolations(parseCspReports(legacy), log);
    logViolations(parseCspReports(legacy), log);

    expect(log).toHaveBeenCalledTimes(1);
    const line = log.mock.calls[0][0] as string;
    expect(line).toBe("[csp] script-src-elem blocked https://evil.example on /contact");
    expect(line).not.toMatch(/Somsack|token|secret/);
  });
});
