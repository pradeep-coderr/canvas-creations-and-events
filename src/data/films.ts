/**
 * Films (YouTube/Vimeo videos). The live list comes from the CMS (`films`,
 * via src/lib/content/public.ts). None are built in.
 */
export interface Film {
  id: string;
  provider: "youtube" | "vimeo";
  /** Accessible name for the player and the card's heading. */
  title: string;
  caption?: string;
  /** Embeddable player, loaded only after the visitor presses Play. */
  playerUrl: string;
  /** The video's cover image from the media library (optional). */
  poster: { src: string; alt: string } | null;
  featured: boolean;
  order: number;
}

export const films: Film[] = [];
