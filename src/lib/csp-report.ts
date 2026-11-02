import { createRateLimiter, type RateLimiter } from "@/lib/leads/rate-limit";

// Turns browser CSP violation reports into short log lines while the policy is in report-only mode.
// Browsers send two formats: the older report-uri one ({"csp-report": {...}}, application/csp-report) and
// the Reporting API one ([{type: "csp-violation", body: {...}}], application/reports+json).
//
// What is logged: the directive, where the blocked resource came from reduced to its origin (or a keyword
// such as "inline" or "eval"), and the page path. Never query strings, script samples or anything else from
// the page, so no visitor data reaches the log. Each distinct violation is logged once per server process,
// and each address may send a limited number of reports, so a noisy page or a script cannot flood the log.

export type Violation = { directive: string; blocked: string; page: string };

const text = (value: unknown): string | undefined => (typeof value === "string" && value.trim() ? value.trim() : undefined);
const clean = (value: string) => value.replace(/[^\w\-.:/' ]/g, "").slice(0, 120);

function origin(value: string | undefined): string {
  if (!value) return "unknown";
  if (/^(inline|eval|wasm-eval|trusted-types-policy|trusted-types-sink|self)$/.test(value)) return value;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.origin : url.protocol.replace(/:$/, "");
  } catch {
    return clean(value.split(/[?#\s]/)[0]) || "unknown";
  }
}

function path(value: string | undefined): string {
  if (!value) return "unknown";
  try {
    return clean(new URL(value).pathname);
  } catch {
    return "unknown";
  }
}

function fromReport(raw: Record<string, unknown>): Violation | null {
  const directive = text(raw.effectiveDirective) ?? text(raw["effective-directive"]) ?? text(raw["violated-directive"]);
  if (!directive) return null;
  return {
    directive: clean(directive.split(" ")[0]),
    blocked: origin(text(raw.blockedURL) ?? text(raw["blocked-uri"])),
    page: path(text(raw.documentURL) ?? text(raw["document-uri"])),
  };
}

export function parseCspReports(body: unknown): Violation[] {
  const reports: Record<string, unknown>[] = [];
  if (Array.isArray(body)) {
    for (const entry of body.slice(0, 20)) {
      const item = entry as { type?: unknown; body?: unknown } | null;
      if (item?.type === "csp-violation" && item.body && typeof item.body === "object") reports.push(item.body as Record<string, unknown>);
    }
  } else if (body && typeof body === "object") {
    const legacy = (body as Record<string, unknown>)["csp-report"];
    if (legacy && typeof legacy === "object") reports.push(legacy as Record<string, unknown>);
  }
  return reports.flatMap((report) => fromReport(report) ?? []);
}

const maxSeen = 500;
let seen = new Set<string>();
let limiter: RateLimiter | undefined;

// 20 reports per address per minute: one page view can send several, a flood cannot get through.
export function cspReportLimiter(): RateLimiter {
  limiter ??= createRateLimiter({ limit: 20, windowMs: 60_000 });
  return limiter;
}

// Logs each violation the first time this process sees it. Returns the lines it logged.
export function logViolations(violations: Violation[], log: (line: string) => void = console.warn): string[] {
  const logged: string[] = [];
  for (const violation of violations) {
    const line = `[csp] ${violation.directive} blocked ${violation.blocked} on ${violation.page}`;
    if (seen.has(line)) continue;
    if (seen.size >= maxSeen) seen = new Set();
    seen.add(line);
    log(line);
    logged.push(line);
  }
  return logged;
}

export function resetCspReports(): void {
  seen = new Set();
  limiter = undefined;
}
