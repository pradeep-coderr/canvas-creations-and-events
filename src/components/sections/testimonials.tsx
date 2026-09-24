import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/shared/eyebrow";
import { testimonialsSection, type TestimonialsCopy } from "@/data/home";
import { featuredTestimonials, type Testimonial } from "@/data/testimonials";

function Credit({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figcaption className="mt-6 text-sm">
      <span className="font-semibold">{testimonial.name}</span>
      {testimonial.eventType && (
        <span className="text-muted-foreground"> · {testimonial.eventType}</span>
      )}
    </figcaption>
  );
}

/**
 * Quiet editorial quotes: one lead quote, up to two more beneath. No stars,
 * avatars or carousel. Renders nothing until real testimonials exist.
 */
export function Testimonials({
  testimonials = featuredTestimonials,
  copy = testimonialsSection,
}: {
  testimonials?: Testimonial[];
  copy?: TestimonialsCopy;
}) {
  if (testimonials.length === 0) return null;
  const [lead, ...rest] = testimonials;

  return (
    <Section aria-labelledby="testimonials-title">
      <Container size="narrow" className="text-center">
        <Eyebrow>{copy.eyebrow}</Eyebrow>
        <h2 id="testimonials-title" className="sr-only">
          {copy.title}
        </h2>

        <Reveal>
          <figure className="mt-8">
            <blockquote className="font-display text-display-md text-foreground italic">
              <p>“{lead.quote}”</p>
            </blockquote>
            <Credit testimonial={lead} />
          </figure>
        </Reveal>
      </Container>

      {rest.length > 0 && (
        <Container className="mt-16 grid gap-12 border-t border-foreground/15 pt-12 sm:grid-cols-2 sm:gap-16">
          {rest.map((t) => (
            <Reveal key={t.id}>
              <figure>
                <blockquote className="font-display text-display-sm text-foreground/90 italic">
                  <p>“{t.quote}”</p>
                </blockquote>
                <Credit testimonial={t} />
              </figure>
            </Reveal>
          ))}
        </Container>
      )}
    </Section>
  );
}
