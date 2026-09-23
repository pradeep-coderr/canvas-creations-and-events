/**
 * Services offered. Shaped to map directly onto a future `services` table.
 *
 * Only verified offerings belong here. The business brief confirms event
 * styling and decoration; add further services only once the client
 * provides them.
 */
export interface Service {
  /** Stable slug; becomes the database key / URL segment later. */
  id: string;
  title: string;
  /** One or two sentences. */
  summary: string;
  /** Real photography only (public/images/services/). */
  image?: { src: string; alt: string };
  /** Detail page, once one exists. Rows without an href are not links. */
  href?: string;
  /** Ascending display order. */
  order: number;
  /** Shown in the homepage services list. */
  featured: boolean;
}

export const services: Service[] = [
  {
    id: "event-styling",
    title: "Event styling & decoration",
    summary:
      "Styling and décor for your celebration, designed around the people and the occasion.",
    order: 1,
    featured: true,
  },
];

export const featuredServices = services
  .filter((service) => service.featured)
  .sort((a, b) => a.order - b.order);
