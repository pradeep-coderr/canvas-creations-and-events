/**
 * Event stories: a celebration told through its photos. The live list comes
 * from the CMS (`event_stories`, via src/lib/content/public.ts). None are
 * built in. `isDemo` marks temporary sample content, which the site labels
 * "Sample" so it is never presented as a client's real event.
 */
export interface StoryImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  /** Where the photo came from (e.g. a stock-photo page), if recorded. */
  credit?: { text: string; href?: string };
}

export interface EventStory {
  id: string;
  title: string;
  description: string;
  /** Category label, e.g. "Birthdays". */
  category?: string;
  image: StoryImage;
  /** Extra photos, in order. */
  gallery: StoryImage[];
  location?: string;
  /** Styling notes, e.g. ["Backdrop", "Balloons", "Cake table"]. */
  styling: string[];
  /** A real, client-approved testimonial (only when one is published). */
  testimonial?: { quote: string; name: string; eventType?: string };
  isDemo: boolean;
  featured: boolean;
  order: number;
}

export const eventStories: EventStory[] = [];
