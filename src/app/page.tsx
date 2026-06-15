import {
  CleaningAndWarehouseSection,
  FinalHomepageCTA,
  ForkliftAnatomyInteractive,
  IndustriesAndTrustSection,
  KnowledgeCenterPreview,
  QuoteSection,
  RentalHighlight,
  SolutionOverview,
  UsedAndServiceSection,
} from "@/components/dklao/homepage-sections";
import { FloatingContactActions } from "@/components/dklao/floating-contact-actions";
import { IndustrialFooter } from "@/components/dklao/industrial-footer";
import { MainHero } from "@/components/dklao/main-hero";
import { ProductCategoryGrid } from "@/components/dklao/product-category-grid";
import { QuickQuoteBar } from "@/components/dklao/quick-quote-bar";
import { SiteHeader } from "@/components/dklao/site-header";
import { homepageCtas, productCategories, quickQuoteActions } from "@/lib/data/homepage";

export default function Home() {
  return (
    <main className="dk-page" id="main-content">
      <SiteHeader />
      <MainHero ctas={homepageCtas} />
      <QuickQuoteBar actions={quickQuoteActions} />
      <SolutionOverview />
      <RentalHighlight />
      <ProductCategoryGrid categories={productCategories} />
      <UsedAndServiceSection />
      <ForkliftAnatomyInteractive />
      <CleaningAndWarehouseSection />
      <IndustriesAndTrustSection />
      <KnowledgeCenterPreview />
      <QuoteSection />
      <FinalHomepageCTA />
      <IndustrialFooter />
      <FloatingContactActions />
    </main>
  );
}
