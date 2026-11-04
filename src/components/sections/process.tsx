import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { processSection, type ProcessCopy, type ProcessStep } from "@/data/home";
import { SlotItem, type ItemSlots } from "./item-slots";

/*
 * How working with the studio unfolds, as a ribbon timeline: a rose ribbon
 * with a gold edge draws along the steps as the section scrolls (across the
 * top on large screens, down the left side below that), and each step's
 * gold medallion lights up as the ribbon reaches it. One scroll progress
 * value (--proc, globals.css "Process ribbon") drives both, so they stay
 * in step; fully drawn and lit with reduced motion.
 */
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
  const n = Math.max(steps.length, 1);

  return (
    <Section id="process" tone="blush" aria-labelledby="process-title">
      <Container>
        <SectionHeading
          styleKeys={{ eyebrow: "home.processEyebrow", title: "home.processTitle" }}
          id="process-title"
          eyebrow={copy.eyebrow}
          title={copy.title}
          align="start"
        />

        <ol className="process-ribbon relative mt-14 grid gap-y-12 pl-16 sm:pl-20 lg:mt-20 lg:grid-cols-4 lg:gap-x-8 lg:pl-0">
          {/* The ribbon's path (a faint dotted guide) and the ribbon itself. */}
          <span aria-hidden="true" className="process-track pointer-events-none absolute" />
          <span aria-hidden="true" className="process-band pointer-events-none absolute" />
          {steps.map((step, i) => (
            <li
              key={step.id}
              className="relative"
              // Where along the ribbon this step's medallion sits (0–1).
              style={{ "--f": ((i + 0.08) / n).toFixed(3) } as React.CSSProperties}
            >
              <SlotItem slots={itemSlots} item={step}>
                <Reveal>
                  {/* The <ol> already conveys order to assistive tech. */}
                  <span
                    aria-hidden="true"
                    className="process-medal flex size-11 items-center justify-center rounded-full border border-highlight font-display text-lg italic"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-display-sm font-title lg:mt-7">{step.title}</h3>
                  <p className="mt-3 max-w-xs text-muted-foreground">{step.description}</p>
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
