import { ServiceCard } from "./service-card";
import { Container, Section, SectionHeader } from "@/components/ui/section";
import type { ProductCategory } from "@/lib/data/homepage";

type ProductCategoryGridProps = {
  categories: ProductCategory[];
};

export function ProductCategoryGrid({ categories }: ProductCategoryGridProps) {
  return (
    <Section id="product-categories">
      <Container>
        <SectionHeader
          eyebrow="Equipment"
          title="Browse by equipment need"
          copy="Tell us what you move and where. We recommend the equipment and send a quotation."
        />
        <div className="grid grid-cols-4 gap-[18px] max-[1120px]:grid-cols-2 max-[780px]:grid-cols-1">
          {categories.map((category) => (
            <ServiceCard key={category.title} item={category} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
