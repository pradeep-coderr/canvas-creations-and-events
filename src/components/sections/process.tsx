import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { processSection } from "@/data/home";

/** How working with the studio unfolds: a numbered editorial sequence. */
export function Process() {
  return (
    <Section tone="ivory" aria-labelledby="process-title">
      <Container>
        <SectionHeading
          id="process-title"
          eyebrow={processSection.eyebrow}
          title={processSection.title}
          align="start"
        />

        <ol className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4 lg:gap-x-8">
          {processSection.steps.map((step, i) => (
            <li key={step.id}>
              <Reveal className="border-t border-foreground/15 pt-6">
                {/* The <ol> already conveys order to assistive tech. */}
                <span
                  aria-hidden="true"
                  className="font-display text-display-md text-emphasis italic"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-display text-display-sm font-medium">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-xs text-muted-foreground">
                  {step.description}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
