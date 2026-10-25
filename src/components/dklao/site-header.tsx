import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { MainNavigation } from "@/components/dklao/mega-menu";
import { MobileMenu } from "@/components/dklao/mobile-menu";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import { getNavigation } from "@/lib/cms/navigation";
import { quoteHref } from "@/lib/data/routes";

// Sticky navy header. site-motion.tsx adds .is-scrolled once the page leaves the top, which deepens the
// surface and adds a shadow.
export async function SiteHeader() {
  const items = await getNavigation();

  return (
    <header
      className="site-header sticky top-0 z-40 border-b border-slate-300/30 bg-navy-950/92 backdrop-blur-[18px] transition-[background-color,box-shadow] duration-[260ms] ease-premium [&.is-scrolled]:bg-navy-950/98 [&.is-scrolled]:shadow-[0_12px_32px_rgba(7,17,31,0.32)]"
      aria-label="DK LAO primary navigation"
    >
      <Container className="grid min-h-[78px] grid-cols-[auto_1fr_auto] items-center gap-7 max-[780px]:min-h-[68px]">
        <Link className="inline-flex items-center py-2" href="/" aria-label="DK LAO home">
          <Image
            src="/images/logo/Logo-H_Text.svg"
            width={295}
            height={63}
            alt="DK LAO"
            priority
            className="h-auto w-[178px] max-[780px]:w-[142px]"
          />
        </Link>

        <MainNavigation items={items} className="justify-self-center max-[1120px]:hidden" />

        <Button asChild variant="primary" className="max-[1120px]:hidden">
          <Link href={quoteHref()}>
            Request a Quote
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </Button>

        <MobileMenu items={items} quoteHref={quoteHref()} />
      </Container>
    </header>
  );
}
