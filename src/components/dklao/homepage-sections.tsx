import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BatteryCharging,
  ClipboardCheck,
  Gauge,
  PackageCheck,
  ShieldCheck,
  Warehouse,
  Wrench,
} from "lucide-react";

import {
  industrySolutions,
  knowledgeArticles,
  solutionCards,
  trustSignals,
} from "@/lib/data/homepage";
import { AnatomyDiagram } from "./anatomy-diagram";
import { CTASection } from "./cta-section";
import { QuoteRequestForm } from "./quote-request-form";
import { ServiceCard } from "./service-card";

export function SolutionOverview() {
  return (
    <section className="dk-section" id="solutions">
      <div className="dk-container">
        <div className="dk-section-header">
          <p className="dk-eyebrow">Semi-ecommerce discovery</p>
          <h2 className="dk-section-title">Industrial solutions organized around business action</h2>
          <p className="dk-section-copy">
            DK LAO customers can browse by need, compare service paths, and move
            directly into a quote, rental, service, spare-parts, or recommendation
            workflow.
          </p>
        </div>
        <div className="card-grid card-grid--four">
          {solutionCards.map((card) => (
            <ServiceCard key={card.title} item={card} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function RentalHighlight() {
  return (
    <section className="rental-highlight">
      <div className="dk-container rental-highlight__grid">
        <div>
          <p className="dk-eyebrow">Forklift rental</p>
          <h2>Short-term and long-term rental inquiry support</h2>
          <p>
            Rental requests can capture capacity, lift height, rental period,
            operating environment, working hours, operator needs, delivery location,
            and transport requirements.
          </p>
          <div className="rental-highlight__actions">
            <Link className="dk-button dk-button-primary" href="/forklift-rental">
              Ask for Rental Price
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link className="dk-button dk-button-light" href="#quote-request">
              Request a Quote
            </Link>
          </div>
        </div>
        <div className="rental-highlight__panel">
          <div>
            <Gauge size={28} aria-hidden="true" />
            <span>Capacity</span>
            <strong>On request</strong>
          </div>
          <div>
            <Warehouse size={28} aria-hidden="true" />
            <span>Indoor or outdoor</span>
            <strong>Site matched</strong>
          </div>
          <div>
            <ClipboardCheck size={28} aria-hidden="true" />
            <span>Rental period</span>
            <strong>Flexible</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

export function UsedAndServiceSection() {
  return (
    <section className="dk-section-tight service-band">
      <div className="dk-container service-band__grid">
        <article>
          <span className="dk-icon-badge">
            <ShieldCheck size={24} aria-hidden="true" />
          </span>
          <h2>Used forklift inquiries without fake stock claims</h2>
          <p>
            Visitors can request selected used equipment review by use case, condition
            needs, capacity, and inspection preference.
          </p>
          <Link className="service-band__link" href="/forklift-sales/used">
            View Used Forklift Stock
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </article>
        <article>
          <span className="dk-icon-badge">
            <Wrench size={24} aria-hidden="true" />
          </span>
          <h2>Maintenance service and repair booking</h2>
          <p>
            Service requests are prepared for equipment brand, model, serial number,
            issue description, preferred date, and service location.
          </p>
          <Link className="service-band__link" href="/maintenance-service">
            Book Maintenance Service
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </article>
        <article>
          <span className="dk-icon-badge">
            <PackageCheck size={24} aria-hidden="true" />
          </span>
          <h2>Spare-parts inquiry workflow</h2>
          <p>
            Parts requests can include part type, equipment brand, model, serial
            number, quantity, urgency, and image attachments in future phases.
          </p>
          <Link className="service-band__link" href="/spare-parts">
            Request Spare Parts
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </article>
      </div>
    </section>
  );
}

export function ForkliftAnatomyInteractive() {
  return (
    <section className="dk-section anatomy-section">
      <div className="dk-container anatomy-section__layout">
        <div className="anatomy-section__intro">
          <p className="dk-eyebrow">Equipment matching</p>
          <h2 className="dk-section-title">Know the forklift, ask the right questions</h2>
          <p className="dk-section-copy">
            Every DK LAO rental, sales, or service recommendation starts from the
            same components. Explore the main forklift parts DK LAO reviews before
            preparing your quotation.
          </p>
        </div>
        <AnatomyDiagram />
      </div>
    </section>
  );
}

export function CleaningAndWarehouseSection() {
  return (
    <section className="dk-section clean-warehouse">
      <div className="dk-container clean-warehouse__grid">
        <article className="clean-warehouse__feature">
          <span className="dk-icon-badge">
            <BatteryCharging size={24} aria-hidden="true" />
          </span>
          <h2>Professional cleaning equipment recommendations</h2>
          <p>
            Connect floor type, working area, cleaning routine, and facility profile
            to the right cleaning equipment inquiry workflow.
          </p>
          <Link className="dk-button dk-button-light" href="/cleaning-equipment">
            Get Cleaning Equipment Recommendation
          </Link>
        </article>
        <article className="clean-warehouse__feature clean-warehouse__feature--dark">
          <span className="dk-icon-badge">
            <Warehouse size={24} aria-hidden="true" />
          </span>
          <h2>Warehouse equipment and racking solutions</h2>
          <p>
            Plan material flow, storage, shelving, racking, and movement equipment
            from one site-survey conversation.
          </p>
          <Link className="dk-button dk-button-primary" href="/warehouse-equipment">
            Explore Warehouse Solutions
          </Link>
        </article>
      </div>
    </section>
  );
}

export function IndustriesAndTrustSection() {
  return (
    <section className="dk-section">
      <div className="dk-container">
        <div className="dk-section-header">
          <p className="dk-eyebrow">Industries served</p>
          <h2 className="dk-section-title">Built for procurement and operations teams</h2>
          <p className="dk-section-copy">
            The content structure helps warehouse managers, factory teams, logistics
            operators, and facility managers reach the correct DK LAO workflow.
          </p>
        </div>
        <div className="card-grid card-grid--four">
          {industrySolutions.map((industry) => (
            <ServiceCard key={industry.title} item={industry} />
          ))}
        </div>

        <div className="trust-grid">
          {trustSignals.map((signal) => {
            const Icon = signal.icon;
            return (
              <article key={signal.title}>
                <Icon size={24} aria-hidden="true" />
                <h3>{signal.title}</h3>
                <p>{signal.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function KnowledgeCenterPreview() {
  return (
    <section className="dk-section-tight knowledge-preview">
      <div className="dk-container knowledge-preview__grid">
        <div>
          <p className="dk-eyebrow">Knowledge center</p>
          <h2>Practical guides for equipment inquiries</h2>
          <p>
            Article routes are prepared for future SEO content around rental,
            spare-parts matching, service planning, warehouse equipment, and cleaning.
          </p>
        </div>
        <div className="knowledge-preview__cards">
          {knowledgeArticles.map((article) => (
            <Link key={article.title} href={article.href}>
              <span>{article.category}</span>
              <strong>{article.title}</strong>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function QuoteSection() {
  return (
    <section className="dk-section quote-section">
      <div className="dk-container quote-section__grid">
        <div>
          <p className="dk-eyebrow">Request routing</p>
          <h2 className="dk-section-title">One form, structured for DK LAO follow-up</h2>
          <p className="dk-section-copy">
            The first homepage form captures the required universal lead fields and
            keeps the data shape ready for CRM, email, and admin dashboard expansion.
          </p>
          <div className="quote-section__asset">
            <Image
              src="/images/logo/Logo-V_Text.svg"
              width={84}
              height={61}
              alt="DK LAO vertical logo"
            />
            <span>Quotation-based pricing. Availability on request.</span>
          </div>
        </div>
        <QuoteRequestForm />
      </div>
    </section>
  );
}

export function FinalHomepageCTA() {
  return (
    <CTASection
      title="Ready to review equipment, rental, service, or spare-parts needs?"
      copy="Send a structured request so DK LAO can route it to the right business workflow."
      primaryLabel="Request a Quote"
      primaryHref="#quote-request"
      secondaryLabel="Talk to DK LAO Advisor"
      secondaryHref="/contact"
    />
  );
}
