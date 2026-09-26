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
import { faqSection, type FaqCopy } from "@/data/home";
import { SlotItem, type ItemSlots } from "./item-slots";

export function Faq({
  faqs = sortedFaqs,
  copy = faqSection,
  itemSlots,
}: {
  faqs?: FaqItem[];
  copy?: FaqCopy;
  itemSlots?: ItemSlots<FaqItem>;
}) {
  // Nothing to answer yet: no empty heading.
  if (faqs.length === 0 && !itemSlots?.after) return null;

  return (
    <Section id="faq" tone="ivory" aria-labelledby="faq-title">
      <Container size="narrow">
        <SectionHeading
          styleKeys={{ eyebrow: "home.faqEyebrow", title: "home.faqTitle" }}
          id="faq-title"
          eyebrow={copy.eyebrow}
          title={copy.title}
        />
        <Reveal className="mt-12 sm:mt-14">
          {/* Radix Accordion: buttons with aria-expanded/controls, arrow-key
              navigation between questions, one open at a time. */}
          <Accordion type="single" collapsible className="border-t border-foreground/15">
            {faqs.map((faq) => (
              <SlotItem key={faq.id} slots={itemSlots} item={faq}>
              <AccordionItem value={faq.id}>
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
              </SlotItem>
            ))}
          </Accordion>
        </Reveal>
        {itemSlots?.after}
      </Container>
    </Section>
  );
}
