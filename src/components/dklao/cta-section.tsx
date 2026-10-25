import Link from "next/link";
import { ArrowRight, ClipboardCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container, IconBadge } from "@/components/ui/section";

type CTASectionProps = {
  title: string;
  copy: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  tertiaryLabel?: string;
  tertiaryHref?: string;
};

// Closing call to action on a navy grid: one primary button, at most two quieter ones.
export function CTASection({
  title,
  copy,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  tertiaryLabel,
  tertiaryHref,
}: CTASectionProps) {
  return (
    <section className="bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(135deg,var(--dk-color-navy-950),var(--dk-color-navy-800))] bg-[length:48px_48px,48px_48px,cover] py-[66px] text-white">
      <Container className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-8 max-[780px]:grid-cols-1">
        <div>
          <IconBadge className="mb-[18px] bg-white/10 text-white">
            <ClipboardCheck size={24} aria-hidden="true" />
          </IconBadge>
          <h2 className="m-0 text-[2.5rem] font-[850] leading-[1.06] tracking-[-0.03em] text-balance max-[780px]:text-[2rem]">
            {title}
          </h2>
          <p className="mt-3 mb-0 leading-[1.75] text-white/75">{copy}</p>
        </div>
        <div className="flex flex-wrap gap-3 max-[780px]:grid">
          <Button asChild variant="primary">
            <Link href={primaryHref}>
              {primaryLabel}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </Button>
          {secondaryLabel && secondaryHref ? (
            <Button asChild variant="secondary">
              <Link href={secondaryHref}>{secondaryLabel}</Link>
            </Button>
          ) : null}
          {tertiaryLabel && tertiaryHref ? (
            <Button asChild variant="light">
              <Link href={tertiaryHref}>{tertiaryLabel}</Link>
            </Button>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
