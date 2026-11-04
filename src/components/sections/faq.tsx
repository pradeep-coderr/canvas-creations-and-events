import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/shared/section-heading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { sortedFaqs, type FaqItem } from "@/data/faq";
import { faqSection, type FaqCopy } from "@/data/home";
import { TONES, type BalloonTone } from "./balloon-tones";
import { SlotItem, type ItemSlots } from "./item-slots";

// Ribbon colours, in turn down the list, and each tag's resting tilt.
const RIBBONS: BalloonTone[] = ["blush", "gold", "rose", "champagne"];
const TILTS = [-1.2, 0.9, -0.6, 1.1, -0.9];

/*
 * A satin ribbon tied through the tag's eyelet: a loop through the hole,
 * a knot, and two tails with V-cut ends hanging off to the left.
 * Decorative only.
 */
function TagRibbon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 60 72" className="faq-ribbon pointer-events-none absolute overflow-visible">
      {/* Tails (behind the knot). */}
      <path d="M30 20 C 22 31, 14 43, 6 60 L 12 58.5 L 13.5 65 C 20 47, 26 33, 31 22 Z" fill="var(--rb-deep)" />
      <path d="M30 20 C 27 33, 26 47, 27 66 L 31 61 L 35.5 65 C 33 47, 32.5 33, 31.5 21 Z" fill="var(--rb)" />
      {/* The loop through the eyelet. */}
      <path d="M30 20 C 37 9, 48 9.5, 52 18 C 48 15, 39 15, 31 21 Z" fill="var(--rb)" />
      <path d="M30 20 C 37 30, 48 30.5, 52 22 C 48 25, 39 25, 31 21 Z" fill="var(--rb-deep)" />
      {/* The knot. */}
      <ellipse cx="30.5" cy="20.5" rx="3.6" ry="4.4" fill="var(--rb)" stroke="var(--rb-deep)" strokeWidth="0.8" />
    </svg>
  );
}

/*
 * Each question is a paper gift tag hung on a satin ribbon, slightly
 * askew. As the list scrolls in, each tag swings into place on its ribbon;
 * opening one straightens it and the answer unfolds down from a crease
 * (globals.css "Ribbon tags"). Still the Radix accordion underneath.
 */
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
        {/* Radix Accordion: buttons with aria-expanded/controls, arrow-key
            navigation between questions, one open at a time. */}
        <Accordion type="single" collapsible className="faq-tags mt-12 sm:mt-14">
          {faqs.map((faq, i) => {
            const [, mid, deep] = TONES[RIBBONS[i % RIBBONS.length]];
            const style = { "--rb": mid, "--rb-deep": deep, "--tag-tilt": `${TILTS[i % TILTS.length]}deg` } as React.CSSProperties;
            return (
              <SlotItem key={faq.id} slots={itemSlots} item={faq}>
                <AccordionItem value={faq.id} className="faq-tag border-0" style={style}>
                  <div className="faq-tag-card">
                    <span aria-hidden="true" className="faq-tag-paper" />
                    <span aria-hidden="true" className="faq-eyelet" />
                    <TagRibbon />
                    <AccordionTrigger className="faq-tag-q">{faq.question}</AccordionTrigger>
                    <AccordionContent className="faq-tag-a">
                      <p>{faq.answer}</p>
                      {faq.action && (
                        <p>
                          <a href={faq.action.href}>{faq.action.label}</a>
                        </p>
                      )}
                    </AccordionContent>
                  </div>
                </AccordionItem>
              </SlotItem>
            );
          })}
        </Accordion>
        {itemSlots?.after}
      </Container>
    </Section>
  );
}
