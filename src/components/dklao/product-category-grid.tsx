import { ServiceCard } from "./service-card";
import type { ProductCategory } from "@/lib/data/homepage";

type ProductCategoryGridProps = {
  categories: ProductCategory[];
};

export function ProductCategoryGrid({ categories }: ProductCategoryGridProps) {
  return (
    <section className="dk-section category-section" id="product-categories">
      <div className="dk-container">
        <div className="dk-section-header">
          <p className="dk-eyebrow">Product discovery</p>
          <h2 className="dk-section-title">Browse by equipment need</h2>
          <p className="dk-section-copy">
            Each category is prepared for quotation-based recommendations and future
            catalog management without hardcoded stock or pricing claims.
          </p>
        </div>
        <div className="card-grid card-grid--four">
          {categories.map((category) => (
            <ServiceCard key={category.title} item={category} />
          ))}
        </div>
      </div>
    </section>
  );
}
