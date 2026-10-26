import Link from "@/components/i18n/link";
import type { Metadata } from "next";
import { ArrowRight, Compass } from "lucide-react";

import { SiteHeader } from "@/components/dklao/site-header";
import { Button } from "@/components/ui/button";
import { Container, Eyebrow, IconBadge } from "@/components/ui/section";
import { IndustrialFooter } from "@/components/dklao/industrial-footer";
import { publishedRoutes, quoteHref } from "@/lib/data/routes";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { getMessages } from "@/messages";

// not-found receives no params: the layout and the catch-all page record the URL locale for the request.
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
  const locale = getRequestLocale();
  const t = getMessages(locale).notFound;
  const quickLinks = publishedRoutes(locale).filter((route) => route.id !== "home");

  return (
    <div className="min-h-screen overflow-x-clip">
      <SiteHeader locale={locale} />
      <main id="main-content" tabIndex={-1} className="scroll-mt-[90px] focus:outline-none">
      <section className="grid min-h-[calc(100vh_-_78px)] items-center bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(135deg,var(--dk-color-navy-950),var(--dk-color-navy-900)_56%,var(--dk-color-navy-800))] bg-[size:48px_48px,48px_48px,cover] py-[72px] text-white">
        <Container className="grid max-w-[680px] justify-items-start gap-4">
          <IconBadge className="bg-white/10 text-white">
            <Compass size={24} aria-hidden="true" />
          </IconBadge>
          <Eyebrow>{t.eyebrow}</Eyebrow>
          <h1 className="m-0 text-[2.6rem] leading-[1.05] font-black max-[780px]:text-[2rem]">{t.title}</h1>
          <p className="m-0 max-w-[560px] text-[1.03rem] leading-[1.68] text-white/78">{t.copy}</p>
          <div className="mt-1.5 flex flex-wrap gap-3.5 max-[780px]:grid max-[780px]:w-full max-[780px]:grid-cols-1">
            <Button asChild variant="primary">
              <Link href="/">
                {t.home}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="light">
              <Link href={quoteHref()}>{t.quote}</Link>
            </Button>
          </div>
          <nav className="mt-[18px] flex flex-wrap gap-2.5" aria-label={t.popular}>
            {quickLinks.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="inline-flex items-center gap-2 rounded-full border border-white/22 px-4 py-[9px] text-[0.9rem] font-extrabold text-white/82 hover:bg-white/8 hover:text-white"
              >
                {item.label}
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            ))}
          </nav>
        </Container>
      </section>
      </main>
      <IndustrialFooter locale={locale} />
    </div>
  );
}
