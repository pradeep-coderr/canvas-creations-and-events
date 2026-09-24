import type { z } from "zod";
import type { HomeSectionKey } from "@/components/home/home-sections";
import type { CollectionKey } from "@/lib/cms/collections";
import { aboutSchema, homeSchema, videoSchema } from "@/lib/cms/singletons";

/*
 * What the visual editor can change, section by section. Every entry maps a
 * spot on the page to an existing CMS field (the form-value names used by
 * src/lib/cms/singletons.ts and the Phase 14 server actions). Labels are
 * what the client sees; table and column names never reach the UI.
 *
 * Not listed = not editable here, deliberately: the hero headline (the
 * business slogan), navigation, phone/social links, link targets and the
 * enquiry form's own labels are part of the website's code (Phase 13).
 */

export type EditorScope = "home" | "about" | "video";
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
}

const home = (field: string, label: string, kind: FieldKind = "line", hint?: string): EditableField => ({
  scope: "home",
  field,
  label,
  kind,
  hint,
});

export const sections: Record<HomeSectionKey, SectionDef> = {
  hero: {
    title: "Hero",
    fields: [
      home("heroEyebrow", "Hero label"),
      home("heroDescription", "Hero text", "text"),
      home("heroSecondaryCtaLabel", "Second button text", "line", "The button takes visitors to the gallery."),
    ],
    note: "The headline is the business slogan and isn't edited here.",
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
  gallery: {
    title: "Gallery",
    collection: "gallery",
    fields: [
      home("galleryEyebrow", "Gallery label"),
      home("galleryTitle", "Gallery heading", "line", "Shown once there are photos."),
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
    title: "Video",
    fields: [
      { scope: "video", field: "eyebrow", label: "Video label", kind: "line" },
      { scope: "video", field: "title", label: "Video heading", kind: "line" },
      { scope: "video", field: "emptyText", label: "Text while there's no video", kind: "text" },
      { scope: "video", field: "tiktokCta", label: "TikTok link text", kind: "line" },
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
    ],
    note: "The form's own labels and messages are part of the website and aren't edited here.",
  },
  contact: {
    title: "Contact",
    fields: [
      home("contactEyebrow", "Contact label"),
      home("contactTitle", "Contact heading"),
      home("contactDescription", "Contact text", "text"),
    ],
    note: "The phone number and social links are part of the business details.",
  },
};

/** Look up a field's definition (for labels and kinds). */
export function fieldDef(scope: EditorScope, field: string): EditableField | undefined {
  for (const section of Object.values(sections)) {
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
};

/** The first problem with a single field's value, or null. */
export function validateField(scope: EditorScope, field: string, value: unknown): string | null {
  const schema = shapes[scope][field];
  if (!schema) return null;
  const result = schema.safeParse(value);
  return result.success ? null : (result.error.issues[0]?.message ?? "Check this field.");
}
