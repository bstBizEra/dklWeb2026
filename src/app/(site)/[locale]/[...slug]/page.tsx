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
// Every slug is known at build time (the CMS edits a route's content, it cannot add a route), so the pages
// below are all prerendered; an unknown slug renders this file and lands on notFound().
export const revalidate = 60;
// true, so an unknown slug reaches this page and its notFound() renders the site's own 404 in the visitor's
// language instead of Next's bare built-in page. The owner chose this on 2026-11-03 knowing the cost: Next
// then saves an answer for every address a visitor invents, and a process killed in the moment after such a
// request leaves the saved page with an empty .meta beside it, so the next process serves that page with
// status 200 until the entry is written again (measured; a clean build clears it, as every deploy does).
// What keeps that from becoming an indexed page: not-found.tsx asks for noindex, whatever the status.
// server.test.ts holds both halves — the branded page, and 404 from a fresh process.
export const dynamicParams = true;

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
