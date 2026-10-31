// Response headers for every page. HTTPS-only transport (HSTS) is added by the host, not here,
// so local http development is not affected.

// Content-Security-Policy, rolled out in two steps. Step 1 (now): "report-only". Browsers enforce nothing
// and report what the policy would have blocked to /api/csp-report, which logs each distinct violation
// once. Step 2: after the reports from the live site and /admin are reviewed, set cspMode to "enforce" in a
// release of its own. It is a constant, not a setting, because next.config.ts headers are fixed at build
// time and the server builds without its settings loaded; switching modes is a reviewed change.
// Before enforcing, decide /admin separately: Payload's admin may need more than the public pages.
export type CspMode = "report-only" | "enforce";
export const cspMode = "report-only" as CspMode;
export const cspReportPath = "/api/csp-report";

// The site loads nothing from other origins: fonts, images and scripts are all served from the site
// itself, and WhatsApp, phone and map links are plain links, not embeds.
//   script-src 'unsafe-inline': Next.js inlines its page data and bootstrap (self.__next_f), and the site
//     has two inline scripts of its own (JSON-LD, the /app platform script). Nonces would remove the need,
//     but they make every page render per request, losing the static pages and their caching.
//   style-src 'unsafe-inline': GSAP animates through inline style attributes, and React writes style props.
//   img-src data: blob:: inline SVG placeholders, and the admin's upload previews.
//   'unsafe-eval' and ws: are added only for `next dev` (fast refresh); never in a production build.
export function contentSecurityPolicy(dev = process.env.NODE_ENV === "development"): string {
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'", ...(dev ? ["'unsafe-eval'"] : [])],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:"],
    "font-src": ["'self'", "data:"],
    "connect-src": ["'self'", ...(dev ? ["ws:", "wss:"] : [])],
    "manifest-src": ["'self'"],
    "worker-src": ["'self'"],
    "frame-src": ["'self'"],
    // Same rule as X-Frame-Options: SAMEORIGIN, in the form newer browsers prefer.
    "frame-ancestors": ["'self'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    // report-uri only. With report-to also present, Chromium ignores report-uri and switches to the
    // batched Reporting API, which delivered nothing in testing (2026-10-31, headless Chromium); report-uri
    // alone arrived at once. Chrome, Firefox and Safari all still send report-uri reports.
    "report-uri": [cspReportPath],
  };
  return Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(" ")}`)
    .join("; ");
}

export const cspHeader = {
  key: cspMode === "enforce" ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only",
  value: contentSecurityPolicy(),
} as const;

export const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  cspHeader,
] as const;

// The mobile app under /app may ask for the visitor's location (only from a button tap), so a service
// request can carry the site pin. Same origin only; camera, microphone and payment stay off.
// next.config.ts lists this after the site-wide rule, and Next lets the later rule win for /app.
export const appPermissionsPolicy = {
  key: "Permissions-Policy",
  value: "camera=(), microphone=(), geolocation=(self), payment=()",
} as const;
