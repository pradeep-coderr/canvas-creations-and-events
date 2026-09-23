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
