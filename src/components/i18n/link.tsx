"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

import { localeOf, localizeHref } from "@/lib/i18n";

// next/link that keeps the visitor in the language of the page they are on: on a /lo page an internal
// href such as /about becomes /lo/about. External, tel:, mailto:, #anchor, /api, /admin, /app and file
// links are left alone (see localizeHref). Site components import this instead of next/link.
export default function Link({ href, ...props }: ComponentProps<typeof NextLink>) {
  const locale = localeOf(usePathname() ?? "/");
  return <NextLink {...props} href={typeof href === "string" ? localizeHref(href, locale) : href} />;
}
