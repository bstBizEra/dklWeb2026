import type { MetadataRoute } from "next";

const liveUrl = "https://www.dklao.com";

// Read APP_URL per request, not at build time. The build runs without the instance's settings file
// (`dklao-deploy` does not source it), so a prerendered robots.txt would carry the live address on every
// instance and no restart could change it.
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = (process.env.APP_URL ?? liveUrl).replace(/\/$/, "");

  return {
    // Only the live address may be indexed: preview and any other host answer Disallow: / so they cannot
    // compete with www.dklao.com for the same pages.
    rules:
      siteUrl === liveUrl
        ? { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] }
        : { userAgent: "*", disallow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
