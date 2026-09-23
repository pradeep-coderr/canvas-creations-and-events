/**
 * Client testimonials. Maps onto a future `testimonials` table.
 *
 * Intentionally empty: only real, client-approved words belong here — never
 * invented quotes, names or ratings. The section does not render until at
 * least one testimonial exists. Add entries like:
 *   {
 *     id: "garden-wedding-2026",
 *     quote: "…",
 *     name: "Sarah & James",
 *     eventType: "Wedding",
 *     featured: true,
 *     order: 1,
 *   }
 */
export interface Testimonial {
  id: string;
  quote: string;
  /** As the client agreed to be credited, e.g. first names only. */
  name: string;
  eventType?: string;
  featured: boolean;
  order: number;
}

export const testimonials: Testimonial[] = [];

/** Homepage shows up to three featured testimonials. */
export const featuredTestimonials = testimonials
  .filter((t) => t.featured)
  .sort((a, b) => a.order - b.order)
  .slice(0, 3);
