import Image from "next/image";
import Link from "next/link";

import { publishedRoutes, quoteHref } from "@/lib/data/routes";
import { siteFooterMetadata } from "@/lib/site-metadata";

const footerLinks = publishedRoutes().filter(
  (route) => route.group !== "conversion" && route.id !== "home",
);

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
              <Link key={item.id} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div>
          <h2>Lead actions</h2>
          <nav aria-label="Footer lead actions">
            <Link href={quoteHref()}>Request a Quote</Link>
            <Link href={quoteHref("warehouse")}>Schedule Site Survey</Link>
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
