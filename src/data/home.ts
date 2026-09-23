import type { StaticImageData } from "next/image";
import type { NavLink } from "./site";

export interface HeroImage {
  src: StaticImageData | string;
  /** Describe the event scene, e.g. "Blush and gold floral arch at a garden wedding". */
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
  image: null as HeroImage | null,
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
