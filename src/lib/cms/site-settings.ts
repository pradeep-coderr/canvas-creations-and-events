import { z } from "zod";
import type { Renderable } from "@/data/home";
import { site } from "@/data/site";
import { line, optionalLine, text } from "./fields";

/*
 * Site details (the `site_settings` singleton): the visible text and
 * business details that used to live only in src/data/site.ts. Link
 * destinations, the business name and the form's validation messages stay
 * in code. src/data/site.ts is now the FALLBACK (no database / failed load)
 * and equals the seeded row.
 */

type Row = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" ? v : "");

// Form field → column
export const siteColumns = {
  headlineLead: "headline_lead",
  headlineEmphasis: "headline_emphasis",
  footerTagline: "footer_tagline",
  navHome: "nav_home",
  navServices: "nav_services",
  navGallery: "nav_gallery",
  navAbout: "nav_about",
  navFaq: "nav_faq",
  navContact: "nav_contact",
  navPricing: "nav_pricing",
  navFilms: "nav_films",
  enquireLabel: "enquire_label",
  mobileEnquireLabel: "mobile_enquire_label",
  mobileCallLabel: "mobile_call_label",
  menuLabel: "menu_label",
  callPrompt: "call_prompt",
  footerExploreHeading: "footer_explore_heading",
  footerContactHeading: "footer_contact_heading",
  footerFollowHeading: "footer_follow_heading",
  basedInLabel: "based_in_label",
  phoneDisplay: "phone_display",
  contactEmail: "contact_email",
  addressStreet: "address_street",
  addressLocality: "address_locality",
  addressRegion: "address_region",
  addressPostcode: "address_postcode",
  instagramUrl: "instagram_url",
  facebookUrl: "facebook_url",
  tiktokUrl: "tiktok_url",
  formNameLabel: "form_name_label",
  formEmailLabel: "form_email_label",
  formPhoneLabel: "form_phone_label",
  formEventTypeLabel: "form_event_type_label",
  formEventDateLabel: "form_event_date_label",
  formVenueLabel: "form_venue_label",
  formMessageLabel: "form_message_label",
  formSubmitLabel: "form_submit_label",
  formOptionalLabel: "form_optional_label",
  formSuccessTitle: "form_success_title",
  formSuccessText: "form_success_text",
} as const;

export type SiteField = keyof typeof siteColumns;
export const SITE_SETTINGS_SELECT = Object.values(siteColumns).join(", ");

const phone = z
  .string()
  .trim()
  .regex(/^\+?[0-9 ()-]{8,24}$/, "Use a phone number, e.g. 0426 071 109.")
  .refine((v) => {
    const digits = v.replace(/\D/g, "").length;
    return digits >= 8 && digits <= 15;
  }, "Use a phone number with 8 to 15 digits.");

const email = z
  .string()
  .trim()
  .max(254, "Keep this to 254 characters or fewer.")
  .refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Use an email address, e.g. hello@example.com, or leave it empty.")
  .transform((v) => v || null);

const social = (host: RegExp, name: string) =>
  z
    .string()
    .trim()
    .max(300, "Keep this to 300 characters or fewer.")
    .refine((v) => v === "" || host.test(v), `Paste the full ${name} link, starting with https://`)
    .transform((v) => v || null);

export const siteSchema = z.object({
  headlineLead: line(),
  headlineEmphasis: optionalLine(),
  footerTagline: line(),
  navHome: line(),
  navServices: line(),
  navGallery: line(),
  navAbout: line(),
  navFaq: line(),
  navContact: line(),
  navPricing: line(),
  navFilms: line(),
  enquireLabel: line(),
  mobileEnquireLabel: line(),
  mobileCallLabel: line(),
  menuLabel: line(),
  callPrompt: line(),
  footerExploreHeading: line(),
  footerContactHeading: line(),
  footerFollowHeading: line(),
  basedInLabel: line(),
  phoneDisplay: phone,
  contactEmail: email,
  addressStreet: optionalLine(),
  addressLocality: line(),
  addressRegion: line(),
  addressPostcode: z
    .string()
    .trim()
    .refine((v) => v === "" || /^[0-9]{4}$/.test(v), "Use a 4-digit postcode, or leave it empty.")
    .transform((v) => v || null),
  instagramUrl: social(/^https:\/\/(www\.)?instagram\.com\/\S*$/, "Instagram"),
  facebookUrl: social(/^https:\/\/(www\.|m\.)?facebook\.com\/\S*$/, "Facebook"),
  tiktokUrl: social(/^https:\/\/(www\.)?tiktok\.com\/\S*$/, "TikTok"),
  formNameLabel: line(),
  formEmailLabel: line(),
  formPhoneLabel: line(),
  formEventTypeLabel: line(),
  formEventDateLabel: line(),
  formVenueLabel: line(),
  formMessageLabel: line(),
  formSubmitLabel: line(),
  formOptionalLabel: line(),
  formSuccessTitle: line(),
  formSuccessText: text(),
});

export type SiteValues = z.input<typeof siteSchema>;

export function siteToRow(v: z.output<typeof siteSchema>): Row {
  const row: Row = {};
  for (const [field, column] of Object.entries(siteColumns)) row[column] = v[field as SiteField];
  return row;
}

export function siteToValues(row: Row): SiteValues {
  const values = {} as Record<SiteField, string>;
  for (const [field, column] of Object.entries(siteColumns)) values[field as SiteField] = str(row[column]);
  return values;
}

// ---------------------------------------------------------------------------
// What the website renders
// ---------------------------------------------------------------------------

/** Telephone link from a displayed Australian number: "0426 071 109" → tel:+61426071109. */
export function phoneHref(display: string): string {
  const digits = display.replace(/\D/g, "");
  if (display.trim().startsWith("+")) return `tel:+${digits}`;
  if (digits.startsWith("0")) return `tel:+61${digits.slice(1)}`;
  return `tel:${digits}`;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface SiteSettings {
  headline: { lead: string; emphasis: string | null };
  footerTagline: string;
  navigation: NavItem[];
  /** Menu links added only when their section has published content (withSectionLinks). */
  sectionLinks: { pricing: NavItem; films: NavItem };
  enquiry: NavItem;
  mobileEnquireLabel: string;
  mobileCallLabel: string;
  menuLabel: string;
  callPrompt: string;
  footerHeadings: { explore: string; contact: string; follow: string };
  basedInLabel: string;
  phone: { display: string; href: string };
  /** Public contact email (null: not shown anywhere). */
  email: { address: string; href: string } | null;
  address: { street: string | null; locality: string; region: string; postcode: string | null };
  socials: { platform: "instagram" | "facebook" | "tiktok"; label: string; href: string }[];
  form: {
    name: string;
    email: string;
    phone: string;
    eventType: string;
    eventDate: string;
    venue: string;
    message: string;
    submit: string;
    optional: string;
    successTitle: string;
    successText: string;
  };
}

// Link destinations are code: labels come from the settings.
const navHrefs = {
  navHome: "/",
  navServices: "/#services",
  navGallery: "/#gallery",
  navAbout: "/#about",
  navFaq: "/#faq",
  navContact: "/#contact",
} as const;

export function settingsFromValues(v: SiteValues): SiteSettings {
  const socials: SiteSettings["socials"] = [];
  if (v.instagramUrl) socials.push({ platform: "instagram", label: "Instagram", href: v.instagramUrl });
  if (v.facebookUrl) socials.push({ platform: "facebook", label: "Facebook", href: v.facebookUrl });
  if (v.tiktokUrl) socials.push({ platform: "tiktok", label: "TikTok", href: v.tiktokUrl });
  return {
    headline: { lead: v.headlineLead, emphasis: v.headlineEmphasis || null },
    footerTagline: v.footerTagline,
    navigation: (Object.keys(navHrefs) as (keyof typeof navHrefs)[]).map((k) => ({ label: v[k], href: navHrefs[k] })),
    sectionLinks: {
      pricing: { label: v.navPricing, href: "/#pricing" },
      films: { label: v.navFilms, href: "/#films" },
    },
    enquiry: { label: v.enquireLabel, href: site.enquiry.href },
    mobileEnquireLabel: v.mobileEnquireLabel,
    mobileCallLabel: v.mobileCallLabel,
    menuLabel: v.menuLabel,
    callPrompt: v.callPrompt,
    footerHeadings: { explore: v.footerExploreHeading, contact: v.footerContactHeading, follow: v.footerFollowHeading },
    basedInLabel: v.basedInLabel,
    phone: { display: v.phoneDisplay, href: phoneHref(v.phoneDisplay) },
    email: v.contactEmail ? { address: v.contactEmail, href: `mailto:${v.contactEmail}` } : null,
    address: {
      street: v.addressStreet || null,
      locality: v.addressLocality,
      region: v.addressRegion,
      postcode: v.addressPostcode || null,
    },
    socials,
    form: {
      name: v.formNameLabel,
      email: v.formEmailLabel,
      phone: v.formPhoneLabel,
      eventType: v.formEventTypeLabel,
      eventDate: v.formEventDateLabel,
      venue: v.formVenueLabel,
      message: v.formMessageLabel,
      submit: v.formSubmitLabel,
      optional: v.formOptionalLabel,
      successTitle: v.formSuccessTitle,
      successText: v.formSuccessText,
    },
  };
}

/** The code defaults (= the seeded row): used without a database or when loading fails. */
export const defaultSiteValues: SiteValues = {
  headlineLead: site.slogan.slice(0, site.slogan.lastIndexOf(" ")),
  headlineEmphasis: site.slogan.slice(site.slogan.lastIndexOf(" ") + 1),
  footerTagline: site.slogan,
  navHome: site.navigation[0].label,
  navServices: site.navigation[1].label,
  navGallery: site.navigation[2].label,
  navAbout: site.navigation[3].label,
  navFaq: site.navigation[4].label,
  navContact: site.navigation[5].label,
  navPricing: "Pricing",
  navFilms: "Films",
  enquireLabel: site.enquiry.label,
  mobileEnquireLabel: "Enquire",
  mobileCallLabel: "Call",
  menuLabel: "Menu",
  callPrompt: "Prefer to talk?",
  footerExploreHeading: "Explore",
  footerContactHeading: "Contact",
  footerFollowHeading: "Follow",
  basedInLabel: "Based in",
  phoneDisplay: site.contact.phone.display,
  contactEmail: site.contact.email ?? "",
  addressStreet: site.contact.address.street ?? "",
  addressLocality: site.contact.address.locality,
  addressRegion: site.contact.address.region,
  addressPostcode: site.contact.address.postcode ?? "",
  instagramUrl: site.socials.find((s) => s.platform === "instagram")?.href ?? "",
  facebookUrl: site.socials.find((s) => s.platform === "facebook")?.href ?? "",
  tiktokUrl: site.socials.find((s) => s.platform === "tiktok")?.href ?? "",
  formNameLabel: "Name",
  formEmailLabel: "Email",
  formPhoneLabel: "Phone",
  formEventTypeLabel: "Type of event",
  formEventDateLabel: "Event date",
  formVenueLabel: "Venue or location",
  formMessageLabel: "Tell us about your celebration",
  formSubmitLabel: "Send enquiry",
  formOptionalLabel: "(optional)",
  formSuccessTitle: "Thank you.",
  formSuccessText: "We've received your enquiry.",
};

export const defaultSiteSettings = settingsFromValues(defaultSiteValues);

/**
 * Site details as the layout and sections render them: text may be a React
 * node (the visual editor passes editable text); links stay plain.
 */
export type SiteCopy = Renderable<SiteSettings>;

/** The full headline as one string (page title, structured data). */
export const headlineText = (s: SiteSettings) =>
  s.headline.emphasis ? `${s.headline.lead} ${s.headline.emphasis}` : s.headline.lead;

/**
 * The menu with Pricing (after Services) and Films (after Gallery) added
 * when those sections have published content, so the menu never points at
 * a section that isn't there.
 */
export function withSectionLinks<T extends SiteCopy>(settings: T, available: { pricing: boolean; films: boolean }): T {
  const navigation = settings.navigation.flatMap((item) => {
    if (item.href === "/#services" && available.pricing) return [item, settings.sectionLinks.pricing];
    if (item.href === "/#gallery" && available.films) return [item, settings.sectionLinks.films];
    return [item];
  });
  return { ...settings, navigation };
}
