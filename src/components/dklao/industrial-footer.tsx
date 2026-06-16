import Image from "next/image";
import Link from "next/link";

import { siteFooterMetadata } from "@/lib/site-metadata";

const footerLinks = [
  { label: "About DK LAO", href: "/about" },
  { label: "Forklift Rental", href: "/forklift-rental" },
  { label: "New Forklifts", href: "/forklift-sales/new" },
  { label: "Used Forklifts", href: "/forklift-sales/used" },
  { label: "Spare Parts", href: "/spare-parts" },
  { label: "Maintenance Service", href: "/maintenance-service" },
  { label: "Cleaning Equipment", href: "/cleaning-equipment" },
];

export function IndustrialFooter() {
  return (
    <footer className="industrial-footer">
      <div className="dk-container industrial-footer__grid">
        <div>
          <Image
            src="/images/logo/Logo-H_Text.svg"
            width={295}
            height={63}
            alt="DK LAO"
          />
          <p>
            Industrial equipment, rental, service, parts, warehouse, and cleaning
            inquiry workflows for businesses across Laos.
          </p>
        </div>
        <div>
          <h2>Solutions</h2>
          <nav aria-label="Footer solutions">
            {footerLinks.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div>
          <h2>Lead actions</h2>
          <nav aria-label="Footer lead actions">
            <Link href="#quote-request">Request a Quote</Link>
            <Link href="/request-quote">Schedule Site Survey</Link>
            <Link href="/contact">Talk to DK LAO Advisor</Link>
          </nav>
        </div>
      </div>
      <div className="dk-container industrial-footer__meta">
        <p className="industrial-footer__copyright">
          {siteFooterMetadata.copyrightPrefix} Since{" "}
          {siteFooterMetadata.foundedYear}-{siteFooterMetadata.currentYear}, v
          {siteFooterMetadata.version}
        </p>
        <p className="industrial-footer__credit">
          {siteFooterMetadata.developerLabel}{" "}
          <a
            href={siteFooterMetadata.developerUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {`${siteFooterMetadata.developerName} (${siteFooterMetadata.developerDisplayUrl})`}
          </a>
        </p>
      </div>
    </footer>
  );
}
