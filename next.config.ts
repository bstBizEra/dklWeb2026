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
    ];
  },
};

export default withPayload(nextConfig);
