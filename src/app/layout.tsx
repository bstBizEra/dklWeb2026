import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteCompanion } from "@/components/dklao/site-companion";

const siteUrl = process.env.APP_URL ?? "https://www.dklao.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      "DK LAO — Forklift Rental, Sales, Spare Parts & Cleaning Equipment in Laos",
    template: "%s | DK LAO",
  },
  description:
    "Reliable forklift rental, new and used forklift sales, spare parts, maintenance services, warehouse solutions, and professional cleaning equipment across Laos.",
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
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/images/fav-icon/FAV-Icon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/images/fav-icon/FAV-Icon.png",
  },
  openGraph: {
    title: "DK LAO — Industrial Equipment Solutions in Laos",
    description:
      "Forklift rental, sales, spare parts, maintenance, warehouse solutions, and cleaning equipment.",
    url: "/",
    siteName: "DK LAO",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/hero/forklift-product-hero.png",
        width: 1672,
        height: 941,
        alt: "DK LAO industrial forklift and equipment solutions in Laos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DK LAO — Industrial Equipment Solutions in Laos",
    description:
      "Forklift rental, sales, spare parts, maintenance, warehouse solutions, and cleaning equipment in Laos.",
    images: ["/images/hero/forklift-product-hero.png"],
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
        <a className="dk-skip-link" href="#main-content">
          Skip to main content
        </a>
        {children}
        <SiteCompanion />
      </body>
    </html>
  );
}
