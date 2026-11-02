import type { Metadata, Viewport } from "next";
import { Noto_Sans_Lao } from "next/font/google";
import { headers } from "next/headers";

import "./(site)/globals.css";
import { NotFoundContent } from "@/components/dklao/not-found-content";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";
import { localeHeader } from "@/lib/i18n/request-locale";
import { getMessages } from "@/messages";

// The 404 for an address that matches no route at all. The site has no single root layout for Next to put
// an ordinary not-found.tsx in — (site), (app) and (payload) each bring their own <html> — so Next skips
// normal rendering and returns this file, which therefore carries the whole document itself. Without it
// the answer was Next's built-in error document: correct status, but a blank page until JavaScript ran.
// Enabled by experimental.globalNotFound in next.config.ts.
const notoSansLao = Noto_Sans_Lao({ subsets: ["lao"], variable: "--font-lao", display: "swap", preload: false });

// No layout runs here, so the language comes from the header src/proxy.ts sets on every site request.
async function requestLocale(): Promise<Locale> {
  const value = (await headers()).get(localeHeader);
  return isLocale(value) ? value : defaultLocale;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = getMessages(await requestLocale()).notFound;
  return {
    title: `${t.metaTitle} | DK LAO`,
    description: t.metaDescription,
    robots: { index: false, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#07111f",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default async function GlobalNotFound() {
  const locale = await requestLocale();

  return (
    <html lang={locale} className={locale === "lo" ? notoSansLao.variable : undefined}>
      <body>
        <a
          className="absolute -top-16 left-4 z-[100] inline-flex items-center rounded-button bg-action-red px-[18px] py-3 text-[15px] font-extrabold text-white shadow-cta transition-[top] duration-150 ease-premium focus:top-4 focus:outline-3 focus:outline-offset-2 focus:outline-white"
          href="#main-content"
        >
          {getMessages(locale).skipToContent}
        </a>
        <NotFoundContent locale={locale} />
      </body>
    </html>
  );
}
