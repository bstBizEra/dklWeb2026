import { notFound } from "next/navigation";

import { ContentPage } from "@/components/dklao/content-page";
import { getPageContent } from "@/lib/cms/pages";
import { buildMetadata } from "@/lib/data/pages";
import { publishedRoutes } from "@/lib/data/routes";
import { sitemapPagesFor } from "@/lib/data/sitemap-pages";
import { isLocale, type Locale } from "@/lib/i18n";
import { setRequestLocale } from "@/lib/i18n/request-locale";

// One template for every published page that has no file of its own: the sitemap pages, in each locale.
// The CMS row wins over the built-in page. A route that is not published, or has no page data, is a 404.
// Every slug is known at build time (the CMS edits a route's content, it cannot add a route), so unknown
// slugs are answered 404 before rendering. With dynamicParams true, Next.js rendered them and saved the
// not-found page to .next/server/app, which a later process could serve with status 200.
export const revalidate = 60;
// Keep false. true does make an unknown slug render the site's own 404 (not-found.tsx) instead of Next's
// bare page, but it also makes Next save an answer for every address a visitor invents: measured
// 2026-11-03, a process killed in the moment after such a request leaves the saved page with an empty
// .meta beside it, and the next process then serves that page with status 200 — a soft 404 that lasts
// until the entry is written again. The bare page is the cheaper cost. See con_agents/CHANGELOG.md 0.23.0.
export const dynamicParams = false;

type Params = Promise<{ locale: string; slug: string[] }>;

function pageFor(slug: string[], locale: Locale) {
  const href = `/${slug.join("/")}`;
  const route = publishedRoutes().find((candidate) => candidate.href === href);
  return route ? sitemapPagesFor(locale)[route.id] : undefined;
}

// Called once per locale from the layout's params.
export function generateStaticParams() {
  return publishedRoutes()
    .filter((route) => sitemapPagesFor("en")[route.id])
    .map((route) => ({ slug: route.href.split("/").filter(Boolean) }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const fallback = pageFor(slug, locale);
  if (!fallback) return {};
  return buildMetadata(await getPageContent(fallback, locale), locale);
}

export default async function SitemapPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const fallback = pageFor(slug, locale);
  if (!fallback) notFound();
  return <ContentPage page={await getPageContent(fallback, locale)} locale={locale} />;
}
