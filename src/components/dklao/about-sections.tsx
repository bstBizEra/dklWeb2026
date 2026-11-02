import Image from "next/image";
import Link from "@/components/i18n/link";
import { ArrowRight, CheckCircle2, ClipboardCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container, Eyebrow, IconBadge, Section, SectionCopy, SectionHeader, SectionTitle } from "@/components/ui/section";
import { aboutFor } from "@/lib/data/about";
import type { Locale } from "@/lib/i18n";
import { getMessages } from "@/messages";
import { CTASection } from "./cta-section";

const aboutText = (locale: Locale) => getMessages(locale).about;

// Section surfaces. The class names about-* that remain are hooks for the scroll motion (site-motion.tsx).
const navyGrid =
  "relative bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(135deg,var(--dk-color-navy-950),var(--dk-color-navy-800))] bg-[size:44px_44px,44px_44px,cover] text-white";
const paperGrid =
  "bg-[linear-gradient(rgba(7,17,31,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(7,17,31,0.04)_1px,transparent_1px)] bg-[size:42px_42px] bg-white";
// Brand stripe along the bottom edge of the navy sections.
const brandStripe =
  "after:absolute after:inset-x-0 after:bottom-0 after:h-[5px] after:bg-[linear-gradient(90deg,var(--dk-color-brand-blue),var(--dk-color-action-red),var(--dk-color-action-orange))] after:content-['']";
const cardTitle = "mt-[18px] mb-0 text-[1.15rem] font-[750] leading-[1.18] text-navy-950";
const cardCopy = "leading-[1.66] text-slate-700";

export function AboutHero({ locale }: { locale: Locale }) {
  const { aboutHeroCtas } = aboutFor(locale);
  const t = aboutText(locale).hero;
  return (
    <section
      className={`relative overflow-hidden bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px),radial-gradient(circle_at_78%_24%,rgba(0,97,175,0.36),transparent_30%),radial-gradient(circle_at_88%_86%,rgba(217,26,33,0.22),transparent_30%),linear-gradient(135deg,var(--dk-color-navy-950),var(--dk-color-navy-800))] bg-[size:48px_48px,48px_48px,cover,cover,cover] pt-[74px] pb-[82px] text-white max-[780px]:pt-[46px] max-[780px]:pb-14 ${brandStripe}`}
    >
      <Container className="grid grid-cols-[minmax(0,0.86fr)_minmax(460px,1.14fr)] items-center gap-[46px] max-[1120px]:grid-cols-1 max-[780px]:gap-[22px]">
        <div className="grid gap-[18px] max-[780px]:gap-3.5">
          <Eyebrow>{t.eyebrow}</Eyebrow>
          <h1 className="m-0 max-w-[760px] text-[3.2rem] leading-[1.02] font-black max-[780px]:text-[clamp(2.1rem,9.2vw,2.55rem)] max-[560px]:text-[clamp(1.6rem,7.3vw,1.95rem)] max-[560px]:leading-[1.12] max-[560px]:tracking-[-0.025em] max-[560px]:text-balance">
            {t.title}
          </h1>
          <p className="m-0 max-w-[680px] text-[1.05rem] leading-[1.7] text-white/78 max-[780px]:text-[0.96rem] max-[780px]:leading-[1.58]">
            {t.copy}
          </p>
          <div className="mt-2 flex flex-wrap gap-3 max-[780px]:grid">
            {aboutHeroCtas.map((cta) => (
              <Button key={cta.label} asChild variant={cta.variant}>
                <Link href={cta.href}>
                  {cta.label}
                  {cta.variant === "primary" ? <ArrowRight size={18} aria-hidden="true" /> : null}
                </Link>
              </Button>
            ))}
          </div>
        </div>
        <div
          className="overflow-hidden rounded-[26px] border border-white/14 bg-white/6 shadow-blue-glow max-[1120px]:max-w-[680px] max-[780px]:w-full max-[780px]:rounded-[18px]"
          aria-label={t.visualLabel}
        >
          <Image
            src="/images/hero/forklift-product-hero.png"
            width={1672}
            height={941}
            alt={t.imageAlt}
            priority
            className="size-full min-h-[330px] object-cover max-[780px]:min-h-[220px]"
          />
        </div>
      </Container>
    </section>
  );
}

export function CompanySnapshot({ locale }: { locale: Locale }) {
  const { companySnapshot } = aboutFor(locale);
  const t = aboutText(locale).snapshot;
  return (
    <Section className="bg-surface" aria-labelledby="company-snapshot-title">
      <Container>
        <SectionHeader eyebrow={t.eyebrow} titleId="company-snapshot-title" title={t.title} copy={t.copy} />
        <div className="grid grid-cols-3 gap-[18px] max-[1120px]:grid-cols-2 max-[780px]:grid-cols-1">
          {companySnapshot.map((metric) => (
            <Card asChild key={metric.label} className="about-snapshot__card grid min-h-[180px] content-start p-6">
              <article>
                <span className="text-[0.78rem] font-[850] text-action-red uppercase">{metric.label}</span>
                <strong className="mt-3 text-[1.3rem] leading-[1.18] text-navy-950">{metric.value}</strong>
                <p className="mt-3 mb-0 leading-[1.6] text-slate-700">{metric.detail}</p>
              </article>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

const collageTile = "overflow-hidden rounded-[20px] border border-slate-300/78 bg-card shadow-card";

export function AboutStory({ locale }: { locale: Locale }) {
  const t = aboutText(locale).story;
  return (
    <Section className="bg-white">
      <Container className="grid grid-cols-[minmax(0,0.86fr)_minmax(380px,0.74fr)] items-center gap-12 max-[1120px]:grid-cols-1">
        <div className="[&>p:not(:first-child)]:mt-4">
          <Eyebrow>{t.eyebrow}</Eyebrow>
          <SectionTitle className="mt-4">{t.title}</SectionTitle>
          <SectionCopy>{t.copy}</SectionCopy>
          <p className="leading-[1.78] text-slate-700">{t.p1}</p>
          <p className="mb-0 leading-[1.78] text-slate-700">{t.p2}</p>
        </div>
        <div
          className="about-story__collage grid grid-cols-[1fr_0.72fr] items-stretch gap-3.5 max-[780px]:grid-cols-1"
          aria-label={t.collageLabel}
        >
          <Image
            src="/images/hero/forklift-product-hero.png"
            width={1672}
            height={941}
            alt={t.image1Alt}
            className={`${collageTile} row-span-2 h-full min-h-[380px] w-full object-cover max-[780px]:row-span-1 max-[780px]:h-auto max-[780px]:min-h-0`}
          />
          <Image
            src="/images/anatomy/forklift-equipment-matching-reference.png"
            width={1680}
            height={944}
            alt={t.image2Alt}
            className={`${collageTile} h-[230px] w-full object-cover max-[780px]:h-auto`}
          />
          <div
            className={`${collageTile} grid content-center gap-4 bg-[linear-gradient(rgba(0,97,175,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(0,97,175,0.07)_1px,transparent_1px)] bg-surface bg-[size:34px_34px] p-[22px] leading-[1.35] font-[850] text-navy-950`}
          >
            <ClipboardCheck size={28} aria-hidden="true" className="text-action-red" />
            <span>{t.caption}</span>
          </div>
        </div>
      </Container>
    </Section>
  );
}

const visionCard =
  "about-vision__card min-h-[340px] rounded-card border border-white/16 p-[34px] max-[780px]:min-h-0 [&_h2]:mt-[18px] [&_h2]:mb-0 [&_h2]:text-[2rem] [&_h2]:leading-[1.1] [&_h2]:font-[850] [&_h2]:tracking-[-0.02em] [&_p:not(:first-child)]:max-w-[620px] [&_p:not(:first-child)]:leading-[1.75] [&_p:not(:first-child)]:text-white/78";

export function VisionCommitment({ locale }: { locale: Locale }) {
  const { vision, commitment } = aboutText(locale);
  return (
    <Section className={`${navyGrid} ${brandStripe}`}>
      <Container className="grid grid-cols-2 gap-[18px] max-[780px]:grid-cols-1">
        <article className={`${visionCard} bg-[linear-gradient(135deg,rgba(21,74,153,0.82),rgba(0,97,175,0.44))]`}>
          <Eyebrow className="text-white/85">{vision.eyebrow}</Eyebrow>
          <h2>{vision.title}</h2>
          <p>{vision.copy}</p>
        </article>
        <article className={`${visionCard} bg-[linear-gradient(135deg,rgba(217,26,33,0.72),rgba(231,68,34,0.36))]`}>
          <Eyebrow className="text-white/85">{commitment.eyebrow}</Eyebrow>
          <h2>{commitment.title}</h2>
          <p>{commitment.copy}</p>
        </article>
      </Container>
    </Section>
  );
}

export function AboutWhatWeDo({ locale }: { locale: Locale }) {
  const { aboutSolutions } = aboutFor(locale);
  const t = aboutText(locale).whatWeDo;
  return (
    <Section className={paperGrid} id="about-solutions">
      <Container>
        <SectionHeader eyebrow={t.eyebrow} title={t.title} copy={t.copy} />
        <div className="grid grid-cols-3 gap-[18px] max-[1120px]:grid-cols-2 max-[780px]:grid-cols-1">
          {aboutSolutions.map((solution) => {
            const Icon = solution.icon;

            return (
              <Card asChild key={solution.title} className="about-solution-card grid min-h-[318px] content-start p-[26px] max-[780px]:min-h-0">
                <article>
                  <IconBadge>
                    <Icon size={24} aria-hidden="true" />
                  </IconBadge>
                  <h3 className={cardTitle}>{solution.title}</h3>
                  <p className={cardCopy}>{solution.description}</p>
                  {solution.href && solution.ctaLabel ? (
                    <Link
                      href={solution.href}
                      className="mt-auto inline-flex items-center gap-2 text-[0.9rem] font-[850] text-brand-blue hover:underline hover:underline-offset-4 max-[760px]:min-h-10"
                    >
                      {solution.ctaLabel}
                      <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  ) : null}
                </article>
              </Card>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

export function WhyChooseDKLAO({ locale }: { locale: Locale }) {
  const { aboutTrustPoints } = aboutFor(locale);
  const t = aboutText(locale).why;
  return (
    <Section className="bg-surface">
      <Container>
        <SectionHeader eyebrow={t.eyebrow} title={t.title} copy={t.copy} />
        <div className="grid grid-cols-4 gap-[18px] max-[1120px]:grid-cols-2 max-[780px]:grid-cols-1">
          {aboutTrustPoints.map((point) => {
            const Icon = point.icon;

            return (
              <article key={point.title} className="rounded-[20px] border border-slate-300/78 bg-card p-[22px]">
                <Icon size={22} aria-hidden="true" className="text-action-red" />
                <h3 className={cardTitle}>{point.title}</h3>
                <p className={cardCopy}>{point.description}</p>
              </article>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

export function IndustriesServed({ locale }: { locale: Locale }) {
  const { servedIndustries } = aboutFor(locale);
  const t = aboutText(locale).industries;
  return (
    <Section className={`${navyGrid} ${brandStripe}`}>
      <Container>
        <SectionHeader
          className="[&_h2]:text-white [&_p:not(:first-child)]:text-white/72"
          eyebrow={t.eyebrow}
          title={t.title}
          copy={t.copy}
        />
        <div className="grid grid-cols-3 gap-[18px] max-[1120px]:grid-cols-2 max-[780px]:grid-cols-1">
          {servedIndustries.map((industry) => {
            const Icon = industry.icon;

            return (
              <Link
                className="flex flex-col rounded-[20px] border border-white/15 bg-white/6 p-[22px] text-inherit transition-[transform,border-color,background-color] duration-200 ease-premium hover:-translate-y-[3px] hover:border-white/40 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-action-orange active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                href={industry.href}
                key={industry.title}
              >
                <span className="inline-grid size-[42px] place-items-center rounded-[14px] bg-white/10 text-action-orange">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <h3 className={`${cardTitle} text-white`}>{industry.title}</h3>
                <p className="leading-[1.66] text-white/70">{industry.description}</p>
                <strong className="mt-auto inline-flex items-center gap-2 pt-3.5 text-[15px] font-extrabold text-action-orange">
                  {t.explore}
                  <ArrowRight size={16} aria-hidden="true" />
                </strong>
              </Link>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

export function ServicePromise({ locale }: { locale: Locale }) {
  const { servicePromiseSteps } = aboutFor(locale);
  const t = aboutText(locale).promise;
  return (
    <Section className={paperGrid}>
      <Container>
        <SectionHeader eyebrow={t.eyebrow} title={t.title} copy={t.copy} />
        <ol className="about-promise__steps m-0 grid list-none grid-cols-6 gap-3 p-0 max-[1120px]:grid-cols-3 max-[780px]:grid-cols-1">
          {servicePromiseSteps.map((step, index) => (
            <li
              key={step}
              className="grid min-h-[220px] content-start gap-3 rounded-[20px] border border-slate-300/80 bg-card p-[18px] shadow-card max-[780px]:min-h-0"
            >
              <span className="text-[0.8rem] font-black text-action-red">{String(index + 1).padStart(2, "0")}</span>
              <CheckCircle2 size={20} aria-hidden="true" className="text-brand-blue" />
              <p className="m-0 text-[0.92rem] leading-[1.55] font-[750] text-slate-700">{step}</p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}

export function AboutFinalCTA({ locale }: { locale: Locale }) {
  const t = aboutText(locale).final;
  return (
    <CTASection
      title={t.title}
      copy={t.copy}
      primaryLabel={t.primary}
      primaryHref="/request-quote"
      secondaryLabel={t.secondary}
      secondaryHref="/contact"
    />
  );
}
