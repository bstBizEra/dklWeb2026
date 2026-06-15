import Link from "next/link";
import { ArrowRight, ClipboardCheck } from "lucide-react";

type CTASectionProps = {
  title: string;
  copy: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
};

export function CTASection({
  title,
  copy,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: CTASectionProps) {
  return (
    <section className="cta-section">
      <div className="dk-container cta-section__inner">
        <div>
          <span className="dk-icon-badge cta-section__icon">
            <ClipboardCheck size={24} aria-hidden="true" />
          </span>
          <h2>{title}</h2>
          <p>{copy}</p>
        </div>
        <div className="cta-section__actions">
          <Link href={primaryHref} className="dk-button dk-button-primary">
            {primaryLabel}
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
          {secondaryLabel && secondaryHref ? (
            <Link href={secondaryHref} className="dk-button dk-button-secondary">
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
