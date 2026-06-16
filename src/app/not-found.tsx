import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Compass } from "lucide-react";

import { SiteHeader } from "@/components/dklao/site-header";
import { IndustrialFooter } from "@/components/dklao/industrial-footer";

export const metadata: Metadata = {
  title: "Page not found",
  description:
    "The page you are looking for is not available yet. Explore DK LAO forklift rental, sales, spare parts, maintenance, and cleaning equipment workflows.",
  robots: {
    index: false,
    follow: true,
  },
};

const quickLinks = [
  { label: "About DK LAO", href: "/about" },
  { label: "Forklift Rental", href: "/forklift-rental" },
  { label: "New & Used Forklifts", href: "/forklift-sales" },
  { label: "Spare Parts", href: "/spare-parts" },
  { label: "Maintenance Service", href: "/maintenance-service" },
  { label: "Cleaning Equipment", href: "/cleaning-equipment" },
  { label: "Contact DK LAO", href: "/contact" },
];

export default function NotFound() {
  return (
    <main className="dk-page" id="main-content">
      <SiteHeader />
      <section className="not-found">
        <div className="dk-container not-found__inner">
          <span className="dk-icon-badge">
            <Compass size={24} aria-hidden="true" />
          </span>
          <p className="dk-eyebrow">Error 404</p>
          <h1 className="not-found__title">This page is not available</h1>
          <p className="not-found__copy">
            The page may have moved or is not published yet. You can return to the
            homepage or send a request and a DK LAO advisor will route it to the
            right workflow.
          </p>
          <div className="not-found__actions">
            <Link className="dk-button dk-button-primary" href="/">
              Back to Home
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link className="dk-button dk-button-light" href="/#quote-request">
              Request a Quote
            </Link>
          </div>
          <nav className="not-found__links" aria-label="Popular destinations">
            {quickLinks.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            ))}
          </nav>
        </div>
      </section>
      <IndustrialFooter />
    </main>
  );
}
