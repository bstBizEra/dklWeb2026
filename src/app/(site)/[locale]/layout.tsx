import type { Metadata, Viewport } from "next";
import { Noto_Sans_Lao } from "next/font/google";
import { notFound } from "next/navigation";

import { seoFor } from "@/lib/data/seo";
import "../globals.css";
import { AppInstallBanner } from "@/components/dklao/app-install-banner";
import { SiteMotion } from "@/components/dklao/site-motion";
import { shareImage } from "@/lib/data/share";
import { isLocale, locales } from "@/lib/i18n";
import { localeAlternates, ogBase } from "@/lib/i18n/metadata";
import { setRequestLocale } from "@/lib/i18n/request-locale";
import { siteFooterMetadata } from "@/lib/site-metadata";
import { getMessages } from "@/messages";

const siteUrl = process.env.APP_URL ?? "https://www.dklao.com";
const iconVersion = siteFooterMetadata.version;

// Lao script for /lo pages. Inter has no Lao glyphs, so the browser falls back to this font per character
// (globals.css puts var(--font-lao) right after Inter). Not preloaded: English pages never need it.
const notoSansLao = Noto_Sans_Lao({ subsets: ["lao"], variable: "--font-lao", display: "swap", preload: false });

type Params = Promise<{ locale: string }>;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { homeSeo } = seoFor(locale);

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: homeSeo.title,
      template: "%s | DK LAO",
    },
    description: homeSeo.description,
    applicationName: "DK LAO",
    keywords: [
      "forklift rental Laos",
      "forklift sales Laos",
      "used forklift Laos",
      "forklift spare parts",
      "forklift maintenance",
      "warehouse equipment",
      "racking and shelving",
      "material handling",
      "professional cleaning equipment",
      "DK LAO",
    ],
    authors: [{ name: "DK LAO" }],
    creator: "DK LAO",
    publisher: "DK LAO",
    alternates: localeAlternates("/", locale),
    formatDetection: {
      telephone: true,
      email: true,
      address: false,
    },
    // The version query makes browsers fetch the icon again after a release instead of reusing a cached one.
    icons: {
      icon: [
        { url: `/favicon.ico?v=${iconVersion}`, type: "image/x-icon" },
        { url: `/images/fav-icon/FAV-Icon.png?v=${iconVersion}`, type: "image/png" },
      ],
      shortcut: `/favicon.ico?v=${iconVersion}`,
      apple: `/images/fav-icon/FAV-Icon.png?v=${iconVersion}`,
    },
    openGraph: {
      ...ogBase("/", locale),
      title: homeSeo.shareTitle,
      description: homeSeo.shareDescription,
      images: [shareImage("home")],
    },
    twitter: {
      card: "summary_large_image",
      title: homeSeo.shareTitle,
      description: homeSeo.shareDescription,
      images: [shareImage("home").url],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#07111f",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Params;
}>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} className={locale === "lo" ? notoSansLao.variable : undefined}>
      <body>
        <a
          className="absolute -top-16 left-4 z-[100] inline-flex items-center rounded-button bg-action-red px-[18px] py-3 text-[15px] font-extrabold text-white shadow-cta transition-[top] duration-150 ease-premium focus:top-4 focus:outline-3 focus:outline-offset-2 focus:outline-white"
          href="#main-content"
        >
          {getMessages(locale).skipToContent}
        </a>
        {children}
        <AppInstallBanner labels={getMessages(locale).appBanner} />
        <SiteMotion />
      </body>
    </html>
  );
}
