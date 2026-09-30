import type { z } from "zod";
import type { HomeSectionKey } from "@/components/home/home-sections";
import type { CollectionKey } from "@/lib/cms/collections";
import type { StyleKey } from "@/lib/styles/schema";
import { siteSchema } from "@/lib/cms/site-settings";
import { aboutSchema, homeSchema, videoSchema } from "@/lib/cms/singletons";

/*
 * What the visual editor can change, section by section. Every entry maps a
 * spot on the page to an existing CMS field (the form-value names used by
 * src/lib/cms/singletons.ts and the Phase 14 server actions). Labels are
 * what the client sees; table and column names never reach the UI.
 *
 * Site details (scope "site", Phase 18): the headline, navigation and
 * button labels, phone, address, social links, footer text and the enquiry
 * form's wording. Not editable here, deliberately: link destinations, the
 * business name, and the form's validation and status messages (code).
 */

export type EditorScope = "home" | "about" | "video" | "site";
/** line: one line · text: paragraph · lines: 1–3 heading lines · paragraphs: blank-line separated */
export type FieldKind = "line" | "text" | "lines" | "paragraphs";

export interface EditableField {
  scope: EditorScope;
  field: string;
  label: string;
  kind: FieldKind;
  optional?: boolean;
  hint?: string;
}

export interface SectionDef {
  title: string;
  fields: EditableField[];
  /** The list shown in this section, edited item by item on the page. */
  collection?: CollectionKey;
  note?: string;
  /**
   * Text styles for parts every item shares (package titles, film captions…),
   * set once for the whole list in the section panel.
   */
  styleKeys?: { key: StyleKey; label: string }[];
}

const home = (field: string, label: string, kind: FieldKind = "line", hint?: string): EditableField => ({
  scope: "home",
  field,
  label,
  kind,
  hint,
});

const siteField = (field: string, label: string, hint?: string, extra: Partial<EditableField> = {}): EditableField => ({
  scope: "site",
  field,
  label,
  kind: "line",
  hint,
  ...extra,
});

const MAIN_BUTTON_HINT = "The Enquire button in the header, the hero, the mobile menu and the footer.";
const PHONE_HINT = "Shown everywhere on the website and in Google's business details. The call link is made from it.";

export const sections: Record<HomeSectionKey, SectionDef> = {
  hero: {
    title: "Hero",
    fields: [
      home("heroEyebrow", "Hero label"),
      siteField("headlineLead", "Headline", "Also used in the page title for Google and social media."),
      siteField("headlineEmphasis", "Headline ending (italic rose)", "Shown after the headline in italic rose, e.g. “masterpieces”. Leave empty for none.", { optional: true }),
      home("heroDescription", "Hero text", "text"),
      siteField("enquireLabel", "Main button text", MAIN_BUTTON_HINT),
      home("heroSecondaryCtaLabel", "Second button text", "line", "The button takes visitors to the gallery."),
      siteField("callPrompt", "Call prompt", "Before the phone link, e.g. “Prefer to talk?”."),
      siteField("mobileCallLabel", "Call link text", "Before the number, e.g. “Call”. Also on the mobile bar and in Contact."),
      siteField("phoneDisplay", "Phone number", PHONE_HINT),
    ],
  },
  intro: {
    title: "Introduction",
    fields: [
      home("introEyebrow", "Introduction label"),
      home("introTitle", "Introduction heading"),
      home("introBody", "Introduction text", "text"),
    ],
  },
  services: {
    title: "Services",
    collection: "services",
    fields: [
      home("servicesEyebrow", "Services label"),
      home("servicesTitle", "Services heading"),
      home("servicesDescription", "Services text", "text"),
      home("servicesEnquiryTitle", "Enquiry prompt heading", "line", "The link under the services that goes to the enquiry form."),
      home("servicesEnquiryText", "Enquiry prompt text"),
    ],
  },
  categories: {
    title: "Categories",
    collection: "categories",
    fields: [home("categoriesEyebrow", "Categories label"), home("categoriesTitle", "Categories heading")],
    note: "Only shown on the website when at least one category is published.",
  },
  pricing: {
    title: "Pricing",
    collection: "pricing",
    fields: [
      home("pricingEyebrow", "Pricing label"),
      home("pricingTitle", "Pricing heading"),
      { ...home("pricingDescription", "Text under the heading", "text"), optional: true },
    ],
    note: "Visitors see this section only once a package is published. Prices are in Australian dollars.",
    styleKeys: [
      { key: "pricing.packageTitle", label: "Package names" },
      { key: "pricing.packagePrice", label: "Prices" },
      { key: "pricing.packageBody", label: "Package text and features" },
      { key: "pricing.cta", label: "Package buttons" },
    ],
  },
  gallery: {
    title: "Gallery",
    collection: "gallery",
    fields: [
      home("galleryEyebrow", "Gallery label"),
      home("galleryTitle", "Gallery heading", "line", "Shown once there are photos."),
      { ...home("galleryIntro", "Text under the heading", "text"), optional: true },
      home("galleryFilterAll", "First filter button", "line", "Shown when photos are in three or more categories."),
      home("galleryEmptyTitle", "Heading while there are no photos"),
      home("galleryEmptyText", "Text while there are no photos", "text"),
      home("galleryInstagramCta", "Instagram link text"),
    ],
  },
  about: {
    title: "About",
    fields: [
      { scope: "about", field: "eyebrow", label: "About label", kind: "line" },
      { scope: "about", field: "title", label: "About heading", kind: "line" },
      { scope: "about", field: "body", label: "About story", kind: "paragraphs", hint: "Separate paragraphs with a blank line. Up to six." },
      { scope: "about", field: "ctaLabel", label: "About link text", kind: "line", hint: "The link takes visitors to the enquiry form." },
      { scope: "about", field: "founderName", label: "Founder name", kind: "line", optional: true, hint: "Shown under the story once a name is saved." },
      { scope: "about", field: "founderRole", label: "Founder role", kind: "line", optional: true, hint: "For example, Founder & stylist." },
    ],
  },
  process: {
    title: "Process",
    collection: "process",
    fields: [home("processEyebrow", "Process label"), home("processTitle", "Process heading")],
  },
  testimonials: {
    title: "Testimonials",
    collection: "testimonials",
    fields: [
      home("testimonialsEyebrow", "Testimonials label"),
      home("testimonialsTitle", "Testimonials heading", "line", "Not shown visually; read out by screen readers."),
    ],
    note: "Only shown on the website when at least one testimonial is published and featured.",
  },
  whyCanvas: {
    title: "Why Canvas",
    collection: "principles",
    fields: [home("whyEyebrow", "Why Canvas label"), home("whyTitleLines", "Why Canvas heading", "lines")],
  },
  video: {
    title: "Films",
    collection: "films",
    fields: [
      { scope: "video", field: "eyebrow", label: "Films label", kind: "line" },
      { scope: "video", field: "title", label: "Films heading", kind: "line" },
      { scope: "video", field: "emptyText", label: "Text while there are no films (editor only)", kind: "text" },
      { scope: "video", field: "tiktokCta", label: "TikTok link text", kind: "line" },
    ],
    note: "Visitors see this section only once a film is published. Films use YouTube or Vimeo videos from the media library.",
    styleKeys: [
      { key: "films.title", label: "Film titles" },
      { key: "films.caption", label: "Film captions" },
    ],
  },
  faq: {
    title: "FAQ",
    collection: "faqs",
    fields: [home("faqEyebrow", "FAQ label"), home("faqTitle", "FAQ heading")],
  },
  enquiry: {
    title: "Enquiry",
    fields: [
      home("enquiryEyebrow", "Enquiry label"),
      home("enquiryTitle", "Enquiry heading"),
      home("enquiryDescription", "Enquiry text", "text"),
      siteField("formNameLabel", "Form: name label"),
      siteField("formEmailLabel", "Form: email label"),
      siteField("formPhoneLabel", "Form: phone label"),
      siteField("formEventTypeLabel", "Form: event type label"),
      siteField("formEventDateLabel", "Form: event date label"),
      siteField("formVenueLabel", "Form: venue label"),
      siteField("formMessageLabel", "Form: message label"),
      siteField("formOptionalLabel", "Form: optional marker", "Shown after optional fields, e.g. “(optional)”."),
      siteField("formSubmitLabel", "Form: send button"),
      siteField("formSuccessTitle", "Thank-you heading", "Shown after an enquiry is sent."),
      siteField("formSuccessText", "Thank-you text", undefined, { kind: "text" }),
    ],
    note: "The form's error and status messages stay as they are, so they always explain what happened.",
  },
  contact: {
    title: "Contact",
    fields: [
      home("contactEyebrow", "Contact label"),
      home("contactTitle", "Contact heading"),
      home("contactDescription", "Contact text", "text"),
      siteField("phoneDisplay", "Phone number", PHONE_HINT),
      siteField("basedInLabel", "“Based in” label"),
      siteField("addressStreet", "Street", "Leave empty to show only the area.", { optional: true }),
      siteField("addressLocality", "City or suburb"),
      siteField("addressRegion", "State"),
      siteField("addressPostcode", "Postcode", undefined, { optional: true }),
      siteField("instagramUrl", "Instagram link", "Leave empty to hide Instagram everywhere.", { optional: true }),
      siteField("facebookUrl", "Facebook link", "Leave empty to hide Facebook everywhere.", { optional: true }),
      siteField("tiktokUrl", "TikTok link", "Leave empty to hide TikTok everywhere.", { optional: true }),
    ],
    note: "The phone number, address and links are also used in the header, footer and Google's business details.",
  },
};

/** The header and footer (site details), edited from the editor toolbar. */
export const chromeSection: SectionDef = {
  title: "Header & footer",
  fields: [
    siteField("navHome", "Menu: Home"),
    siteField("navServices", "Menu: Services"),
    siteField("navPricing", "Menu: Pricing", "Shown only while a package is published."),
    siteField("navGallery", "Menu: Gallery"),
    siteField("navFilms", "Menu: Films", "Shown only while a film is published."),
    siteField("navAbout", "Menu: About"),
    siteField("navFaq", "Menu: FAQ"),
    siteField("navContact", "Menu: Contact"),
    siteField("enquireLabel", "Main button text", MAIN_BUTTON_HINT),
    siteField("menuLabel", "Mobile menu button", "The button that opens the menu on phones."),
    siteField("mobileEnquireLabel", "Mobile bar: enquire button"),
    siteField("mobileCallLabel", "Call link text", "Before the number, e.g. “Call”. Also on the mobile bar and in Contact."),
    siteField("footerTagline", "Footer tagline"),
    siteField("footerExploreHeading", "Footer: menu heading"),
    siteField("footerContactHeading", "Footer: contact heading"),
    siteField("footerFollowHeading", "Footer: social heading", "Also the “Follow” label in Contact."),
    siteField("phoneDisplay", "Phone number", PHONE_HINT),
  ],
  note: "Link destinations stay as they are; only the wording changes.",
};

/** Look up a field's definition (for labels and kinds). */
export function fieldDef(scope: EditorScope, field: string): EditableField | undefined {
  for (const section of [...Object.values(sections), chromeSection]) {
    const found = section.fields.find((f) => f.scope === scope && f.field === field);
    if (found) return found;
  }
  return undefined;
}

// Field-level rules come straight from the Phase 14 schemas (which mirror
// the database), so the editor can't be looser than /admin/content.
const shapes: Record<EditorScope, Record<string, z.ZodType>> = {
  home: homeSchema.shape,
  about: aboutSchema.shape,
  video: videoSchema.shape,
  site: siteSchema.shape,
};

/** The first problem with a single field's value, or null. */
export function validateField(scope: EditorScope, field: string, value: unknown): string | null {
  const schema = shapes[scope][field];
  if (!schema) return null;
  const result = schema.safeParse(value);
  return result.success ? null : (result.error.issues[0]?.message ?? "Check this field.");
}
