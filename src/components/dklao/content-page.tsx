import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

import { CTASection } from "@/components/dklao/cta-section";
import { FloatingContactActions } from "@/components/dklao/floating-contact-actions";
import { IndustrialFooter } from "@/components/dklao/industrial-footer";
import { SiteHeader } from "@/components/dklao/site-header";
import { visibleSections, type PageContent, type ResolvedSection } from "@/lib/data/pages";
import { getSiteFacts } from "@/lib/cms/site-facts";
import { relatedRoutes } from "@/lib/data/routes";

type ContentPageProps = {
  page: PageContent;
  // Rendered between the hero and the content sections, e.g. a form.
  children?: ReactNode;
};

function SectionBody({ section }: { section: ResolvedSection }) {
  if (section.kind === "cards") {
    return (
      <div className="page-grid">
        {section.items.map((item) => (
          <article className="dk-card page-card" key={item.title}>
            <h3>{item.title}</h3>
            {item.description ? <p>{item.description}</p> : null}
            {item.href ? (
              <Link
                className="service-card__link"
                href={item.href}
                aria-label={`View ${item.title}`}
              >
                View details
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            ) : null}
          </article>
        ))}
      </div>
    );
  }

  if (section.kind === "steps") {
    return (
      <ol className="page-grid page-steps">
        {section.items.map((item) => (
          <li className="dk-card page-card" key={item.title}>
            <h3>{item.title}</h3>
            {item.description ? <p>{item.description}</p> : null}
          </li>
        ))}
      </ol>
    );
  }

  if (section.kind === "table") {
    return (
      <dl className="page-table dk-card">
        {section.items.map((item) => (
          <div key={item.title}>
            <dt>{item.title}</dt>
            <dd>
              {item.description?.startsWith("https://") ? (
                <a href={item.description} target="_blank" rel="noopener noreferrer">
                  {item.description}
                </a>
              ) : (
                item.description
              )}
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <div className="page-faq">
      {section.items.map((item) => (
        <details className="dk-card" key={item.title}>
          <summary>{item.title}</summary>
          <p>{item.description}</p>
        </details>
      ))}
    </div>
  );
}

export async function ContentPage({ page, children }: ContentPageProps) {
  const sections = visibleSections(page, await getSiteFacts());
  const related = relatedRoutes(page.id);

  return (
    <main className="dk-page" id="main-content">
      <SiteHeader />

      <section className="about-hero page-hero">
        <div className="dk-container about-hero__grid">
          <div className="about-hero__content">
            <p className="dk-eyebrow">{page.eyebrow}</p>
            <h1>{page.h1}</h1>
            <p>{page.intro}</p>
            {page.ctas.length > 0 ? (
              <div className="about-hero__actions">
                {page.ctas.map((cta, index) => (
                  <Link
                    key={cta.label}
                    className={`dk-button ${index === 0 ? "dk-button-primary" : "dk-button-secondary"}`}
                    href={cta.href}
                  >
                    {cta.label}
                    {index === 0 ? <ArrowRight size={18} aria-hidden="true" /> : null}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {children ? (
        <section className="dk-section-tight">
          <div className="dk-container page-form-wrap">{children}</div>
        </section>
      ) : null}

      {sections.map((section) => (
        <section className="dk-section-tight" key={section.title}>
          <div className="dk-container">
            <div className="dk-section-header">
              <h2 className="dk-section-title">{section.title}</h2>
              {section.intro ? <p className="dk-section-copy">{section.intro}</p> : null}
            </div>
            <SectionBody section={section} />
          </div>
        </section>
      ))}

      {related.length >= 2 ? (
        <section className="dk-section-tight">
          <div className="dk-container">
            <div className="dk-section-header">
              <h2 className="dk-section-title">Related solutions</h2>
            </div>
            <div className="page-grid">
              {related.map((route) => (
                <article className="dk-card page-card" key={route.id}>
                  <h3>{route.label}</h3>
                  <p>{route.blurb}</p>
                  <Link
                    className="service-card__link"
                    href={route.href}
                    aria-label={`View ${route.label}`}
                  >
                    View details
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
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

      <IndustrialFooter />
      <FloatingContactActions />
    </main>
  );
}
