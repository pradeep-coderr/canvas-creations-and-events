import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { processSection, type ProcessCopy, type ProcessStep } from "@/data/home";
import { SlotItem, type ItemSlots } from "./item-slots";

/** How working with the studio unfolds: a numbered editorial sequence. */
export function Process({
  steps = processSection.steps,
  copy = processSection,
  itemSlots,
}: {
  steps?: ProcessStep[];
  copy?: ProcessCopy;
  itemSlots?: ItemSlots<ProcessStep>;
}) {
  if (steps.length === 0 && !itemSlots?.after) return null;

  return (
    <Section tone="blush" aria-labelledby="process-title">
      <Container>
        <SectionHeading
          id="process-title"
          eyebrow={copy.eyebrow}
          title={copy.title}
          align="start"
        />

        <ol className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4 lg:gap-x-8">
          {steps.map((step, i) => (
            <li key={step.id}>
              <SlotItem slots={itemSlots} item={step}>
              <Reveal className="border-t border-foreground/15 pt-6">
                {/* The <ol> already conveys order to assistive tech. */}
                <span
                  aria-hidden="true"
                  className="font-display text-display-md text-emphasis italic"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-display text-display-sm font-title">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-xs text-muted-foreground">
                  {step.description}
                </p>
              </Reveal>
              </SlotItem>
            </li>
          ))}
        </ol>
        {itemSlots?.after}
      </Container>
    </Section>
  );
}
