import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { Cta } from "@/lib/data/homepage";

type MainHeroProps = {
  ctas: Cta[];
};

export function MainHero({ ctas }: MainHeroProps) {
  return (
    <section className="main-hero">
      <div className="dk-container main-hero__grid">
        <div className="main-hero__content">
          <p className="dk-eyebrow">DK LAO Industrial Equipment Platform</p>
          <h1>DK LAO - Lifting, Moving, Cleaning & Growing Your Business</h1>
          <p>
            Reliable forklift rental, new and used forklift sales, spare parts,
            maintenance services, warehouse solutions, and professional cleaning
            equipment across Laos.
          </p>
          <div className="main-hero__actions" aria-label="Primary actions">
            {ctas.map((cta) => (
              <Link
                key={cta.label}
                className={
                  cta.variant === "primary"
                    ? "dk-button dk-button-primary"
                    : "dk-button dk-button-secondary"
                }
                href={cta.href}
              >
                {cta.label}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>

        <div className="main-hero__visual" aria-label="DK LAO forklift hero visual">
          <span className="main-hero__motion-panel main-hero__motion-panel--left" aria-hidden="true" />
          <span className="main-hero__motion-panel main-hero__motion-panel--right" aria-hidden="true" />
          <Image
            className="main-hero__anatomy-image"
            src="/images/hero/forklift-product-hero.png"
            width={1672}
            height={941}
            alt="Modern orange DK LAO forklift hero visual"
            priority
          />
        </div>
      </div>
    </section>
  );
}
