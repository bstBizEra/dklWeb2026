import Image from "next/image";
import Link from "@/components/i18n/link";
import { ArrowRight } from "lucide-react";

import { LiftOffScene } from "@/components/dklao/scenes/lift-off";
import { Button } from "@/components/ui/button";
import { Container, Eyebrow } from "@/components/ui/section";
import type { Cta } from "@/lib/data/homepage";
import type { Messages } from "@/messages";

type MainHeroProps = {
  ctas: Cta[];
  labels: Messages["home"]["hero"];
};

// The forklift is one transparent cut-out (698 by 483px).
const truckSrc = "/images/hero/toyota-35-50-forklift-cutout.webp";

// A pallet with two tiers of cartons sitting on the forks, drawn in the photo's own coordinates (698 by
// 483) so it lines up with the blades at any size. The truck is seen from its front right, so the load
// shows its front (fork-tip) face and its right-hand face. Decorative.
function PalletLoad() {
  return (
    <svg className="absolute inset-0 size-full" viewBox="0 0 698 483" aria-hidden="true">
      {/* Pallet: right face, front face, top boards. */}
      <polygon points="232,463 366,434 366,449 232,478" fill="#5c432b" />
      <polygon points="14,450 232,463 232,478 14,465" fill="#7a5b3a" />
      <polygon points="14,450 232,463 366,434 192,432" fill="#9b7a50" />
      {/* Lower tier: right face, front face. */}
      <polygon points="230,461 348,436 348,360 230,385" fill="#9f6c3b" />
      <polygon points="32,450 230,461 230,385 32,374" fill="#c48f57" />
      {/* Upper tier: right face, front face, top. */}
      <polygon points="230,385 348,360 348,286 230,311" fill="#a8743f" />
      <polygon points="32,374 230,385 230,311 32,300" fill="#cf9a61" />
      <polygon points="32,300 230,311 348,286 185,284" fill="#e2b882" />
      <path d="M32,374 L230,385 L348,360" fill="none" stroke="#8a5f33" strokeWidth="2" />
      {/* Packing tape down the front and over the top. */}
      <polygon points="125,455 137,456 137,306 125,305" fill="#e9cfa6" opacity="0.9" />
      <polygon points="125,305 137,306 272,285 260,285" fill="#efd9b4" opacity="0.9" />
      {/* Shipping label with a DK LAO red band. */}
      <polygon points="56,355 103,358 103,332 56,329" fill="#f4f1ea" />
      <polygon points="56,336 103,339 103,332 56,329" fill="var(--dk-color-action-red)" />
    </svg>
  );
}

// The copy rises in line by line on load, 80ms apart. Reduced motion shows it at rest. The classes are
// written out in full because Tailwind only generates classes it can find as complete strings.
const rise = {
  eyebrow: "animate-[dk-rise_720ms_var(--dk-motion-ease-premium)_both] motion-reduce:animate-none",
  title: "animate-[dk-rise_720ms_var(--dk-motion-ease-premium)_80ms_both] motion-reduce:animate-none",
  lede: "animate-[dk-rise_720ms_var(--dk-motion-ease-premium)_160ms_both] motion-reduce:animate-none",
  actions: "animate-[dk-rise_720ms_var(--dk-motion-ease-premium)_240ms_both] motion-reduce:animate-none",
};

// The hero is scene 01 of the homepage scroll story ("Lift-off", scenes/lift-off.tsx). Everything marked
// data-lift is moved by that scene while the hero is pinned; at rest, and with reduced motion, the hero
// looks exactly as it does without the scene.
export function MainHero({ ctas, labels: t }: MainHeroProps) {
  return (
    // Navy gradient, with the blueprint grid and the brand stripe as their own layers so the scene can move them.
    <LiftOffScene className="relative isolate grid min-h-[500px] items-center data-[pinned=true]:min-h-[calc(100svh-78px)] bg-[linear-gradient(135deg,var(--dk-color-navy-950),var(--dk-color-navy-900)_56%,var(--dk-color-navy-800))] pt-6 pb-9 text-white max-[780px]:min-h-0 max-[780px]:pb-[30px]">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <span
          data-lift="grid"
          className="absolute inset-x-0 -top-12 -bottom-12 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:48px_48px]"
        />
      </div>

      <Container className="grid grid-cols-1 items-center gap-[42px] min-[1121px]:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)] max-[780px]:gap-[18px]">
        <div data-lift="copy" className="grid gap-[18px] max-[780px]:gap-3">
          <Eyebrow className={`tracking-[0.06em] ${rise.eyebrow}`}>{t.eyebrow}</Eyebrow>
          <h1
            className={`m-0 max-w-[820px] text-[clamp(2.2rem,3.7vw,3.15rem)] leading-none font-black tracking-[-0.035em] text-balance max-[560px]:text-[clamp(1.85rem,8.2vw,2.15rem)] ${rise.title}`}
          >
            {t.title}
          </h1>
          <p className={`m-0 max-w-[34ch] text-[1.15rem] leading-[1.6] text-white/78 ${rise.lede}`}>{t.copy}</p>
          <div
            className={`mt-1.5 flex flex-wrap gap-3.5 max-[780px]:mt-0.5 max-[780px]:grid max-[780px]:grid-cols-2 max-[780px]:gap-2.5 ${rise.actions}`}
            aria-label={t.actionsLabel}
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

        {/* The warehouse stage: racking far back, a lit floor, and the forklift with its load. Layers move at
            different speeds in the scene, which gives the depth. */}
        <div
          data-lift="stage"
          className="relative aspect-[4/3] max-[1120px]:max-w-[680px] max-[780px]:w-full max-[780px]:max-w-[min(520px,88vw)] max-[780px]:justify-self-center"
          role="img"
          aria-label="A DK LAO forklift drives into a warehouse carrying a pallet of cartons"
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden [mask-image:radial-gradient(ellipse_at_55%_55%,black_45%,transparent_78%)]" aria-hidden="true">
            {/* The scene moves this wrapper; the CSS fade-in runs on the layer inside, because a CSS animation
                (held by its fill mode) would override GSAP's inline transform on the same element. */}
            <span data-lift="racking" className="absolute inset-x-0 -top-[8%] -bottom-[8%] block">
              <span className="absolute inset-0 block animate-[hero-depth-in_1100ms_var(--dk-motion-ease-premium)_both] bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.13)_0_3px,transparent_3px_118px),repeating-linear-gradient(180deg,rgba(242,101,34,0.2)_0_4px,transparent_4px_78px)] blur-[0.6px] motion-reduce:animate-none" />
            </span>
          </div>
          <span
            className="pointer-events-none absolute inset-x-[-6%] bottom-0 h-[34%] bg-[radial-gradient(ellipse_at_50%_100%,rgba(0,97,175,0.38),transparent_70%)]"
            aria-hidden="true"
          />
          <span className="pointer-events-none absolute inset-x-0 bottom-[11%] h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)]" aria-hidden="true" />

          <div data-lift="truck" className="absolute bottom-[6%] left-[3%] w-[94%] aspect-[698/483]">
            {/* CSS drives the truck in on load; the scene moves the wrapper above, never this element. */}
            <div className="absolute inset-0 animate-[hero-drive-in_1150ms_var(--dk-motion-ease-premium)_200ms_both] motion-reduce:animate-none">
              <span
                className="absolute inset-x-[4%] bottom-[-3%] h-[9%] rounded-[50%] bg-black/55 blur-md animate-[hero-shadow-in_1150ms_var(--dk-motion-ease-premium)_200ms_both] motion-reduce:animate-none"
                aria-hidden="true"
              />
              <Image className="absolute inset-0 size-full" src={truckSrc} width={698} height={483} sizes="(max-width: 780px) 88vw, 560px" alt="" priority />
              <PalletLoad />
            </div>
          </div>
        </div>
      </Container>

      <span data-lift="dim" className="pointer-events-none absolute inset-0 z-[3] bg-navy-950/45 opacity-0" aria-hidden="true" />
      <span
        data-lift="stripe"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] h-1.5 origin-bottom bg-[linear-gradient(90deg,var(--dk-color-brand-blue),var(--dk-color-action-red)_50%,var(--dk-color-action-orange))]"
        aria-hidden="true"
      />
    </LiftOffScene>
  );
}
