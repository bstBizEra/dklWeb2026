import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container, Eyebrow } from "@/components/ui/section";
import type { Cta } from "@/lib/data/homepage";

type MainHeroProps = {
  ctas: Cta[];
};

// The two navy panels slide off the photo on load; with reduced motion they are not drawn at all.
const panel = "pointer-events-none absolute inset-y-0 z-[2] w-[54%] max-[780px]:w-[58%] motion-reduce:hidden";

export function MainHero({ ctas }: MainHeroProps) {
  return (
    // Navy blueprint grid over a navy gradient, with the brand stripe along the bottom edge.
    <section className="relative grid min-h-[500px] items-center bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(135deg,var(--dk-color-navy-950),var(--dk-color-navy-900)_56%,var(--dk-color-navy-800))] bg-[size:48px_48px,48px_48px,cover] pt-6 pb-9 text-white after:absolute after:inset-x-0 after:bottom-0 after:h-1.5 after:bg-[linear-gradient(90deg,var(--dk-color-brand-blue),var(--dk-color-action-red)_50%,var(--dk-color-action-orange))] after:content-[''] max-[780px]:min-h-0 max-[780px]:pb-[30px]">
      <Container className="grid grid-cols-1 items-center gap-[42px] min-[1121px]:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)] max-[780px]:gap-[18px]">
        <div className="grid animate-[dk-rise_720ms_var(--dk-motion-ease-premium)_both] gap-[18px] motion-reduce:animate-none max-[780px]:gap-3">
          <Eyebrow className="tracking-[0.06em]">Lifting, Moving, Cleaning &amp; Growing Your Business</Eyebrow>
          <h1 className="m-0 max-w-[820px] text-[clamp(2.2rem,3.7vw,3.15rem)] leading-none font-black tracking-[-0.035em] text-balance max-[560px]:text-[clamp(1.85rem,8.2vw,2.15rem)]">
            Forklift Rental, Sales &amp; Service in Laos
          </h1>
          <p className="m-0 max-w-[34ch] text-[1.15rem] leading-[1.6] text-white/78">
            Rent, buy and maintain forklifts. Source spare parts. Equip your
            warehouse. One DK LAO team across Laos.
          </p>
          <div
            className="mt-1.5 flex flex-wrap gap-3.5 max-[780px]:mt-0.5 max-[780px]:grid max-[780px]:grid-cols-2 max-[780px]:gap-2.5"
            aria-label="Primary actions"
          >
            {ctas.slice(0, 2).map((cta) => (
              <Button
                key={cta.label}
                asChild
                variant={cta.variant === "primary" ? "primary" : "secondary"}
                className="max-[780px]:min-h-[46px] max-[780px]:gap-2 max-[780px]:px-3 max-[780px]:py-[11px] max-[780px]:text-[0.88rem]"
              >
                <Link href={cta.href}>
                  {cta.label}
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </Button>
            ))}
          </div>
        </div>

        <div
          className="relative aspect-video overflow-hidden rounded-[28px] border border-white/14 bg-[linear-gradient(135deg,rgba(0,97,175,0.22),rgba(7,17,31,0.62))] shadow-blue-glow max-[1120px]:max-w-[680px] max-[780px]:w-full max-[780px]:max-w-[min(520px,88vw)] max-[780px]:justify-self-center max-[780px]:rounded-[18px]"
          aria-label="DK LAO forklift hero visual"
        >
          <span
            className={`${panel} -left-0.5 animate-[hero-reveal-left_920ms_var(--dk-motion-ease-premium)_both] bg-[linear-gradient(90deg,rgba(7,17,31,0.98),rgba(7,17,31,0.86)_72%,rgba(7,17,31,0))]`}
            aria-hidden="true"
          />
          <span
            className={`${panel} -right-0.5 animate-[hero-reveal-right_920ms_var(--dk-motion-ease-premium)_260ms_both] bg-[linear-gradient(270deg,rgba(7,17,31,0.98),rgba(7,17,31,0.84)_72%,rgba(7,17,31,0))]`}
            aria-hidden="true"
          />
          <Image
            className="absolute inset-0 size-full origin-center animate-[hero-image-settle_940ms_var(--dk-motion-ease-premium)_280ms_both] object-cover motion-reduce:animate-none"
            src="/images/hero/forklift-product-hero.png"
            width={1672}
            height={941}
            alt="Modern orange DK LAO forklift hero visual"
            priority
          />
        </div>
      </Container>
    </section>
  );
}
