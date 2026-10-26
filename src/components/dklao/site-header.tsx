import Image from "next/image";
import Link from "@/components/i18n/link";
import { ArrowRight } from "lucide-react";

import { LanguageToggle } from "@/components/i18n/language-toggle";
import { MainNavigation } from "@/components/dklao/mega-menu";
import { MobileMenu } from "@/components/dklao/mobile-menu";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import { getNavigation } from "@/lib/cms/navigation";
import { navigationFor } from "@/lib/data/navigation";
import { quoteHref } from "@/lib/data/routes";
import type { Locale } from "@/lib/i18n";
import { getMessages } from "@/messages";

// Sticky navy header. site-motion.tsx adds .is-scrolled once the page leaves the top, which deepens the
// surface and adds a shadow. The language toggle sits right of the quote button on desktop and beside
// the menu button on phones.
export async function SiteHeader({ locale }: { locale: Locale }) {
  const items = await getNavigation(locale);
  const t = getMessages(locale);
  const { menuGroupTitles, solutionsPromo } = navigationFor(locale);

  return (
    <header
      className="site-header sticky top-0 z-40 border-b border-slate-300/30 bg-navy-950/92 backdrop-blur-[18px] transition-[background-color,box-shadow] duration-[260ms] ease-premium [&.is-scrolled]:bg-navy-950/98 [&.is-scrolled]:shadow-[0_12px_32px_rgba(7,17,31,0.32)]"
      aria-label={t.header.navLabel}
    >
      <Container className="grid min-h-[78px] grid-cols-[auto_1fr_auto] items-center gap-7 max-[780px]:min-h-[68px] max-[780px]:gap-3">
        <Link className="inline-flex items-center py-2" href="/" aria-label={t.header.homeLabel}>
          <Image
            src="/images/logo/Logo-H_Text.svg"
            width={295}
            height={63}
            alt="DK LAO"
            priority
            className="h-auto w-[178px] max-[780px]:w-[142px]"
          />
        </Link>

        <MainNavigation
          items={items}
          label={t.header.mainMenu}
          groupTitles={menuGroupTitles}
          promo={solutionsPromo}
          className="justify-self-center max-[1120px]:hidden"
        />

        <div className="flex items-center gap-3 justify-self-end">
          <Button asChild variant="primary" className="max-[1120px]:hidden">
            <Link href={quoteHref()}>
              {t.header.requestQuote}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </Button>

          <LanguageToggle labels={t.language} />

          <MobileMenu items={items} quoteHref={quoteHref()} groupTitles={menuGroupTitles} labels={{ ...t.mobileMenu, requestQuote: t.header.requestQuote }} />
        </div>
      </Container>
    </header>
  );
}
