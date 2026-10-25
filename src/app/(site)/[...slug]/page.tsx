import { notFound } from "next/navigation";

import { ContentPage } from "@/components/dklao/content-page";
import { getPageContent } from "@/lib/cms/pages";
import { buildMetadata } from "@/lib/data/pages";
import { publishedRoutes } from "@/lib/data/routes";
import { sitemapPages } from "@/lib/data/sitemap-pages";

// One template for every published page that has no file of its own: the 16 sitemap pages.
// The CMS row wins over the built-in page. A route that is not published, or has no page data, is a 404.
export const revalidate = 60;
export const dynamicParams = true;

type Params = Promise<{ slug: string[] }>;

function pageFor(slug: string[]) {
  const href = `/${slug.join("/")}`;
  const route = publishedRoutes().find((candidate) => candidate.href === href);
  return route ? sitemapPages[route.id] : undefined;
}

export function generateStaticParams() {
  return publishedRoutes()
    .filter((route) => sitemapPages[route.id])
    .map((route) => ({ slug: route.href.split("/").filter(Boolean) }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const fallback = pageFor((await params).slug);
  if (!fallback) return {};
  return buildMetadata(await getPageContent(fallback));
}

export default async function SitemapPage({ params }: { params: Params }) {
  const fallback = pageFor((await params).slug);
  if (!fallback) notFound();
  return <ContentPage page={await getPageContent(fallback)} />;
}
