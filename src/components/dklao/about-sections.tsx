import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardCheck } from "lucide-react";

import {
  aboutHeroBadges,
  aboutHeroCtas,
  aboutSolutions,
  aboutTrustPoints,
  companySnapshot,
  servedIndustries,
  servicePromiseSteps,
} from "@/lib/data/about";
import { CTASection } from "./cta-section";

function buttonClass(variant: "primary" | "secondary" | "light") {
  if (variant === "primary") {
    return "dk-button dk-button-primary";
  }

  if (variant === "secondary") {
    return "dk-button dk-button-secondary";
  }

  return "dk-button dk-button-light";
}

export function AboutHero() {
  return (
    <section className="about-hero">
      <div className="dk-container about-hero__grid">
        <div className="about-hero__content">
          <p className="dk-eyebrow">About DK LAO</p>
          <h1>Your One-Stop Industrial Equipment Partner in Laos</h1>
          <p>
            DK LAO provides sales, rental, spare parts, maintenance services,
            warehouse solutions, and professional cleaning equipment for businesses
            that need reliable operational support.
          </p>
          <div className="about-hero__actions">
            {aboutHeroCtas.map((cta) => (
              <Link key={cta.label} className={buttonClass(cta.variant)} href={cta.href}>
                {cta.label}
                {cta.variant === "primary" ? <ArrowRight size={18} aria-hidden="true" /> : null}
              </Link>
            ))}
          </div>
          <div className="about-hero__badges" aria-label="DK LAO trust signals">
            {aboutHeroBadges.map((badge) => (
              <span key={badge}>{badge}</span>
            ))}
          </div>
        </div>
        <div className="about-hero__visual" aria-label="DK LAO forklift and warehouse support">
          <Image
            src="/images/hero/forklift-product-hero.png"
            width={1672}
            height={941}
            alt="Forklift prepared for DK LAO industrial equipment support"
            priority
          />
        </div>
      </div>
    </section>
  );
}

export function CompanySnapshot() {
  return (
    <section className="dk-section about-snapshot" aria-labelledby="company-snapshot-title">
      <div className="dk-container">
        <div className="dk-section-header">
          <p className="dk-eyebrow">Company snapshot</p>
          <h2 id="company-snapshot-title" className="dk-section-title">
            Established support for lifting, moving, storing, cleaning, and servicing
          </h2>
          <p className="dk-section-copy">
            DK LAO is organized around practical business needs: equipment supply,
            rental flexibility, maintenance support, parts availability, warehouse
            productivity, and professional facility cleaning.
          </p>
        </div>
        <div className="about-snapshot__grid">
          {companySnapshot.map((metric) => (
            <article key={metric.label} className="dk-card about-snapshot__card">
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <p>{metric.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AboutStory() {
  return (
    <section className="dk-section about-story">
      <div className="dk-container about-story__grid">
        <div>
          <p className="dk-eyebrow">Our story</p>
          <h2 className="dk-section-title">
            A service-driven industrial equipment company for business operations
          </h2>
          <p className="dk-section-copy">
            DK LAO is focused on material handling, warehouse operations, forklift
            solutions, spare parts, after-sales service, rental, and professional
            cleaning equipment.
          </p>
          <p>
            Since 2010, DK LAO has supported businesses that need practical solutions
            for lifting, moving, stacking, storing, cleaning, and operating more
            efficiently. The role is not only to supply equipment, but to help
            customers improve productivity, reduce downtime, manage operational cost,
            and keep their business moving.
          </p>
          <p>
            DK LAO serves logistics, warehousing, manufacturing, construction, retail,
            distribution, hospitality, food and beverage, industrial facilities, and
            institutional operations.
          </p>
        </div>
        <div className="about-story__collage" aria-label="DK LAO service areas">
          <Image
            src="/images/hero/forklift-product-hero.png"
            width={1672}
            height={941}
            alt="Forklift and material handling equipment"
          />
          <Image
            src="/images/anatomy/forklift-equipment-matching-reference.png"
            width={1680}
            height={944}
            alt="Forklift parts and service reference"
          />
          <div>
            <ClipboardCheck size={28} aria-hidden="true" />
            <span>Sales, rental, service, parts, warehouse, and cleaning support</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function VisionCommitment() {
  return (
    <section className="dk-section about-vision">
      <div className="dk-container about-vision__grid">
        <article className="about-vision__card about-vision__card--blue">
          <p className="dk-eyebrow">Our vision</p>
          <h2>Practical solutions for warehouse and material handling productivity</h2>
          <p>
            DK LAO aims to become a long-term industrial equipment partner for
            businesses in Laos by delivering reliable products, professional service,
            and operational support that helps customers work safer, faster, and more
            efficiently.
          </p>
        </article>
        <article className="about-vision__card about-vision__card--action">
          <p className="dk-eyebrow">Our commitment</p>
          <h2>The right equipment, supported by the right service</h2>
          <p>
            DK LAO helps customers choose equipment and service solutions for real
            business needs through reliable supply, technical recommendation,
            responsive after-sales service, maintenance support, flexible rental
            options, and professional cleaning equipment.
          </p>
        </article>
      </div>
    </section>
  );
}

export function AboutWhatWeDo() {
  return (
    <section className="dk-section about-work" id="about-solutions">
      <div className="dk-container">
        <div className="dk-section-header">
          <p className="dk-eyebrow">What we do</p>
          <h2 className="dk-section-title">Six connected solution paths for DK LAO customers</h2>
          <p className="dk-section-copy">
            Each solution path is ready to guide visitors toward quotation, rental
            request, service booking, spare-parts inquiry, product discovery, or site
            survey follow-up.
          </p>
        </div>
        <div className="about-card-grid">
          {aboutSolutions.map((solution) => {
            const Icon = solution.icon;

            return (
              <article className="dk-card about-solution-card" key={solution.title}>
                <span className="dk-icon-badge">
                  <Icon size={24} aria-hidden="true" />
                </span>
                <h3>{solution.title}</h3>
                <p>{solution.description}</p>
                {solution.href && solution.ctaLabel ? (
                  <Link href={solution.href}>
                    {solution.ctaLabel}
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function WhyChooseDKLAO() {
  return (
    <section className="dk-section about-choose">
      <div className="dk-container">
        <div className="dk-section-header">
          <p className="dk-eyebrow">Why businesses choose DK LAO</p>
          <h2 className="dk-section-title">Operational support beyond equipment supply</h2>
          <p className="dk-section-copy">
            DK LAO helps customers move from requirement to quotation, delivery,
            service, and long-term support.
          </p>
        </div>
        <div className="about-trust-grid">
          {aboutTrustPoints.map((point) => {
            const Icon = point.icon;

            return (
              <article key={point.title}>
                <Icon size={22} aria-hidden="true" />
                <h3>{point.title}</h3>
                <p>{point.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function IndustriesServed() {
  return (
    <section className="dk-section about-industries">
      <div className="dk-container">
        <div className="dk-section-header">
          <p className="dk-eyebrow">Industries we serve</p>
          <h2 className="dk-section-title">Equipment support for different operating environments</h2>
          <p className="dk-section-copy">
            Each industry has different workload, site, safety, and budget
            requirements. DK LAO structures inquiries around those operating details.
          </p>
        </div>
        <div className="about-industry-grid">
          {servedIndustries.map((industry) => {
            const Icon = industry.icon;

            return (
              <article key={industry.title}>
                <span>
                  <Icon size={20} aria-hidden="true" />
                </span>
                <h3>{industry.title}</h3>
                <p>{industry.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function ServicePromise() {
  return (
    <section className="dk-section about-promise">
      <div className="dk-container">
        <div className="dk-section-header">
          <p className="dk-eyebrow">Our service promise</p>
          <h2 className="dk-section-title">Every recommendation starts by understanding your operation</h2>
          <p className="dk-section-copy">
            From the first inquiry, DK LAO turns business requirements into clear
            equipment, rental, service, parts, warehouse, and cleaning next steps.
          </p>
        </div>
        <ol className="about-promise__steps">
          {servicePromiseSteps.map((step, index) => (
            <li key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <CheckCircle2 size={20} aria-hidden="true" />
              <p>{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function AboutFinalCTA() {
  return (
    <CTASection
      title="Let's Power Your Operation Together"
      copy="Tell us what your business needs. DK LAO will help recommend the right forklift, rental plan, warehouse solution, spare parts, maintenance package, or professional cleaning equipment."
      primaryLabel="Request a Quote"
      primaryHref="/request-quote"
      secondaryLabel="Book Maintenance Service"
      secondaryHref="/maintenance-service"
      tertiaryLabel="Contact DK LAO"
      tertiaryHref="/contact"
    />
  );
}
