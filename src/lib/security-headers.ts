// Response headers for every page. HTTPS-only transport (HSTS) is added by the host, not here,
// so local http development is not affected. A Content-Security-Policy is a separate, later step.
export const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
] as const;

// The mobile app under /app may ask for the visitor's location (only from a button tap), so a service
// request can carry the site pin. Same origin only; camera, microphone and payment stay off.
// next.config.ts lists this after the site-wide rule, and Next lets the later rule win for /app.
export const appPermissionsPolicy = {
  key: "Permissions-Policy",
  value: "camera=(), microphone=(), geolocation=(self), payment=()",
} as const;
