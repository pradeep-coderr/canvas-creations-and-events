import type { StaticImageData } from "next/image";
import type { NavLink } from "./site";

export interface EditorialImage {
  src: StaticImageData | string;
  /** Describe what the photo shows, e.g. the styled scene or the person. */
  alt: string;
  /** Tailwind object-position class for editorial cropping, e.g. "object-[50%_35%]". */
  position?: string;
  /** Intrinsic size (CMS images), for previews and the lightbox. */
  width?: number;
  height?: number;
}

/**
 * Homepage copy. Only facts we actually know — no invented claims, numbers
 * or services.
 *
 * CMS: the live copy comes from `home_content`, `about_content`,
 * `video_story`, `process_steps` and `principles` (edited at /admin/content,
 * read by src/lib/content/public.ts). Everything here is the built-in
 * fallback when no database is configured or it can't be reached, and the
 * source of the link targets and system messages that stay in code.
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
  /** Optional line under the heading. */
  intro: null as string | null,
  /** The first filter button (shown only when there are enough categories). */
  filterAll: "All",
};

/*
 * Pricing section wording. The section appears only once a real package is
 * published in the CMS; no packages or prices are built in.
 */
export const pricingSection = {
  eyebrow: "Pricing",
  title: "Packages",
  description: null as string | null,
};

/*
 * Brand story, process and principles below use deliberately brand-level
 * wording: no founder name, biography, history, numbers or guarantees have
 * been supplied. Replace with the client's own words when available.
 */

/** The founder's name as the client wants it shown, with an optional role. */
export interface FounderCredit {
  name: string;
  role?: string;
}

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
  // Shown under the text once the client provides a real name.
  founder: null as FounderCredit | null,
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
/**
 * A video ready to render, whatever its source (YouTube, Vimeo or an
 * uploaded-video provider). Provider details stay in the data layer
 * (src/lib/media/video-providers.ts); the page only gets a player URL.
 */
export interface VideoContent {
  provider: "youtube" | "vimeo" | "stream";
  /** Accessible name for the player, e.g. "Styling highlights from a garden wedding". */
  title: string;
  caption?: string;
  /** Embeddable player, loaded only after the visitor presses Play. */
  playerUrl: string;
  /** Cover image from the media library (optional). */
  poster: { src: string; alt: string } | null;
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

export const testimonialsSection = {
  eyebrow: "Kind words",
  title: "From our clients",
};

export const faqSection = {
  eyebrow: "FAQ",
  title: "Questions, answered.",
};

export const enquirySection = {
  eyebrow: "Enquire",
  title: "Let's plan something beautiful.",
  description:
    "Tell us a little about your celebration. The more you share, the better we can understand what you have in mind.",
  // Shown while the form has no backend (see src/lib/enquiry.ts).
  offlineNotice:
    "Online enquiries are still being set up, so this form can't send messages yet. For now, please call us.",
};

export const contactSection = {
  eyebrow: "Contact",
  title: "Let's make something memorable.",
  description: "Prefer to talk it through? Give us a call, or follow along online.",
};

/**
 * Copy as the sections render it. Text may be any React node: the public
 * site passes plain strings (CMS or the values above), the admin visual
 * editor passes editable text. Links, image sources and alt text stay plain.
 */
export type Renderable<T> = T extends string
  ? React.ReactNode
  : T extends readonly (infer U)[]
    ? Renderable<U>[]
    : T extends object
      ? { [K in keyof T]: K extends "href" | "src" | "alt" | "position" | "poster" | "platform" ? T[K] : Renderable<T[K]> }
      : T;

/*
 * Section copy types. The public sections take these as props (defaulting
 * to the values above), so the same components render the CMS copy from
 * src/lib/content/public.ts.
 */
export type HeroCopy = Renderable<typeof hero>;
export type IntroCopy = Renderable<typeof intro>;
export type ServicesCopy = Renderable<typeof servicesSection>;
export type CategoriesCopy = Renderable<typeof categoriesSection>;
export type GalleryCopy = Renderable<typeof gallerySection>;
export type PricingCopy = Renderable<typeof pricingSection>;
export type AboutCopy = Renderable<typeof about>;
export type ProcessCopy = Renderable<Pick<typeof processSection, "eyebrow" | "title">>;
export type WhyCanvasCopy = Renderable<Pick<typeof whyCanvas, "eyebrow" | "titleLines">>;
export type VideoStoryCopy = Renderable<Omit<typeof videoStory, "video">>;
export type TestimonialsCopy = Renderable<typeof testimonialsSection>;
export type FaqCopy = Renderable<typeof faqSection>;
export type EnquiryCopy = Renderable<typeof enquirySection>;
export type ContactCopy = Renderable<typeof contactSection>;
