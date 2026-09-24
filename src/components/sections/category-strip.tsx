import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/shared/eyebrow";
import { sortedCategories, type Category } from "@/data/categories";
import { categoriesSection, type CategoriesCopy } from "@/data/home";
import { SlotItem, type ItemSlots } from "./item-slots";

/**
 * Typographic list of the kinds of celebrations the studio styles. Renders
 * nothing until verified categories exist in src/data/categories.ts.
 * Wraps instead of scrolling sideways, so every item stays visible and no
 * horizontal overflow is possible.
 */
export function CategoryStrip({
  categories = sortedCategories,
  copy = categoriesSection,
  itemSlots,
}: {
  categories?: Category[];
  copy?: CategoriesCopy;
  itemSlots?: ItemSlots<Category>;
}) {
  if (categories.length === 0 && !itemSlots?.after) return null;

  return (
    <Section aria-labelledby="categories-title" className="py-16 sm:py-20 lg:py-24">
      <Container className="text-center">
        <Eyebrow>{copy.eyebrow}</Eyebrow>
        <h2
          id="categories-title"
          className="mt-4 font-display text-display-md font-medium"
        >
          {copy.title}
        </h2>
        <Reveal>
          {/* Spacing, not separators: a separator can't be kept off the
              start of a wrapped line. Stacked on phones, wrapped row above. */}
          <ul className="mx-auto mt-10 flex max-w-4xl flex-col items-center gap-y-3 sm:mt-12 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-12 sm:gap-y-4">
            {categories.map((category) => (
              <li
                key={category.id}
                className="font-display text-display-sm text-foreground/90 italic"
              >
                <SlotItem slots={itemSlots} item={category}>
                  {category.label}
                </SlotItem>
              </li>
            ))}
          </ul>
        </Reveal>
        {itemSlots?.after}
      </Container>
    </Section>
  );
}
