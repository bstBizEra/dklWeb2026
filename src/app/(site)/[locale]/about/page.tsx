import type { Metadata } from "next";

import {
  AboutFinalCTA,
  AboutHero,
  AboutStory,
  AboutWhatWeDo,
  CompanySnapshot,
  IndustriesServed,
  ServicePromise,
  VisionCommitment,
  WhyChooseDKLAO,
} from "@/components/dklao/about-sections";
import { FloatingContactActions } from "@/components/dklao/floating-contact-actions";
import { IndustrialFooter } from "@/components/dklao/industrial-footer";
import { SiteHeader } from "@/components/dklao/site-header";
import { TrustedBy } from "@/components/dklao/trusted-by";
import { seoFor } from "@/lib/data/seo";
import { shareImage } from "@/lib/data/share";
import { localeParam } from "@/lib/i18n";
import { localeAlternates, ogBase } from "@/lib/i18n/metadata";
import { getMessages } from "@/messages";

// The footer reads site facts from the CMS, so refresh the page at most once a minute.
export const revalidate = 60;

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const locale = await localeParam(params);
  const { aboutSeo } = seoFor(locale);

  return {
    title: aboutSeo.title,
    description: aboutSeo.description,
    alternates: localeAlternates("/about", locale),
    openGraph: {
      ...ogBase("/about", locale),
      title: aboutSeo.shareTitle,
      description: aboutSeo.shareDescription,
      images: [shareImage("about")],
    },
  };
}

export default async function AboutPage({ params }: { params: Params }) {
  const locale = await localeParam(params);

  return (
    <div className="min-h-screen overflow-x-clip">
      <SiteHeader locale={locale} />
      <main id="main-content" tabIndex={-1} className="scroll-mt-[90px] focus:outline-none">
      <AboutHero locale={locale} />
      <CompanySnapshot locale={locale} />
      <TrustedBy title={getMessages(locale).trustedBy.short} locale={locale} />
      <AboutStory locale={locale} />
      <VisionCommitment locale={locale} />
      <AboutWhatWeDo locale={locale} />
      <WhyChooseDKLAO locale={locale} />
      <IndustriesServed locale={locale} />
      <ServicePromise locale={locale} />
      <AboutFinalCTA locale={locale} />
      </main>
      <IndustrialFooter locale={locale} />
      <FloatingContactActions />
    </div>
  );
}
