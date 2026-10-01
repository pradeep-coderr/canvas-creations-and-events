import { z } from "zod";
import { LINE_MAX, line, optionalId, optionalLine, optionalText, text } from "./fields";

/*
 * The one-row content tables: home_content, about_content, video_story.
 * Schemas mirror their columns and constraints; the mapping converts
 * between form values and rows. The row's `id` (always true) is never
 * part of a form.
 */

type Row = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" ? v : "");

// ---------------------------------------------------------------------------
// Homepage (home_content)
// ---------------------------------------------------------------------------

// Form field → column. Everything in home_content except the image and the
// "Why Canvas" title lines, which are handled separately below.
const homeColumns = {
  heroEyebrow: "hero_eyebrow",
  heroDescription: "hero_description",
  heroSecondaryCtaLabel: "hero_secondary_cta_label",
  introEyebrow: "intro_eyebrow",
  introTitle: "intro_title",
  introBody: "intro_body",
  servicesEyebrow: "services_eyebrow",
  servicesTitle: "services_title",
  servicesDescription: "services_description",
  servicesEnquiryTitle: "services_enquiry_title",
  servicesEnquiryText: "services_enquiry_text",
  categoriesEyebrow: "categories_eyebrow",
  categoriesTitle: "categories_title",
  pricingEyebrow: "pricing_eyebrow",
  pricingTitle: "pricing_title",
  galleryEyebrow: "gallery_eyebrow",
  galleryTitle: "gallery_title",
  galleryEmptyTitle: "gallery_empty_title",
  galleryEmptyText: "gallery_empty_text",
  galleryInstagramCta: "gallery_instagram_cta",
  galleryFilterAll: "gallery_filter_all",
  storiesEyebrow: "stories_eyebrow",
  storiesTitle: "stories_title",
  sampleNotice: "sample_notice",
  processEyebrow: "process_eyebrow",
  processTitle: "process_title",
  whyEyebrow: "why_eyebrow",
  testimonialsEyebrow: "testimonials_eyebrow",
  testimonialsTitle: "testimonials_title",
  reviewsEyebrow: "reviews_eyebrow",
  reviewsTitle: "reviews_title",
  reviewsDescription: "reviews_description",
  reviewsEmptyText: "reviews_empty_text",
  reviewsCtaLabel: "reviews_cta_label",
  faqEyebrow: "faq_eyebrow",
  faqTitle: "faq_title",
  enquiryEyebrow: "enquiry_eyebrow",
  enquiryTitle: "enquiry_title",
  enquiryDescription: "enquiry_description",
  contactEyebrow: "contact_eyebrow",
  contactTitle: "contact_title",
  contactDescription: "contact_description",
} as const;

type HomeField = keyof typeof homeColumns;

// Optional home_content text (empty saves as NULL, and nothing is shown).
const homeOptionalColumns = {
  pricingDescription: "pricing_description",
  galleryIntro: "gallery_intro",
} as const;
type HomeOptionalField = keyof typeof homeOptionalColumns;

// Which fields allow line breaks (cms_text); all others are cms_line.
const homeTextFields = new Set<HomeField>([
  "heroDescription",
  "introBody",
  "servicesDescription",
  "galleryEmptyText",
  "sampleNotice",
  "enquiryDescription",
  "contactDescription",
  "reviewsDescription",
  "reviewsEmptyText",
]);

const titleLine = z
  .string()
  .trim()
  .max(LINE_MAX, `Keep this to ${LINE_MAX} characters or fewer.`)
  .regex(/^[^\r\n]*$/, "Keep this on one line.");

export const homeSchema = z.object({
  ...(Object.fromEntries(
    (Object.keys(homeColumns) as HomeField[]).map((f) => [f, homeTextFields.has(f) ? text() : line()]),
  ) as Record<HomeField, ReturnType<typeof line>>),
  pricingDescription: optionalText(),
  galleryIntro: optionalText(),
  heroImageId: optionalId(),
  // Up to three lines (why_title_lines: 1–3, no blanks). Empty lines are dropped.
  whyTitleLines: z
    .tuple([titleLine, titleLine, titleLine])
    .superRefine((lines, ctx) => {
      if (!lines.some(Boolean)) ctx.addIssue({ code: "custom", path: [0], message: "Add at least one line." });
    })
    .transform((lines) => lines.filter(Boolean)),
});

export type HomeValues = z.input<typeof homeSchema>;

export function homeToRow(v: z.output<typeof homeSchema>): Row {
  const row: Row = { hero_image_id: v.heroImageId, why_title_lines: v.whyTitleLines };
  for (const [field, column] of Object.entries(homeColumns)) row[column] = v[field as HomeField];
  for (const [field, column] of Object.entries(homeOptionalColumns)) row[column] = v[field as HomeOptionalField];
  return row;
}

export function homeToValues(row: Row): HomeValues {
  const lines = Array.isArray(row.why_title_lines) ? row.why_title_lines.map(str) : [];
  const values = {
    heroImageId: str(row.hero_image_id),
    whyTitleLines: [lines[0] ?? "", lines[1] ?? "", lines[2] ?? ""] as [string, string, string],
  } as HomeValues;
  for (const [field, column] of Object.entries(homeColumns)) values[field as HomeField] = str(row[column]);
  for (const [field, column] of Object.entries(homeOptionalColumns)) values[field as HomeOptionalField] = str(row[column]);
  return values;
}

// ---------------------------------------------------------------------------
// About (about_content)
// ---------------------------------------------------------------------------

/** Paragraphs are separated by a blank line in the editor. */
export const paragraphsFromText = (value: string) =>
  value
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

export const aboutSchema = z.object({
  eyebrow: line(),
  title: line(),
  // about_content.body: 1–6 paragraphs, each cms_text.
  body: z
    .string()
    .superRefine((value, ctx) => {
      const paragraphs = paragraphsFromText(value);
      if (paragraphs.length === 0) ctx.addIssue({ code: "custom", message: "This is required." });
      if (paragraphs.length > 6) ctx.addIssue({ code: "custom", message: "Use six paragraphs or fewer." });
      if (paragraphs.some((p) => p.length > 2000))
        ctx.addIssue({ code: "custom", message: "Keep each paragraph to 2000 characters or fewer." });
    })
    .transform(paragraphsFromText),
  founderName: optionalLine(),
  founderRole: optionalLine(),
  imageId: optionalId(),
  ctaLabel: line(),
});

export type AboutValues = z.input<typeof aboutSchema>;

export const aboutToRow = (v: z.output<typeof aboutSchema>): Row => ({
  eyebrow: v.eyebrow,
  title: v.title,
  body: v.body,
  founder_name: v.founderName,
  founder_role: v.founderRole,
  image_id: v.imageId,
  cta_label: v.ctaLabel,
});

export const aboutToValues = (row: Row): AboutValues => ({
  eyebrow: str(row.eyebrow),
  title: str(row.title),
  body: (Array.isArray(row.body) ? row.body.map(str) : []).join("\n\n"),
  founderName: str(row.founder_name),
  founderRole: str(row.founder_role),
  imageId: str(row.image_id),
  ctaLabel: str(row.cta_label),
});

// ---------------------------------------------------------------------------
// Video / story (video_story)
// ---------------------------------------------------------------------------

/*
 * The Films section's wording. Since Phase 22 the videos themselves are the
 * films list (public.films); the old single-video columns stay NULL.
 */
export const videoSchema = z.object({
  eyebrow: line(),
  title: line(),
  emptyText: text(),
  tiktokCta: line(),
});

export type VideoValues = z.input<typeof videoSchema>;

export function videoToRow(v: z.output<typeof videoSchema>): Row {
  return { eyebrow: v.eyebrow, title: v.title, empty_text: v.emptyText, tiktok_cta: v.tiktokCta };
}

export const videoToValues = (row: Row): VideoValues => ({
  eyebrow: str(row.eyebrow),
  title: str(row.title),
  emptyText: str(row.empty_text),
  tiktokCta: str(row.tiktok_cta),
});

/** Select for video_story (its wording). */
export const VIDEO_STORY_SELECT = "eyebrow, title, empty_text, tiktok_cta";
