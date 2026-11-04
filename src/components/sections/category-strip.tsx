import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/shared/eyebrow";
import { sortedCategories, type Category } from "@/data/categories";
import { categoriesSection, type CategoriesCopy } from "@/data/home";
import { Balloon } from "./balloon";
import { BALLOON_TONES } from "./balloon-tones";
import { SlotItem, type ItemSlots } from "./item-slots";

/**
 * The kinds of celebrations the studio styles, as a balloon garland: one
 * balloon per category, each with its name on a hanging tag, bobbing gently.
 * A balloon opens the gallery showing that category. Renders nothing until
 * categories exist. On large screens the balloons rise in an arc (the
 * middle ones highest); below that they wrap into a grid, so nothing
 * scrolls sideways.
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
  const n = categories.length;

  return (
    <Section id="what-we-style" aria-labelledby="categories-title" className="overflow-clip py-16 sm:py-20 lg:py-24">
      <Container className="text-center">
        <Eyebrow data-sk="home.categoriesEyebrow">{copy.eyebrow}</Eyebrow>
        <h2 id="categories-title" data-sk="home.categoriesTitle" className="mt-4 font-display text-display-md font-title">
          {copy.title}
        </h2>
        <ul className="mx-auto mt-12 grid max-w-5xl grid-cols-2 items-start justify-items-center gap-x-4 gap-y-10 sm:mt-14 sm:grid-cols-3 sm:gap-y-12 lg:flex lg:justify-center lg:gap-x-4 xl:gap-x-8">
          {categories.map((category, i) => {
            // The arc: 0 at the ends, 1 in the middle (large screens only).
            const arc = n > 2 ? Math.sin((Math.PI * i) / (n - 1)) : 1;
            return (
              <li
                key={category.id}
                className="lg:mt-[calc((1-var(--arc))*3.5rem)]"
                style={{ "--arc": arc.toFixed(3) } as React.CSSProperties}
              >
                {/* Each balloon floats up into place as the garland scrolls in. */}
                <Reveal className="balloon-rise">
                  <Balloon
                    categoryId={category.id}
                    tone={BALLOON_TONES[i % BALLOON_TONES.length]}
                    index={i}
                    href={itemSlots ? undefined : "/#gallery"}
                    label={
                      <SlotItem slots={itemSlots} item={category}>
                        {category.label}
                      </SlotItem>
                    }
                  />
                </Reveal>
              </li>
            );
          })}
        </ul>
        {itemSlots?.after}
      </Container>
    </Section>
  );
}
