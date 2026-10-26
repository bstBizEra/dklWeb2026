import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

// Page layout primitives shared by every page: the 1180px container, section spacing, and the
// eyebrow / title / intro header. They replace the old .dk-container, .dk-section and
// .dk-section-header classes.

function Container({ className, asChild = false, ...props }: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      className={cn("dk-container mx-auto w-[min(1180px,calc(100%_-_32px))] max-[760px]:w-[min(1180px,calc(100%_-_24px))]", className)}
      {...props}
    />
  );
}

function Section({
  className,
  spacing = "default",
  ...props
}: React.ComponentProps<"section"> & { spacing?: "default" | "tight" }) {
  return (
    <section
      className={cn(spacing === "tight" ? "py-16 max-[760px]:py-14" : "py-[88px] max-[760px]:py-14", className)}
      {...props}
    />
  );
}

// Page-hero entrance (content pages and About): each part rises in turn, 480ms ease-out, 50ms apart, the
// whole sequence under 700ms. CSS keyframes, so it runs from first paint with no flash before hydration and
// plays again when a link brings in a new page. The homepage hero keeps its own longer drive-in.
const heroRise = {
  eyebrow: "animate-[dk-rise_480ms_var(--dk-motion-ease-premium)_both] motion-reduce:animate-none",
  title: "animate-[dk-rise_480ms_var(--dk-motion-ease-premium)_50ms_both] motion-reduce:animate-none",
  lede: "animate-[dk-rise_480ms_var(--dk-motion-ease-premium)_100ms_both] motion-reduce:animate-none",
  actions: "animate-[dk-rise_480ms_var(--dk-motion-ease-premium)_150ms_both] motion-reduce:animate-none",
  after: "animate-[dk-rise_480ms_var(--dk-motion-ease-premium)_200ms_both] motion-reduce:animate-none",
};

function Eyebrow({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("m-0 text-[13px] font-extrabold uppercase leading-tight text-action-red", className)} {...props} />;
}

function SectionTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      className={cn(
        "m-0 text-[2.5rem] font-[850] leading-[1.05] tracking-[-0.03em] text-balance text-navy-950 max-[760px]:text-[2rem] max-[560px]:text-[1.6rem] max-[560px]:leading-[1.12]",
        className,
      )}
      {...props}
    />
  );
}

function SectionCopy({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("m-0 text-[17px] leading-[1.7] text-slate-700 max-[760px]:text-base", className)} {...props} />;
}

function SectionHeader({
  eyebrow,
  title,
  copy,
  className,
  titleId,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  copy?: React.ReactNode;
  className?: string;
  titleId?: string;
}) {
  return (
    <div className={cn("dk-section-header mb-9 grid max-w-[760px] gap-4", className)}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <SectionTitle id={titleId}>{title}</SectionTitle>
      {copy ? <SectionCopy>{copy}</SectionCopy> : null}
    </div>
  );
}

function IconBadge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn("inline-grid size-12 place-items-center rounded-2xl bg-brand-blue/10 text-brand-blue", className)}
      {...props}
    />
  );
}

export { Container, Section, Eyebrow, SectionTitle, SectionCopy, SectionHeader, IconBadge, heroRise };
