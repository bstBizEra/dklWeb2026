import type { Metadata, Viewport } from "next";

import "./app.css";
import { RegisterServiceWorker } from "@/components/app/app-helpers";
import { platformScript } from "@/components/app/platform-script";
import { TabBar } from "@/components/app/tab-bar";

const siteUrl = process.env.APP_URL ?? "https://www.dklao.com";

// Root layout of the iPhone web app (/app). It has its own <html>, so the website header, footer,
// motion and stylesheet never load here. Saved to the Home Screen it opens full screen (standalone).
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "DK LAO", template: "%s · DK LAO" },
  description: "Forklift rental, sales, service and spare parts in Laos. Request a quote or book a service.",
  applicationName: "DK LAO",
  appleWebApp: { capable: true, title: "DK LAO", statusBarStyle: "default" },
  icons: { icon: "/app/icon/192", apple: "/app/icon/180" },
  formatDetection: { telephone: false, email: false, address: false },
  // The website is the page Google should show; the app is for customers who saved it.
  robots: { index: false, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f2f7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // platformScript changes data-platform (and lang on /app/lo) on <html> before React loads.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: platformScript }} />
        {/* Written by hand instead of metadata.manifest so it can send cookies: browsers fetch the manifest
            without cookies by default, and a site behind a login or a gate (like the ngrok preview's warning
            page) then answers with HTML instead of the manifest, and the app "cannot be installed". */}
        <link rel="manifest" href="/app/manifest.webmanifest" crossOrigin="use-credentials" />
      </head>
      <body>
        {children}
        <TabBar />
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
