import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Menu } from "lucide-react";

const navItems = [
  { label: "Rental", href: "/forklift-rental" },
  { label: "Forklifts", href: "/forklift-sales" },
  { label: "Parts", href: "/spare-parts" },
  { label: "Service", href: "/maintenance-service" },
  { label: "Cleaning", href: "/cleaning-equipment" },
  { label: "Contact", href: "/contact" },
];

export function SiteHeader() {
  return (
    <header className="site-header" aria-label="DK LAO primary navigation">
      <div className="dk-container site-header__inner">
        <Link className="site-header__logo" href="/" aria-label="DK LAO home">
          <Image
            src="/images/logo/Logo-H_Text.svg"
            width={295}
            height={63}
            alt="DK LAO"
            priority
          />
        </Link>

        <nav className="site-header__nav" aria-label="Main menu">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <Link className="dk-button dk-button-primary site-header__cta" href="#quote-request">
          Request a Quote
          <ArrowRight size={18} aria-hidden="true" />
        </Link>

        <details className="site-header__mobile">
          <summary aria-label="Open navigation menu">
            <Menu size={24} aria-hidden="true" />
          </summary>
          <nav aria-label="Mobile menu">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
            <Link className="dk-button dk-button-primary" href="#quote-request">
              Request a Quote
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
