import { Container, Eyebrow } from "@/components/ui/section";
import type { FeatureCard } from "@/lib/data/homepage";

import { ServiceCard } from "./service-card";

type QuickQuoteBarProps = {
  actions: FeatureCard[];
};

// Bento on wide screens: the first action is a tall dark tile, the second a soft blue tile and the
// fourth a wide warm tile; on smaller screens they become two columns, then one.
const tileClass = [
  "",
  "min-[981px]:bg-[linear-gradient(180deg,#eaf3fb,var(--dk-color-card))]",
  "",
  "min-[981px]:col-span-2 min-[981px]:bg-[linear-gradient(90deg,#fdeeec,var(--dk-color-card)_70%)]",
];

export function QuickQuoteBar({ actions }: QuickQuoteBarProps) {
  return (
    <section className="relative z-[4] pt-[72px] max-[780px]:bg-surface max-[780px]:pt-8" aria-labelledby="quick-quote-title">
      <Container>
        <div className="mb-7 grid max-w-[640px] gap-2.5">
          <Eyebrow>Start here</Eyebrow>
          <h2
            id="quick-quote-title"
            className="m-0 text-[clamp(1.8rem,3vw,2.5rem)] font-[850] leading-[1.2] tracking-[-0.025em] text-navy-950 max-[560px]:text-[1.6rem]"
          >
            What do you need today?
          </h2>
        </div>
        <div className="grid grid-cols-4 gap-[18px] max-[1120px]:grid-cols-2 max-[780px]:grid-cols-1 min-[981px]:grid-cols-[1.35fr_1fr_1fr] min-[981px]:grid-rows-[repeat(2,auto)]">
          {actions.map((action, index) => (
            <ServiceCard key={action.title} item={action} tone={index === 0 ? "feature" : "default"} className={tileClass[index]} />
          ))}
        </div>
      </Container>
    </section>
  );
}
