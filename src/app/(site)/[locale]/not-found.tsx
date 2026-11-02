import type { Metadata } from "next";

import { NotFoundContent } from "@/components/dklao/not-found-content";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { getMessages } from "@/messages";

// Shown when a page under [locale] calls notFound() — a route that is published but has no content, say.
// An address that matches no route at all never reaches this file: it renders app/global-not-found.tsx,
// because Next has no single root layout here to put this one in (each route group brings its own).
// not-found receives no params: the layout records the URL locale for the request.
export async function generateMetadata(): Promise<Metadata> {
  const t = getMessages(getRequestLocale()).notFound;
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default function NotFound() {
  return <NotFoundContent locale={getRequestLocale()} />;
}
