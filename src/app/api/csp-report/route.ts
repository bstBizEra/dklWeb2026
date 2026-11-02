import { parseCspReports, cspReportLimiter, logViolations } from "@/lib/csp-report";
import { readLimitedText } from "@/lib/http/read-body";
import { clientKey } from "@/lib/leads/rate-limit";

export const runtime = "nodejs";

// Receives Content-Security-Policy violation reports from browsers (see lib/security-headers.ts and
// lib/csp-report.ts). Always answers 204 with no body: a report is never worth an error page, and the
// answer tells a sender nothing. Oversized, malformed or rate-limited reports are dropped unread.
const maxReportBytes = 16_000;
const noContent = () => new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request): Promise<Response> {
  if (!cspReportLimiter().check(clientKey(request)).allowed) return noContent();

  const raw = await readLimitedText(request, maxReportBytes);
  if (!raw.ok) return noContent();

  try {
    logViolations(parseCspReports(JSON.parse(raw.text)));
  } catch {
    // Not JSON: ignore.
  }
  return noContent();
}
