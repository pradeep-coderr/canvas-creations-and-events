import type { StaticImageData } from "next/image";
import type { NavLink } from "./site";

export interface EditorialImage {
  src: StaticImageData | string;
  /** Describe what the photo shows, e.g. the styled scene or the person. */
  alt: string;
  /** Tailwind object-position class for editorial cropping, e.g. "object-[50%_35%]". */
  position?: string;
}

/**
 * Homepage copy. Only facts we actually know — no invented claims, numbers
 * or services.
 */
export const hero = {
  eyebrow: "Event styling & décor",
  description:
    "Thoughtfully designed styling for the celebrations that matter most — shaped around your story and finished with care.",
  secondaryCta: { label: "Explore our work", href: "/#gallery" } satisfies NavLink,
  // No client photography yet. Add the hero photo to public/images/ and set
  // it here, e.g. { src: "/images/gallery/hero.jpg", alt: "…" }.
  image: null as EditorialImage | null,
};

export const intro = {
  eyebrow: "The studio",
  title: "Every celebration begins as a blank canvas.",
  body: "Canvas Creations and Events is an event styling and décor studio in South Australia. We design each setting around the people and the moment it celebrates, so the finished space feels unmistakably yours.",
};

export const servicesSection = {
  eyebrow: "Services",
  title: "Styling, shaped around your celebration.",
  description:
    "Every event is different. Tell us what you are planning and we will talk through how to bring it to life.",
  enquiry: {
    title: "Planning something?",
    text: "Tell us about your celebration.",
  },
};

export const categoriesSection = {
  eyebrow: "What we style",
  title: "Celebrations worth remembering",
};

export const gallerySection = {
  eyebrow: "Our work",
  title: "Moments, styled.",
  // Shown while src/data/gallery.ts has no images.
  emptyTitle: "Our portfolio is on its way.",
  emptyText:
    "We are curating a selection of our celebrations for this page. In the meantime, follow along on social media.",
  instagramCta: "See more on Instagram",
};

/*
 * Brand story, process and principles below use deliberately brand-level
 * wording: no founder name, biography, history, numbers or guarantees have
 * been supplied. Replace with the client's own words when available.
 */

export const about = {
  eyebrow: "About",
  title: "A personal approach to every celebration.",
  // Provisional, brand-level copy (no founder details supplied yet).
  body: [
    "Canvas Creations and Events is built on a simple idea: the setting of a celebration should feel as personal as the moment itself.",
    "Every event starts as a blank canvas. The colours, textures and details are chosen around the people it celebrates, so the finished space tells their story.",
  ],
  // Founder or studio portrait: real photography only (public/images/founder/).
  image: null as EditorialImage | null,
  cta: { label: "Tell us about your celebration", href: "/#enquire" } satisfies NavLink,
};

/** A step in working with the studio. Numbers derive from array order. */
export interface ProcessStep {
  id: string;
  title: string;
  description: string;
}

export const processSection = {
  eyebrow: "The process",
  title: "From first idea to finished setting.",
  // Provisional, high-level steps. Replace with the studio's actual process.
  steps: [
    {
      id: "enquire",
      title: "Enquire",
      description:
        "Share the date, the occasion and any ideas you already have in mind.",
    },
    {
      id: "conversation",
      title: "Talk it through",
      description:
        "We get in touch to understand your vision and what matters most to you.",
    },
    {
      id: "design",
      title: "Shape the look",
      description:
        "Together we shape the styling and details around your celebration.",
    },
    {
      id: "celebrate",
      title: "Celebrate",
      description: "Your setting comes together, so you can enjoy the moment.",
    },
  ] satisfies ProcessStep[],
};

/** A brand principle: how the studio approaches its work. */
export interface Principle {
  id: string;
  title: string;
  description: string;
}

export const whyCanvas = {
  eyebrow: "Why Canvas",
  // Two sentences, each set on its own line.
  titleLines: ["Designed with intention.", "Styled with heart."],
  // Provisional: drawn from the brand's stated personality (personal,
  // creative, elegant), phrased as approach rather than claims.
  principles: [
    {
      id: "personal",
      title: "Personal",
      description:
        "Styling shaped around you, your people and the occasion you are celebrating.",
    },
    {
      id: "considered",
      title: "Considered",
      description:
        "Colour, texture and detail chosen to work together as one setting.",
    },
    {
      id: "elegant",
      title: "Elegant",
      description: "Refined, warm styling that lets the moment take centre stage.",
    },
  ] satisfies Principle[],
};

/** Event film or video story. Local files only (public/images/videos/). */
export interface VideoContent {
  src: string;
  /** Still frame from the same video, shown before playback. */
  poster: string;
  /** Accessible name for the player, e.g. "Styling highlights from a garden wedding". */
  title: string;
  caption?: string;
}

export const videoStory = {
  eyebrow: "In motion",
  title: "Celebrations, in motion.",
  // No video yet. Add e.g. { src: "/images/videos/story.mp4",
  // poster: "/images/videos/story-poster.jpg", title: "…", caption: "…" }.
  video: null as VideoContent | null,
  emptyText: "Video stories from our events will live here.",
  tiktokCta: "Watch on TikTok",
};
