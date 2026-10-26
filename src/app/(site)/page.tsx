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
import { SocialShare } from "@/components/dklao/social-share";
import { TrustedBy } from "@/components/dklao/trusted-by";
import { Container } from "@/components/ui/section";
import { homepageCtas, productCategories, quickQuoteActions } from "@/lib/data/homepage";
import { homeSeo } from "@/lib/data/seo";

const siteUrl = process.env.APP_URL ?? "https://www.dklao.com";

// The footer reads site facts from the CMS, so refresh the page at most once a minute.
export const revalidate = 60;

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-clip">
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="scroll-mt-[90px] focus:outline-none">
      <MainHero ctas={homepageCtas} />
      <div className="home-share border-b border-slate-100 bg-surface py-4">
        <Container>
          <SocialShare url={`${siteUrl}/`} title={homeSeo.shareTitle} />
        </Container>
      </div>
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
