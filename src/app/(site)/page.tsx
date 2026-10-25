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
import { homepageCtas, productCategories, quickQuoteActions } from "@/lib/data/homepage";

// The footer reads site facts from the CMS, so refresh the page at most once a minute.
export const revalidate = 60;

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-clip">
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="scroll-mt-[90px] focus:outline-none">
      <MainHero ctas={homepageCtas} />
      <HomeProof />
      <TrustedBy />
      <QuickQuoteBar actions={quickQuoteActions} />
      <SolutionOverview />
      <RentalHighlight />
      <ProductCategoryGrid categories={productCategories} />
      <ForkliftAnatomyInteractive />
      <IndustriesAndTrustSection />
      <KnowledgeCenterPreview />
      <QuoteSection />
      <FinalHomepageCTA />
      </main>
      <IndustrialFooter />
      <FloatingContactActions />
    </div>
  );
}
