import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { Stars } from "@/components/shared/stars";
import { reviewsSection, type ReviewsCopy } from "@/data/home";
import type { PublicReview } from "@/lib/review";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { ReviewForm } from "./review-form";

/**
 * Reviews & feedback. Shows client reviews an admin has approved (each with
 * the client's own star rating; no overall average or rating badge) and a
 * "Leave a review" button that opens the form. Before any review is
 * approved, it invites the first one. Nothing here is ever invented.
 */
export function Reviews({
  reviews,
  copy = reviewsSection,
  enabled = true,
}: {
  reviews: PublicReview[];
  copy?: ReviewsCopy;
  /** False in the visual editor (the form is a preview there). */
  enabled?: boolean;
}) {
  const live = enabled && isSupabaseConfigured();
  return (
    <Section id="reviews" aria-labelledby="reviews-title">
      <Container>
        <SectionHeading
          styleKeys={{ eyebrow: "home.reviewsEyebrow", title: "home.reviewsTitle", description: "home.reviewsDescription" }}
          id="reviews-title"
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
        />

        {/* Centred rows: one or two reviews sit in the middle rather than to one side. */}
        {reviews.length > 0 ? (
          <ul className="mt-12 flex flex-wrap justify-center gap-6 sm:mt-16 lg:gap-8">
            {reviews.map((review) => (
              <li key={review.id} className="w-full min-w-0 md:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-4rem)/3)]">
                <Reveal className="h-full">
                  <figure className="flex h-full flex-col gap-5 border border-foreground/15 bg-background p-7 sm:p-8">
                    <Stars rating={review.rating} />
                    <blockquote className="flex-1 text-foreground/90">
                      <p className="whitespace-pre-line">{review.message}</p>
                    </blockquote>
                    <figcaption className="border-t border-foreground/15 pt-4 text-sm">
                      <span className="font-semibold">{review.name}</span>
                      {review.eventType && <span className="text-muted-foreground"> · {review.eventType}</span>}
                    </figcaption>
                  </figure>
                </Reveal>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mx-auto mt-8 max-w-xl text-center text-muted-foreground">{copy.emptyText}</p>
        )}

        <div className="mt-10 flex justify-center sm:mt-12">
          <ReviewForm label={copy.ctaLabel} enabled={live} />
        </div>
      </Container>
    </Section>
  );
}
