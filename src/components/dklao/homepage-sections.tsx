import Image from "next/image";
import Link from "@/components/i18n/link";
import {
  ArrowRight,
  ClipboardCheck,
  Gauge,
  Warehouse,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container, Eyebrow, Section, SectionCopy, SectionHeader, SectionTitle } from "@/components/ui/section";
import { homepageFor } from "@/lib/data/homepage";
import type { Locale } from "@/lib/i18n";
import { getMessages } from "@/messages";
import { AnatomyDiagram } from "./anatomy-diagram";
import { CTASection } from "./cta-section";
import { QuoteRequestForm } from "./quote-request-form";
import { ServiceCard } from "./service-card";

// Faint blueprint grid on white, shared by the rental and knowledge sections.
const paperGrid =
  "bg-[linear-gradient(rgba(7,17,31,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(7,17,31,0.04)_1px,transparent_1px)] bg-[size:42px_42px] bg-white";
const cardGrid = "grid grid-cols-4 gap-[18px] max-[1120px]:grid-cols-2 max-[780px]:grid-cols-1";
const tile = "rounded-[22px] border border-slate-300/80 bg-card shadow-card";

export function SolutionOverview({ locale }: { locale: Locale }) {
  const { solutionCards } = homepageFor(locale);
  const t = getMessages(locale).home.solutions;
  return (
    <Section id="solutions">
      <Container>
        <SectionHeader eyebrow={t.eyebrow} title={t.title} copy={t.copy} />
        <div className={cardGrid}>
          {solutionCards.map((card) => (
            <ServiceCard key={card.title} item={card} />
          ))}
        </div>
      </Container>
    </Section>
  );
}

// Same order as home.rental.facts in the messages: capacity, site, period.
const rentalIcons = [Gauge, Warehouse, ClipboardCheck];

export function RentalHighlight({ locale }: { locale: Locale }) {
  const t = getMessages(locale).home.rental;
  return (
    <section className={`py-[84px] ${paperGrid}`}>
      <Container className="grid grid-cols-[minmax(0,0.9fr)_minmax(360px,0.6fr)] items-center gap-12 max-[1120px]:grid-cols-1">
        <div>
          <Eyebrow>{t.eyebrow}</Eyebrow>
          <SectionTitle className="mt-4 leading-[1.06] max-[780px]:text-[2rem]">{t.title}</SectionTitle>
          <p className="mt-4 mb-0 leading-[1.75] text-slate-700">{t.copy}</p>
          <div className="mt-[26px] flex flex-wrap gap-3.5 max-[780px]:grid">
            <Button asChild variant="primary">
              <Link href="/forklift-rental">
                {t.askPrice}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="light">
              <Link href="#quote-request">{t.requestQuote}</Link>
            </Button>
          </div>
        </div>
        <div className="rental-highlight__panel grid gap-3.5 max-[1120px]:max-w-[680px]">
          {t.facts.map(({ label, value }, index) => {
            const Icon = rentalIcons[index];
            return (
            <div key={label} className={`${tile} grid grid-cols-[auto_1fr] items-center gap-x-3.5 gap-y-1.5 p-[22px]`}>
              <Icon size={28} aria-hidden="true" className="row-span-2 text-action-red" />
              <span className="text-[0.88rem] font-extrabold text-slate-500">{label}</span>
              <strong className="text-[1.2rem] text-navy-950">{value}</strong>
            </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

export function ForkliftAnatomyInteractive({ locale }: { locale: Locale }) {
  const t = getMessages(locale).home.anatomy;
  return (
    <Section className="bg-[linear-gradient(rgba(0,97,175,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(0,97,175,0.08)_1px,transparent_1px),linear-gradient(135deg,#ffffff,#eef4fa)] bg-[size:44px_44px,44px_44px,cover]">
      <Container className="grid grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] items-center gap-12 max-[1024px]:grid-cols-1 max-[1024px]:gap-7">
        <div className="grid max-w-[420px] gap-4 max-[1024px]:max-w-[640px]">
          <Eyebrow>{t.eyebrow}</Eyebrow>
          <SectionTitle>{t.title}</SectionTitle>
          <SectionCopy>{t.copy}</SectionCopy>
        </div>
        <AnatomyDiagram alt={t.imageAlt} />
      </Container>
    </Section>
  );
}

export function IndustriesAndTrustSection({ locale }: { locale: Locale }) {
  const { industrySolutions } = homepageFor(locale);
  const t = getMessages(locale).home.industries;
  return (
    <Section>
      <Container>
        <SectionHeader eyebrow={t.eyebrow} title={t.title} copy={t.copy} />
        <div className={cardGrid}>
          {industrySolutions.map((industry) => (
            <ServiceCard key={industry.title} item={industry} />
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function KnowledgeCenterPreview({ locale }: { locale: Locale }) {
  const { knowledgeArticles } = homepageFor(locale);
  const t = getMessages(locale).home.knowledge;
  return (
    <Section spacing="tight" className={paperGrid}>
      <Container className="grid grid-cols-[minmax(0,0.8fr)_minmax(360px,1fr)] items-start gap-12 max-[1120px]:grid-cols-1">
        <div>
          <Eyebrow>{t.eyebrow}</Eyebrow>
          <SectionTitle className="mt-4 text-[2.3rem] leading-[1.08] max-[780px]:text-[2rem]">{t.title}</SectionTitle>
          <p className="mt-4 mb-0 leading-[1.7] text-slate-700">{t.copy}</p>
        </div>
        <div className="grid gap-3">
          {knowledgeArticles.map((article) => (
            <Link
              key={article.title}
              href={article.href}
              className={`${tile} group grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5 rounded-[18px] px-5 py-[18px] transition-[transform,border-color] duration-150 ease-premium hover:-translate-y-0.5 hover:border-brand-blue/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0`}
            >
              <span className="text-[0.8rem] font-[850] text-action-red uppercase">{article.category}</span>
              <strong className="text-[1.05rem] text-navy-950">{article.title}</strong>
              <ArrowRight size={16} aria-hidden="true" className="col-start-2 row-span-2 row-start-1 text-brand-blue" />
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function QuoteSection({ locale }: { locale: Locale }) {
  const messages = getMessages(locale);
  const t = messages.home.quote;
  return (
    <Section className="bg-[linear-gradient(135deg,var(--dk-color-surface),var(--dk-color-neutral-white))]">
      <Container className="grid grid-cols-[minmax(0,0.7fr)_minmax(420px,0.9fr)] items-start gap-12 max-[1120px]:grid-cols-1 max-[780px]:gap-7">
        <div>
          <Eyebrow>{t.eyebrow}</Eyebrow>
          <SectionTitle className="mt-4">{t.title}</SectionTitle>
          <SectionCopy className="mt-4">{t.copy}</SectionCopy>
          <div className={`quote-section__asset ${tile} mt-8 inline-flex items-center gap-4 p-4 font-extrabold text-slate-700`}>
            <Image
              src="/images/logo/Logo-V_Text.svg"
              width={84}
              height={61}
              alt={t.logoAlt}
            />
            <span>{t.pricing}</span>
          </div>
        </div>
        <QuoteRequestForm showHeader={false} labels={messages.quoteForm} />
      </Container>
    </Section>
  );
}

export function FinalHomepageCTA({ locale }: { locale: Locale }) {
  const t = getMessages(locale).home.final;
  return (
    <CTASection
      title={t.title}
      copy={t.copy}
      primaryLabel={t.primary}
      primaryHref="#quote-request"
      secondaryLabel={t.secondary}
      secondaryHref="/contact"
    />
  );
}
