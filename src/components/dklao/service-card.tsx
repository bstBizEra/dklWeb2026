import Link from "@/components/i18n/link";
import { ArrowRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { IconBadge } from "@/components/ui/section";
import type { FeatureCard, IndustrySolution, ProductCategory } from "@/lib/data/homepage";
import { cn } from "@/lib/utils";

type ServiceCardProps = {
  item: FeatureCard | ProductCategory | IndustrySolution;
  href?: string;
  // "feature" is the large dark tile that opens the Home quick-start grid.
  tone?: "default" | "feature";
  className?: string;
};

export function ServiceCard({ item, href, tone = "default", className }: ServiceCardProps) {
  const Icon = item.icon;
  const targetHref = href ?? ("href" in item ? item.href : "#quote-request");
  const feature = tone === "feature";

  return (
    <Card
      className={cn(
        "dk-card service-card group relative grid min-h-[270px] content-start p-6 transition-[transform,box-shadow] duration-[260ms] ease-premium hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(11,27,51,0.14)] motion-reduce:hover:translate-y-0 max-[780px]:min-h-0",
        feature &&
          "border-transparent bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px),radial-gradient(120%_90%_at_100%_0%,rgba(0,97,175,0.55),transparent_60%),linear-gradient(160deg,var(--dk-color-navy-900),var(--dk-color-navy-950))] bg-[length:36px_36px,36px_36px,auto,auto] text-white min-[981px]:row-span-2 min-[981px]:content-end",
        className,
      )}
    >
      <IconBadge className={cn(feature && "bg-white/12 text-white")}>
        <Icon size={24} aria-hidden="true" />
      </IconBadge>
      {"eyebrow" in item ? (
        <p className="mt-[18px] mb-0 text-[13px] font-[850] uppercase text-action-red-text">{item.eyebrow}</p>
      ) : null}
      <h3
        className={cn(
          "mt-[18px] mb-0 text-[1.22rem] font-[750] leading-[1.18] text-foreground",
          feature && "text-white min-[981px]:text-[clamp(1.6rem,2.4vw,2.1rem)] min-[981px]:tracking-[-0.02em]",
        )}
      >
        {item.title}
      </h3>
      <p className={cn("mt-3.5 mb-5 text-[15px] leading-[1.65] text-slate-700", feature && "max-w-[38ch] text-white/75 min-[981px]:text-[17px]")}>
        {item.description}
      </p>
      <Link
        href={targetHref}
        className={cn(
          "service-card__link mt-auto inline-flex min-h-6 items-center max-[760px]:min-h-10 gap-2 text-[15px] font-[850] text-accent active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue",
          feature && "text-white",
        )}
      >
        {item.ctaLabel}
        <ArrowRight
          size={16}
          aria-hidden="true"
          className="transition-transform duration-[260ms] ease-premium group-hover:translate-x-1 motion-reduce:transition-none"
        />
      </Link>
    </Card>
  );
}
