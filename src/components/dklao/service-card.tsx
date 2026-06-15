import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { FeatureCard, IndustrySolution, ProductCategory } from "@/lib/data/homepage";

type ServiceCardProps = {
  item: FeatureCard | ProductCategory | IndustrySolution;
  href?: string;
};

export function ServiceCard({ item, href }: ServiceCardProps) {
  const Icon = item.icon;
  const targetHref = href ?? ("href" in item ? item.href : "#quote-request");

  return (
    <article className="dk-card service-card">
      <span className="dk-icon-badge">
        <Icon size={24} aria-hidden="true" />
      </span>
      {"eyebrow" in item ? <p className="service-card__eyebrow">{item.eyebrow}</p> : null}
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      <Link href={targetHref} className="service-card__link">
        {item.ctaLabel}
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </article>
  );
}
