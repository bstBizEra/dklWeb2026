import type { Metadata, Viewport } from "next";
import { homeSeo } from "@/lib/data/seo";
import "./globals.css";
import { AppInstallBanner } from "@/components/dklao/app-install-banner";
import { SiteMotion } from "@/components/dklao/site-motion";
import { shareImage } from "@/lib/data/share";
import { siteFooterMetadata } from "@/lib/site-metadata";

const siteUrl = process.env.APP_URL ?? "https://www.dklao.com";
const iconVersion = siteFooterMetadata.version;

export const metadata: Metadata = {
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
  alternates: {
    canonical: "/",
  },
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
    title: homeSeo.shareTitle,
    description: homeSeo.shareDescription,
    url: "/",
    siteName: "DK LAO",
    locale: "en_US",
    type: "website",
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

export const viewport: Viewport = {
  themeColor: "#07111f",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <a
          className="absolute -top-16 left-4 z-[100] inline-flex items-center rounded-button bg-action-red px-[18px] py-3 text-[15px] font-extrabold text-white shadow-cta transition-[top] duration-150 ease-premium focus:top-4 focus:outline-3 focus:outline-offset-2 focus:outline-white"
          href="#main-content"
        >
          Skip to main content
        </a>
        {children}
        <AppInstallBanner />
        <SiteMotion />
      </body>
    </html>
  );
}
