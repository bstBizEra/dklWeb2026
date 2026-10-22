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

// The footer reads site facts from the CMS, so refresh the page at most once a minute.
export const revalidate = 60;

export const metadata: Metadata = {
  title:
    "About DK LAO - Material Handling, Forklift Rental, Services & Warehouse Solutions in Laos",
  description:
    "DK LAO is a trusted industrial equipment partner in Laos, providing forklift rental, new and used forklift sales, spare parts, maintenance services, warehouse solutions, and professional cleaning equipment.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title:
      "About DK LAO - Material Handling, Forklift Rental, Services & Warehouse Solutions in Laos",
    description:
      "Learn how DK LAO supports material handling, forklift rental, sales, spare parts, maintenance, warehouse solutions, and professional cleaning equipment in Laos.",
    url: "/about",
    images: [
      {
        url: "/images/hero/forklift-product-hero.png",
        width: 1672,
        height: 941,
        alt: "DK LAO forklift and industrial equipment support",
      },
    ],
  },
};

export default function AboutPage() {
  return (
    <main className="dk-page" id="main-content">
      <SiteHeader />
      <AboutHero />
      <CompanySnapshot />
      <AboutStory />
      <VisionCommitment />
      <AboutWhatWeDo />
      <WhyChooseDKLAO />
      <IndustriesServed />
      <ServicePromise />
      <AboutFinalCTA />
      <IndustrialFooter />
      <FloatingContactActions />
    </main>
  );
}
