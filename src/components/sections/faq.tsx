import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { sortedFaqs, type FaqItem } from "@/data/faq";
import { faqSection } from "@/data/home";

export function Faq({ faqs = sortedFaqs }: { faqs?: FaqItem[] }) {
  // Nothing to answer yet: no empty heading.
  if (faqs.length === 0) return null;

  return (
    <Section id="faq" tone="ivory" aria-labelledby="faq-title">
      <Container size="narrow">
        <SectionHeading
          id="faq-title"
          eyebrow={faqSection.eyebrow}
          title={faqSection.title}
        />
        <Reveal className="mt-12 sm:mt-14">
          {/* Radix Accordion: buttons with aria-expanded/controls, arrow-key
              navigation between questions, one open at a time. */}
          <Accordion type="single" collapsible className="border-t border-foreground/15">
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>
                  <p>{faq.answer}</p>
                  {faq.action && (
                    <p>
                      <a href={faq.action.href}>{faq.action.label}</a>
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </Container>
    </Section>
  );
}
