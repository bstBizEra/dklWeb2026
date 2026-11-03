import { ArrowRight, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { contactChannels, type SiteFacts } from "@/lib/data/site-facts";
import type { Messages } from "@/messages/en";

// The contact page's quick ways to reach DK LAO and the steps after a request, ported from
// feature/services-all-products (FastContactCards, ResponseProcess). Numbers, links and the address come
// only from the confirmed site facts: a card whose fact is empty is not shown.

type Labels = Messages["contactExtras"];

function QuickCard({ icon, title, copy, cta, href, external }: { icon: ReactNode; title: string; copy: string; cta: string; href: string; external?: boolean }) {
  return (
    <Card className="grid content-between gap-4 p-5">
      <div className="grid gap-2">
        <span className="inline-grid size-10 place-items-center rounded-full bg-navy-950/5 text-action-red-text" aria-hidden="true">
          {icon}
        </span>
        <h3 className="m-0 text-[1.1rem] font-[800] text-foreground">{title}</h3>
        <p className="m-0 text-[0.95rem] leading-relaxed text-slate-700">{copy}</p>
      </div>
      <a
        className="inline-flex min-h-10 items-center gap-1.5 font-[750] text-navy-800 underline-offset-4 hover:underline"
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {cta}
        <ArrowRight size={16} aria-hidden="true" />
      </a>
    </Card>
  );
}

export function FastContactCards({ facts, t }: { facts: SiteFacts; t: Labels }) {
  const channels = contactChannels(facts);
  const phone = channels.find((channel) => channel.label === "Phone");
  const whatsapp = channels.find((channel) => channel.label.startsWith("WhatsApp"));

  return (
    <section aria-labelledby="contact-fast-title" className="mb-10 grid gap-4">
      <h2 id="contact-fast-title" className="m-0 text-[1.6rem] font-[850] tracking-[-0.02em] text-foreground">
        {t.fastTitle}
      </h2>
      <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
        {phone ? <QuickCard icon={<Phone size={20} />} {...t.call} href={phone.href} /> : null}
        {whatsapp ? <QuickCard icon={<MessageCircle size={20} />} {...t.whatsapp} href={whatsapp.href} external /> : null}
        <QuickCard icon={<Send size={20} />} {...t.quote} href="#contact-inquiry" />
        {facts.address ? (
          <QuickCard
            icon={<MapPin size={20} />}
            {...t.visit}
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(facts.address)}`}
            external
          />
        ) : null}
      </div>
    </section>
  );
}

export function ResponseProcess({ t }: { t: Labels }) {
  return (
    <section aria-labelledby="contact-process-title" className="mt-12 grid gap-4">
      <div className="grid gap-1">
        <h2 id="contact-process-title" className="m-0 text-[1.6rem] font-[850] tracking-[-0.02em] text-foreground">
          {t.processTitle}
        </h2>
        <p className="m-0 text-slate-700">{t.processIntro}</p>
      </div>
      <ol className="m-0 grid list-none grid-cols-2 gap-4 p-0 max-[640px]:grid-cols-1">
        {t.steps.map((step, index) => (
          <li key={step.title}>
            <Card className="h-full p-5">
              <span className="text-[0.85rem] font-[850] tabular-nums text-action-red-text">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="mt-1 mb-1.5 text-[1.05rem] font-[800] text-foreground">{step.title}</h3>
              <p className="m-0 text-[0.95rem] leading-relaxed text-slate-700">{step.copy}</p>
            </Card>
          </li>
        ))}
      </ol>
    </section>
  );
}
