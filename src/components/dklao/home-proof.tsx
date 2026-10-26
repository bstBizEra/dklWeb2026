import { getSiteFacts } from "@/lib/cms/site-facts";
import { siteFooterMetadata } from "@/lib/site-metadata";
import { Container } from "@/components/ui/section";
import type { Locale } from "@/lib/i18n";

// Three plain facts under the hero. Each comes from the owner-confirmed site facts or the founding year,
// and an unconfirmed fact is simply not shown.
export async function HomeProof({ locale }: { locale: Locale }) {
  const facts = await getSiteFacts(locale);
  const items = [
    { figure: String(siteFooterMetadata.foundedYear), label: "Serving businesses in Laos since" },
    facts.hours ? { figure: "24/7", label: "AI agents and human advisors work together to reply" } : null,
    facts.serviceAreas ? { figure: "Vientiane", label: "Our base, with customers served online across Laos" } : null,
  ].filter((item): item is { figure: string; label: string } => item !== null);

  return (
    <section className="relative z-[4] bg-navy-900 text-white" aria-label="DK LAO at a glance">
      <Container asChild>
        <dl className="home-proof__grid my-0 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
          {items.map((item, index) => (
            <div
              key={item.figure}
              className="flex flex-col gap-1.5 border-l border-white/15 px-7 py-[26px] first:border-l-0 first:pl-0 max-[980px]:border-t max-[980px]:border-l-0 max-[980px]:pl-0 max-[980px]:first:border-t-0"
            >
              <dd className={`m-0 text-[clamp(1.9rem,3vw,2.6rem)] font-black leading-none tracking-[-0.03em] ${index === 0 ? "text-action-orange" : ""}`}>
                {item.figure}
              </dd>
              <dt className="max-w-[30ch] text-[15px] leading-normal text-white/75">{item.label}</dt>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
