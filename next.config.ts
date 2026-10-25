import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

import { appPermissionsPolicy, securityHeaders } from "./src/lib/security-headers";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: [...securityHeaders] },
      { source: "/app/:path*", headers: [appPermissionsPolicy] },
      { source: "/app", headers: [appPermissionsPolicy] },
      // The service worker controls /app, so it must never be served stale.
      { source: "/app-sw.js", headers: [{ key: "Cache-Control", value: "no-cache" }] },
      // The host's nginx cache keys on the URL alone. API and admin answers depend on who asks (cookies, the
      // admin IP lock), so they must never be stored and replayed to someone else.
      { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "private, no-store" }] },
      { source: "/admin", headers: [{ key: "Cache-Control", value: "private, no-store" }] },
      { source: "/admin/:path*", headers: [{ key: "Cache-Control", value: "private, no-store" }] },
    ];
  },
};

export default withPayload(nextConfig);
