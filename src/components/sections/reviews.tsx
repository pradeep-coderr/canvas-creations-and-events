import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/shared/section-heading";
import { reviewsSection, type ReviewsCopy } from "@/data/home";
import type { PublicReview } from "@/lib/review";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { Guestbook } from "./guestbook";
import { ReviewForm } from "./review-form";

/**
 * Reviews & feedback. Shows client reviews an admin has approved as pages
 * of an open guestbook (each with the client's own star rating; no overall
 * average or rating badge) and a
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
    <Section id="reviews" aria-labelledby="reviews-title" className="overflow-x-clip">
      <Container>
        <SectionHeading
          styleKeys={{ eyebrow: "home.reviewsEyebrow", title: "home.reviewsTitle", description: "home.reviewsDescription" }}
          id="reviews-title"
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
        />

        {/* An open guestbook: one signed page per review (or an invitation to sign first). */}
        <Guestbook reviews={reviews} emptyText={copy.emptyText} />

        <div className="mt-10 flex justify-center sm:mt-12">
          <ReviewForm label={copy.ctaLabel} enabled={live} />
        </div>
      </Container>
    </Section>
  );
}
