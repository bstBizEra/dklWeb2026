import type { MetadataRoute } from "next";

const siteUrl = process.env.APP_URL ?? "https://www.dklao.com";

// Only published routes are listed. Add inner routes here as each page ships
// so the sitemap never advertises unbuilt (404) pages.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
