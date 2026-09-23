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

export const site = {
  name: "Canvas Creations and Events",
  shortName: "Canvas Creations",
  slogan: "Turning moments into masterpieces",
  description:
    "Premium event decoration and styling in South Australia.",
  locale: "en-AU",

  contact: {
    phone: {
      display: "0426 071 109",
      href: "tel:+61426071109",
    },
    // Not provided yet — do not invent one.
    email: null as string | null,
    address: {
      street: "Duffield Avenue",
      locality: "Munno Para",
      region: "SA",
      postcode: "5115",
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
