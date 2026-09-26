import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { whyCanvas, type Principle, type WhyCanvasCopy } from "@/data/home";
import { SlotItem, type ItemSlots } from "./item-slots";
import { cn } from "@/lib/utils";

// Desktop "staircase": each principle steps further right, a quiet
// cinematic cadence without cards or rules.
const steps = ["", "lg:ml-[25%]", "lg:ml-[50%]"];

export function WhyCanvas({
  principles = whyCanvas.principles,
  copy = whyCanvas,
  itemSlots,
}: {
  principles?: Principle[];
  copy?: WhyCanvasCopy;
  itemSlots?: ItemSlots<Principle>;
}) {
  if (principles.length === 0 && !itemSlots?.after) return null;

  return (
    <Section tone="dark" aria-labelledby="why-title">
      <Container>
        <SectionHeading
          id="why-title"
          eyebrow={copy.eyebrow}
          title={copy.titleLines.map((line, i) => (
            // The space keeps the sentences apart in the accessible name.
            <span key={i} className="block">
              {i > 0 && " "}
              {line}
            </span>
          ))}
          align="start"
          className="max-w-3xl"
        />

        <ol className="mt-16 space-y-12 sm:mt-20 lg:space-y-16">
          {principles.map((principle, i) => (
            <li key={principle.id} className={cn("max-w-md", steps[i])}>
              <SlotItem slots={itemSlots} item={principle}>
              <Reveal>
                <span
                  aria-hidden="true"
                  className="text-eyebrow font-semibold text-emphasis"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-display-md font-title">
                  {principle.title}
                </h3>
                <p className="mt-3 text-muted-foreground">
                  {principle.description}
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
