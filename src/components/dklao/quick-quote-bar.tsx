import { ServiceCard } from "./service-card";
import type { FeatureCard } from "@/lib/data/homepage";

type QuickQuoteBarProps = {
  actions: FeatureCard[];
};

export function QuickQuoteBar({ actions }: QuickQuoteBarProps) {
  return (
    <section className="quick-quote" aria-labelledby="quick-quote-title">
      <div className="dk-container">
        <div className="quick-quote__header">
          <p className="dk-eyebrow">Fast inquiry routing</p>
          <h2 id="quick-quote-title">Start with the right DK LAO workflow</h2>
        </div>
        <div className="quick-quote__grid">
          {actions.map((action) => (
            <ServiceCard key={action.title} item={action} />
          ))}
        </div>
      </div>
    </section>
  );
}
