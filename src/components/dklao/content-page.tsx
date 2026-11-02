import Image from "next/image";
import Link from "@/components/i18n/link";
import { Fragment, type ReactNode } from "react";
import { ArrowDown, ArrowRight, CheckCircle2 } from "lucide-react";

import { CleaningRequestForm } from "@/components/dklao/cleaning-request-form";
import { CTASection } from "@/components/dklao/cta-section";
import { FloatingContactActions } from "@/components/dklao/floating-contact-actions";
import { IndustrialFooter } from "@/components/dklao/industrial-footer";
import { SiteHeader } from "@/components/dklao/site-header";
import { TrustedBy } from "@/components/dklao/trusted-by";
import { QuoteRequestForm } from "@/components/dklao/quote-request-form";
import { PartsRequestForm } from "@/components/dklao/parts-request-form";
import { RentalInquiryForm } from "@/components/dklao/rental-inquiry-form";
import { SalesInquiryForm } from "@/components/dklao/sales-inquiry-form";
import { ServiceBookingForm } from "@/components/dklao/service-booking-form";
import { WarehouseInquiryForm } from "@/components/dklao/warehouse-inquiry-form";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container, Eyebrow, Section, SectionHeader } from "@/components/ui/section";
import {
  contactPage,
  forkliftRentalPage,
  relatedToShow,
  requestQuotePage,
  visibleSections,
  withPhotoTitles,
  type ItemDetails,
  type PageContent,
  type ResolvedSection,
} from "@/lib/data/pages";
import { sitemapPages } from "@/lib/data/sitemap-pages";
import { getSiteFacts } from "@/lib/cms/site-facts";
import { jsonLd } from "@/lib/data/json-ld";
import { breadcrumbTrail, getRoute, quoteHref, routeIntent } from "@/lib/data/routes";
import { leadIntents } from "@/lib/leads/intents";
import { isOwnPhoto, libraryImage, topicForCard, topicForPage, type LibraryTopic } from "@/lib/data/library";
import { cn } from "@/lib/utils";
import { localizeHref, type Locale } from "@/lib/i18n";
import { getMessages, type Messages } from "@/messages";
import { fill } from "@/messages/app-en";

type Labels = Messages["contentPage"];

const siteUrl = process.env.APP_URL ?? "https://www.dklao.com";

type ContentPageProps = {
  page: PageContent;
  locale: Locale;
  // Rendered between the hero and the content sections, e.g. a form.
  children?: ReactNode;
  // Show the reference clients (from the site facts) after the content sections.
  showClients?: boolean;
};

// Responsive grid shared by cards and steps: as many 240px columns as fit.
const gridClass = "page-grid m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-[18px] p-0";
const cardClass =
  "page-card relative grid content-start gap-2.5 p-6 transition-[transform,box-shadow] duration-[260ms] ease-premium hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(11,27,51,0.14)] motion-reduce:hover:translate-y-0";
const cardTitleClass = "m-0 text-[1.15rem] font-[750] leading-[1.2] text-navy-950";
const cardCopyClass = "m-0 leading-[1.65] text-slate-700";
const linkClass =
  "service-card__link mt-auto inline-flex min-h-6 items-center max-[760px]:min-h-10 gap-2 text-[15px] font-[850] text-brand-blue active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue";

// Card photo from the shared library. Decorative: the card heading already names the subject.
// Photos show in their original colour. On hover (or keyboard focus inside the card) a DK LAO blue layer
// fades in with the "color" blend, so the photo keeps its light and shade but turns brand blue; opacity is
// what animates, because blend modes cannot. Stock photos also carry the brand stripe along the bottom, so
// they read as illustrations rather than DK LAO's own scenes.
function CardMedia({ topic }: { topic?: LibraryTopic }) {
  if (!topic) return null;
  const stock = !isOwnPhoto(topic);

  return (
    <div className="page-card__media relative isolate -mx-6 -mt-6 mb-1.5 aspect-[16/10] overflow-hidden bg-navy-900">
      <Image
        src={libraryImage(topic)}
        alt=""
        fill
        sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 380px"
        className="object-cover saturate-[0.9] transition-transform duration-[260ms] ease-premium group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-brand-blue opacity-0 mix-blend-color transition-opacity duration-[260ms] ease-premium group-focus-within:opacity-100 group-hover:opacity-100 motion-reduce:transition-none"
      />
      {stock ? (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-1 bg-[linear-gradient(90deg,var(--dk-color-brand-blue),var(--dk-color-action-red),var(--dk-color-action-orange))]"
        />
      ) : null}
    </div>
  );
}

function LinkCard({
  title,
  description,
  href,
  topic,
  anchor,
  t,
}: {
  title: string;
  description?: string;
  href?: string;
  topic?: LibraryTopic;
  anchor?: string;
  t: Labels;
}) {
  return (
    <Card className={cn(cardClass, "page-card--media group overflow-hidden")}>
      <CardMedia topic={topic} />
      <h3 className={cardTitleClass}>{title}</h3>
      {description ? <p className={cardCopyClass}>{description}</p> : null}
      {href && anchor ? (
        // A card with its own section and its own page offers both.
        <div className="mt-auto flex flex-wrap gap-x-5 gap-y-1">
          <a className={cn(linkClass, "mt-0")} href={`#${anchor}`} aria-label={fill(t.readMoreAbout, { title })}>
            {t.readMore}
            <ArrowDown size={16} aria-hidden="true" />
          </a>
          <Link className={cn(linkClass, "mt-0")} href={href} aria-label={fill(t.viewPageOf, { title })}>
            {t.viewPage}
            <ArrowRight size={16} aria-hidden="true" className="transition-transform duration-[260ms] group-hover:translate-x-1 motion-reduce:transition-none" />
          </Link>
        </div>
      ) : href ? (
        <Link className={linkClass} href={href} aria-label={fill(t.viewOf, { title })}>
          {t.viewDetails}
          <ArrowRight size={16} aria-hidden="true" className="transition-transform duration-[260ms] group-hover:translate-x-1 motion-reduce:transition-none" />
        </Link>
      ) : anchor ? (
        <a className={linkClass} href={`#${anchor}`} aria-label={fill(t.readMoreAbout, { title })}>
          {t.readMore}
          <ArrowDown size={16} aria-hidden="true" className="transition-transform duration-[260ms] group-hover:translate-y-0.5 motion-reduce:transition-none" />
        </a>
      ) : null}
    </Card>
  );
}

type DetailItem = ResolvedSection["items"][number] & { details: ItemDetails; anchor: string };

// A card's own editorial section under the cards. Left (stays in view on desktop): photo, title, opening
// paragraph, key figures and a quote action. Right: topics under their own headings, then a practical
// checklist. Alternating bands keep consecutive sections apart.
function CardDetail({ item, pageId, shaded, locale, t }: { item: DetailItem; pageId: string; shaded: boolean; locale: Locale; t: Labels }) {
  const topic = topicForCard(item, pageId);
  const { lead, facts = [], topics, checklist } = item.details;

  return (
    <Section spacing="tight" id={item.anchor} className={cn("page-detail scroll-mt-[96px]", shaded && "bg-surface")}>
      <Container className="grid grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-start gap-14 max-[900px]:grid-cols-1 max-[900px]:gap-8">
        <div className="grid gap-5 min-[901px]:sticky min-[901px]:top-[110px]">
          {topic ? (
            <div className="relative aspect-[16/10] overflow-hidden rounded-card bg-navy-900 shadow-card">
              <Image src={libraryImage(topic)} alt="" fill sizes="(max-width: 900px) 100vw, 460px" className="object-cover saturate-[0.9]" />
              {!isOwnPhoto(topic) ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-1 bg-[linear-gradient(90deg,var(--dk-color-brand-blue),var(--dk-color-action-red),var(--dk-color-action-orange))]"
                />
              ) : null}
            </div>
          ) : null}
          <h2 className="m-0 text-[2rem] font-[850] leading-[1.1] tracking-[-0.02em] text-balance text-navy-950 max-[760px]:text-[1.6rem]">
            {item.title}
          </h2>
          <p className="m-0 text-lg leading-[1.65] text-slate-700 max-[760px]:text-[17px]">{lead}</p>
          {facts.length > 0 ? (
            <dl className="m-0 grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-3">
              {facts.map((fact) => (
                <div key={fact.label} className="flex flex-col-reverse gap-1.5 rounded-card border border-slate-300/70 bg-white px-3.5 py-3.5">
                  <dt className="text-[13px] leading-snug text-slate-700">{fact.label}</dt>
                  <dd className="m-0 text-[1.2rem] font-[850] leading-none tracking-[-0.01em] whitespace-nowrap text-brand-blue">{fact.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="primary">
              <Link href={quoteHref(routeIntent(pageId), getRoute(pageId)?.href)}>
                {t.requestQuote}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </Button>
            {item.href ? (
              <Button asChild variant="light">
                <Link href={item.href}>
                  {fill(t.pageLink, { label: (item.routeId && getRoute(item.routeId, locale)?.label) || item.title })}
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
        <div className="grid gap-8">
          {topics.map((entry) => (
            <article key={entry.heading} className="grid gap-2.5 border-l-[3px] border-action-orange pl-5">
              <h3 className="m-0 text-[1.3rem] font-[800] leading-[1.25] text-navy-950">{entry.heading}</h3>
              <p className="m-0 text-[17px] leading-[1.75] text-slate-700 max-[760px]:text-base">{entry.body}</p>
            </article>
          ))}
          {checklist && checklist.items.length > 0 ? (
            <Card className="grid gap-4 p-6">
              <h3 className="m-0 text-[1.1rem] font-[800] leading-[1.3] text-navy-950">{checklist.heading}</h3>
              <ul className="m-0 grid list-none grid-cols-2 gap-x-6 gap-y-3 p-0 max-[640px]:grid-cols-1">
                {checklist.items.map((point) => (
                  <li key={point} className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-2.5 leading-[1.5] text-slate-700">
                    <CheckCircle2 size={20} aria-hidden="true" className="mt-0.5 text-brand-blue" />
                    {point}
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}

function SectionBody({ section, pageId, t, messages }: { section: ResolvedSection; pageId: string; t: Labels; messages: Messages }) {
  const form = messages.quoteForm;
  if (section.kind === "list") {
    // On the page surface, not in a box: a short title over its explanation, marked by an orange square.
    return (
      <ul className="page-list m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-x-10 gap-y-7 p-0">
        {section.items.map((item) => (
          <li
            key={item.title}
            className="relative grid gap-1 pl-[22px] before:absolute before:top-2 before:left-0 before:size-2 before:rounded-[2px] before:bg-action-orange before:content-['']"
          >
            <strong className="text-[17px] font-[750] leading-[1.3] text-navy-950">{item.title}</strong>
            {item.description ? <span className="text-base leading-[1.6] text-slate-700"> {item.description}</span> : null}
          </li>
        ))}
      </ul>
    );
  }

  if (section.kind === "chips") {
    return (
      <ul className="page-chips m-0 flex list-none flex-wrap gap-2.5 p-0">
        {section.items.map((item) => (
          <li key={item.title}>
            <Badge className="border-slate-300 font-extrabold">{item.title}</Badge>
          </li>
        ))}
      </ul>
    );
  }

  if (section.kind === "stats") {
    return (
      <dl className="page-stats m-0 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[18px]">
        {section.items.map((item) => (
          <Card className="flex flex-col-reverse gap-1.5 px-6 py-[22px]" key={item.title}>
            <dd className="m-0 text-[1.6rem] font-[850] leading-[1.15] text-brand-blue">{item.description}</dd>
            <dt className="font-[750] text-slate-700">{item.title}</dt>
          </Card>
        ))}
      </dl>
    );
  }

  if (section.kind === "text") {
    return (
      <Card className="page-text grid gap-3.5 p-6 leading-[1.7] text-slate-700">
        {section.body ? <p className="m-0">{section.body}</p> : null}
        {section.items.length > 0 ? (
          <ul className="m-0 grid gap-2 pl-5">
            {section.items.map((item) => (
              <li key={item.title}>
                <strong>{item.title}</strong>
                {item.description ? <span>: {item.description}</span> : null}
              </li>
            ))}
          </ul>
        ) : null}
      </Card>
    );
  }

  if (section.kind === "form") {
    // The maintenance and spare parts pages use their own forms (ported from feature/services-all-products).
    if (pageId === "maintenance") {
      return (
        <div className="max-w-[820px]">
          <ServiceBookingForm labels={messages.serviceForm} contact={messages.contactForm} shared={form} photos={messages.photoUpload} />
        </div>
      );
    }
    if (pageId === "parts") {
      return (
        <div className="max-w-[820px]">
          <PartsRequestForm labels={messages.partsForm} service={messages.serviceForm} contact={messages.contactForm} shared={form} photos={messages.photoUpload} />
        </div>
      );
    }
    if (pageId === "warehouse") {
      return (
        <div className="max-w-[820px]">
          <WarehouseInquiryForm labels={messages.warehouseForm} service={messages.serviceForm} contact={messages.contactForm} shared={form} photos={messages.photoUpload} />
        </div>
      );
    }
    if (pageId === "sales") {
      return (
        <div className="max-w-[820px]">
          <SalesInquiryForm labels={messages.salesForm} service={messages.serviceForm} contact={messages.contactForm} shared={form} />
        </div>
      );
    }
    if (pageId === "rental") {
      return (
        <div className="max-w-[820px]">
          <RentalInquiryForm labels={messages.rentalForm} sales={messages.salesForm} service={messages.serviceForm} contact={messages.contactForm} shared={form} />
        </div>
      );
    }
    if (pageId === "cleaning") {
      return (
        <div className="max-w-[820px]">
          <CleaningRequestForm labels={messages.cleaningForm} service={messages.serviceForm} contact={messages.contactForm} shared={form} />
        </div>
      );
    }
    const intent = leadIntents[routeIntent(pageId) ?? "general"];
    return (
      <div className="max-w-[820px]">
        <QuoteRequestForm defaultCategory={intent.category} sourcePage={getRoute(pageId)?.href} showHeader={false} labels={form} />
      </div>
    );
  }

  if (section.kind === "cards") {
    return (
      <div className={gridClass}>
        {section.items.map((item) => (
          <LinkCard
            key={item.title}
            title={item.title}
            description={item.description}
            href={item.href}
            anchor={item.anchor}
            topic={topicForCard(item, pageId)}
            t={t}
          />
        ))}
      </div>
    );
  }

  if (section.kind === "steps") {
    return (
      <ol className={cn(gridClass, "page-steps")}>
        {section.items.map((item, index) => (
          <li key={item.title}>
            <Card className={cn(cardClass, "h-full")}>
              <Eyebrow className="mb-3 text-[13px]">{fill(t.step, { n: index + 1 })}</Eyebrow>
              <h3 className={cardTitleClass}>{item.title}</h3>
              {item.description ? <p className={cardCopyClass}>{item.description}</p> : null}
            </Card>
          </li>
        ))}
      </ol>
    );
  }

  if (section.kind === "table") {
    return (
      <Card className="page-table grid px-6 py-2">
        <dl className="m-0 grid">
          {section.items.map((item) => (
            <div
              key={item.title}
              className="grid grid-cols-[minmax(140px,0.35fr)_minmax(0,1fr)] gap-4 border-b border-slate-100 py-3.5 last:border-b-0 max-[560px]:grid-cols-1 max-[560px]:gap-1"
            >
              <dt className="font-[850] text-navy-900">{item.title}</dt>
              <dd className="m-0 leading-[1.6] [overflow-wrap:anywhere] text-slate-700">
                {item.description?.startsWith("https://") ? (
                  <a
                    href={item.description}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-6 items-center text-brand-blue hover:underline max-[760px]:min-h-10"
                  >
                    {item.description.replace(/^https:\/\/(www\.)?/, "")}
                  </a>
                ) : (
                  item.description
                )}
              </dd>
            </div>
          ))}
        </dl>
      </Card>
    );
  }

  // FAQ: a Radix accordion, so arrow keys move between questions and the open state is announced.
  return (
    <Accordion type="multiple" className="page-faq grid max-w-[820px] gap-3">
      {section.items.map((item) => (
        <AccordionItem value={item.title} key={item.title}>
          <AccordionTrigger>{item.title}</AccordionTrigger>
          <AccordionContent>{item.description}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

// The built-in English pages, by id: a Lao page (built in or from the CMS) takes its card photos from these.
const englishPages: Record<string, PageContent> = {
  ...sitemapPages,
  ...Object.fromEntries([forkliftRentalPage, requestQuotePage, contactPage].map((english) => [english.id, english])),
};

export async function ContentPage({ page, locale, children, showClients = false }: ContentPageProps) {
  const pageWithPhotos = locale === "en" ? page : withPhotoTitles(page, englishPages[page.id]);
  const sections = visibleSections(pageWithPhotos, await getSiteFacts(locale));
  const trail = breadcrumbTrail(page.id, locale);
  const related = relatedToShow(page.id, sections, locale);
  const messages = getMessages(locale);
  const t = messages.contentPage;
  const heroTopic = topicForPage(page.id);
  const questions = sections
    .filter((section) => section.kind === "faq")
    .flatMap((section) => section.items.filter((item) => item.description));
  const structuredData = [
    trail.length > 1
      ? {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: trail.map((route, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: route.label,
            item: `${siteUrl}${localizeHref(route.href, locale)}`,
          })),
        }
      : null,
    questions.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: questions.map((item) => ({
            "@type": "Question",
            name: item.title,
            acceptedAnswer: { "@type": "Answer", text: item.description },
          })),
        }
      : null,
  ].filter(Boolean);

  return (
    <div className="min-h-screen overflow-x-clip">
      <SiteHeader locale={locale} />
      <main id="main-content" tabIndex={-1} className="scroll-mt-[90px] focus:outline-none">

      {trail.length > 2 ? (
        <nav className="page-breadcrumb border-b border-slate-100 bg-surface" aria-label={t.breadcrumb}>
          <Container asChild>
            <ol className="flex list-none flex-wrap items-center gap-y-1 py-3 text-[15px]">
              {trail.map((route, index) => (
                <li key={route.id} className="[&+&]:before:mx-2.5 [&+&]:before:text-slate-300 [&+&]:before:content-['/']">
                  {index < trail.length - 1 ? (
                    <Link href={route.href} className="inline-flex min-h-6 items-center font-[750] text-brand-blue hover:underline max-[760px]:min-h-10">
                      {route.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="font-[850] text-navy-900">
                      {route.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </Container>
        </nav>
      ) : null}

      {structuredData.length > 0 ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />
      ) : null}

      {/* Hero: the topic photo under a navy shade (solid behind the text, open on the right), the grid
          texture, and the brand stripe along the bottom edge. */}
      <section
        className={cn(
          "page-hero relative overflow-hidden bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px),radial-gradient(circle_at_78%_24%,rgba(0,97,175,0.36),transparent_30%),radial-gradient(circle_at_88%_86%,rgba(217,26,33,0.22),transparent_30%),linear-gradient(135deg,var(--dk-color-navy-950),var(--dk-color-navy-800))] bg-[length:48px_48px,48px_48px,cover,cover,cover] pt-[74px] pb-[82px] text-white max-[780px]:pt-[46px] max-[780px]:pb-14",
          "after:absolute after:inset-x-0 after:bottom-0 after:z-[3] after:h-[5px] after:bg-[linear-gradient(90deg,var(--dk-color-brand-blue),var(--dk-color-action-red),var(--dk-color-action-orange))] after:content-['']",
          heroTopic &&
            "page-hero--photo before:absolute before:inset-0 before:z-[1] before:bg-[linear-gradient(90deg,rgba(7,17,31,0.95)_0%,rgba(7,17,31,0.84)_46%,rgba(7,17,31,0.42)_100%),linear-gradient(0deg,rgba(7,17,31,0.55),transparent_45%)] before:content-[''] max-[640px]:before:bg-[linear-gradient(180deg,rgba(7,17,31,0.78)_0%,rgba(7,17,31,0.92)_100%)]",
        )}
      >
        {heroTopic ? (
          <div className="page-hero__photo absolute inset-0 z-0" aria-hidden="true">
            <Image src={libraryImage(heroTopic)} alt="" fill priority sizes="100vw" className="object-cover object-[center_55%] saturate-[0.85]" />
          </div>
        ) : null}
        <Container className="relative z-[2]">
          <div className="grid gap-[18px] max-[780px]:gap-3.5">
            <Eyebrow>{page.eyebrow}</Eyebrow>
            <h1 className="m-0 max-w-[760px] text-[3.2rem] font-black leading-[1.02] tracking-[-0.03em] text-balance max-[780px]:text-[clamp(2.1rem,9.2vw,2.55rem)] max-[560px]:text-[clamp(1.6rem,7.3vw,1.95rem)] max-[560px]:leading-[1.12] max-[560px]:tracking-[-0.025em]">
              {page.h1}
            </h1>
            <p className="m-0 max-w-[680px] text-[17px] leading-[1.7] text-white/80 max-[780px]:text-[15px] max-[780px]:leading-[1.58]">
              {page.intro}
            </p>
            {page.ctas.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-3 max-[780px]:grid">
                {page.ctas.map((cta, index) => (
                  <Button key={cta.label} asChild variant={index === 0 ? "primary" : "secondary"}>
                    <Link href={cta.href}>
                      {cta.label}
                      {index === 0 ? <ArrowRight size={18} aria-hidden="true" /> : null}
                    </Link>
                  </Button>
                ))}
              </div>
            ) : null}
          </div>
        </Container>
      </section>

      {children ? (
        <Section spacing="tight">
          <Container>
            <div className="max-w-[820px]">{children}</div>
          </Container>
        </Section>
      ) : null}

      {sections.map((section) => (
        <Fragment key={section.title}>
          <Section spacing="tight">
            <Container>
              <SectionHeader title={section.title} copy={section.intro} />
              <SectionBody section={section} pageId={page.id} t={t} messages={messages} />
            </Container>
          </Section>
          {section.items
            .filter((item): item is DetailItem => Boolean(item.details && item.anchor))
            .map((item, index) => (
              <CardDetail key={item.anchor} item={item} pageId={page.id} shaded={index % 2 === 0} locale={locale} t={t} />
            ))}
        </Fragment>
      ))}

      {showClients ? <TrustedBy title={messages.trustedBy.short} locale={locale} /> : null}

      {related.length >= 2 ? (
        <Section spacing="tight">
          <Container>
            <SectionHeader title={t.related} />
            <div className={gridClass}>
              {related.map((route) => (
                <LinkCard
                  key={route.id}
                  title={route.label}
                  description={route.blurb}
                  href={route.href}
                  topic={topicForCard({ title: route.label, routeId: route.id }, page.id)}
                  t={t}
                />
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      {page.closing ? (
        <CTASection
          title={page.closing.title}
          copy={page.closing.copy}
          primaryLabel={page.closing.primary.label}
          primaryHref={page.closing.primary.href}
          secondaryLabel={page.closing.secondary?.label}
          secondaryHref={page.closing.secondary?.href}
        />
      ) : null}

      </main>
      <IndustrialFooter locale={locale} />
      <FloatingContactActions />
    </div>
  );
}
