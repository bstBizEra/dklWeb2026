import { ServiceCard } from "./service-card";
import { Container, Section, SectionHeader } from "@/components/ui/section";
import type { ProductCategory } from "@/lib/data/homepage";
import type { Messages } from "@/messages";

type ProductCategoryGridProps = {
  categories: ProductCategory[];
  labels: Messages["home"]["categories"];
};

export function ProductCategoryGrid({ categories, labels: t }: ProductCategoryGridProps) {
  return (
    <Section id="product-categories">
      <Container>
        <SectionHeader eyebrow={t.eyebrow} title={t.title} copy={t.copy} />
        <div className="grid grid-cols-4 gap-[18px] max-[1120px]:grid-cols-2 max-[780px]:grid-cols-1">
          {categories.map((category) => (
            <ServiceCard key={category.title} item={category} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
