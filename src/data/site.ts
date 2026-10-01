/**
 * Single source of truth for business details.
 * Components should import from here rather than hard-coding these values.
 */

export type SocialPlatform = "instagram" | "facebook" | "tiktok";

export interface SocialLink {
  platform: SocialPlatform;
  label: string;
  href: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export const site = {
  name: "Canvas Creations and Events",
  shortName: "Canvas Creations",
  slogan: "Turning moments into masterpieces",
  description:
    "Canvas Creations and Events (Canvas Creation) is an event styling and decoration studio in Adelaide, South Australia, for celebrations and corporate events.",

  // Search engines: what the business does and where, in the page title, and
  // the names people search for. Only confirmed facts (no services, prices,
  // service area or claims that the client hasn't provided).
  seo: {
    title: "Event Styling & Decoration in Adelaide",
    alternateNames: ["Canvas Creation", "Canvas Creations", "Canvas Creations & Events"],
  },
  region: "South Australia",
  locale: "en-AU",

  // Homepage section anchors. The sections arrive in later phases; until
  // then these links stay on the homepage (no 404s).
  navigation: [
    { label: "Home", href: "/" },
    { label: "Services", href: "/#services" },
    { label: "Gallery", href: "/#gallery" },
    { label: "About", href: "/#about" },
    { label: "FAQ", href: "/#faq" },
    { label: "Contact", href: "/#contact" },
  ] satisfies NavLink[],

  enquiry: { label: "Enquire Now", href: "/#enquire" } satisfies NavLink,

  contact: {
    phone: {
      display: "0426 071 109",
      href: "tel:+61426071109",
    },
    // Provided by the client (1 Oct 2026). Editable in Site details.
    email: "ccandevents2242@gmail.com" as string | null,
    // Business area (Phase 20). No street or postcode is published.
    address: {
      street: null as string | null,
      locality: "Adelaide",
      region: "South Australia",
      postcode: null as string | null,
      country: "Australia",
      countryCode: "AU",
    },
  },

  socials: [
    {
      platform: "instagram",
      label: "Instagram",
      href: "https://www.instagram.com/canvas_creations_and_events/",
    },
    {
      platform: "facebook",
      label: "Facebook",
      href: "https://www.facebook.com/share/1EyUpMtEaW/?mibextid=wwXIfr",
    },
    {
      platform: "tiktok",
      label: "TikTok",
      href: "https://www.tiktok.com/@canvascreations.adl.au",
    },
  ] satisfies SocialLink[],
} as const;
