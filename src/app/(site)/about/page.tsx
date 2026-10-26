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
import { SocialShare } from "@/components/dklao/social-share";
import { TrustedBy } from "@/components/dklao/trusted-by";
import { Container } from "@/components/ui/section";
import { aboutSeo } from "@/lib/data/seo";
import { shareImage } from "@/lib/data/share";

const siteUrl = process.env.APP_URL ?? "https://www.dklao.com";

// The footer reads site facts from the CMS, so refresh the page at most once a minute.
export const revalidate = 60;

export const metadata: Metadata = {
  title: aboutSeo.title,
  description: aboutSeo.description,
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: aboutSeo.shareTitle,
    description: aboutSeo.shareDescription,
    url: "/about",
    images: [shareImage("about")],
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen overflow-x-clip">
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="scroll-mt-[90px] focus:outline-none">
      <AboutHero />
      <CompanySnapshot />
      <TrustedBy title="Our clients" />
      <AboutStory />
      <VisionCommitment />
      <AboutWhatWeDo />
      <WhyChooseDKLAO />
      <IndustriesServed />
      <ServicePromise />
      <div className="about-share border-y border-slate-100 bg-surface py-6">
        <Container>
          <SocialShare url={`${siteUrl}/about`} title={aboutSeo.shareTitle} />
        </Container>
      </div>
      <AboutFinalCTA />
      </main>
      <IndustrialFooter />
      <FloatingContactActions />
    </div>
  );
}
