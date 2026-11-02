import {
  FinalHomepageCTA,
  ForkliftAnatomyInteractive,
  IndustriesAndTrustSection,
  KnowledgeCenterPreview,
  QuoteSection,
  RentalHighlight,
  SolutionOverview,
} from "@/components/dklao/homepage-sections";
import { FloatingContactActions } from "@/components/dklao/floating-contact-actions";
import { IndustrialFooter } from "@/components/dklao/industrial-footer";
import { HomeProof } from "@/components/dklao/home-proof";
import { MainHero } from "@/components/dklao/main-hero";
import { ProductCategoryGrid } from "@/components/dklao/product-category-grid";
import { QuickQuoteBar } from "@/components/dklao/quick-quote-bar";
import { SiteHeader } from "@/components/dklao/site-header";
import { TrustedBy } from "@/components/dklao/trusted-by";
import { homepageFor } from "@/lib/data/homepage";
import { localeParam } from "@/lib/i18n";
import { getMessages } from "@/messages";

// The footer reads site facts from the CMS, so refresh the page at most once a minute.
export const revalidate = 60;

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await localeParam(params);
  const { homepageCtas, productCategories, quickQuoteActions } = homepageFor(locale);
  const t = getMessages(locale);

  return (
    <div className="min-h-screen overflow-x-clip">
      <SiteHeader locale={locale} />
      <main id="main-content" tabIndex={-1} className="scroll-mt-[90px] focus:outline-none">
      <MainHero ctas={homepageCtas} labels={t.home.hero} />
      <HomeProof locale={locale} />
      <TrustedBy title={t.trustedBy.title} locale={locale} />
      <QuickQuoteBar actions={quickQuoteActions} labels={t.home.quickQuote} />
      <SolutionOverview locale={locale} />
      <RentalHighlight locale={locale} />
      <ProductCategoryGrid categories={productCategories} labels={t.home.categories} />
      <ForkliftAnatomyInteractive locale={locale} />
      <IndustriesAndTrustSection locale={locale} />
      <KnowledgeCenterPreview locale={locale} />
      <QuoteSection locale={locale} />
      <FinalHomepageCTA locale={locale} />
      </main>
      <IndustrialFooter locale={locale} />
      <FloatingContactActions locale={locale} />
    </div>
  );
}
