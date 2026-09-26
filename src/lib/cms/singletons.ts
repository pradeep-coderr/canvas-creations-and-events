import { z } from "zod";
import { parseVideoLink } from "@/lib/media/video-url";
import { LINE_MAX, line, optionalId, optionalLine, text } from "./fields";

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
  galleryEyebrow: "gallery_eyebrow",
  galleryTitle: "gallery_title",
  galleryEmptyTitle: "gallery_empty_title",
  galleryEmptyText: "gallery_empty_text",
  galleryInstagramCta: "gallery_instagram_cta",
  processEyebrow: "process_eyebrow",
  processTitle: "process_title",
  whyEyebrow: "why_eyebrow",
  testimonialsEyebrow: "testimonials_eyebrow",
  testimonialsTitle: "testimonials_title",
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

// Which fields allow line breaks (cms_text); all others are cms_line.
const homeTextFields = new Set<HomeField>([
  "heroDescription",
  "introBody",
  "servicesDescription",
  "galleryEmptyText",
  "enquiryDescription",
  "contactDescription",
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
  return row;
}

export function homeToValues(row: Row): HomeValues {
  const lines = Array.isArray(row.why_title_lines) ? row.why_title_lines.map(str) : [];
  const values = {
    heroImageId: str(row.hero_image_id),
    whyTitleLines: [lines[0] ?? "", lines[1] ?? "", lines[2] ?? ""] as [string, string, string],
  } as HomeValues;
  for (const [field, column] of Object.entries(homeColumns)) values[field as HomeField] = str(row[column]);
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

/** Where the video comes from ("none" = no video). */
export const videoSources = ["none", "youtube", "vimeo", "stream"] as const;
export type VideoSource = (typeof videoSources)[number];

export const videoSourceLabels: Record<VideoSource, string> = {
  none: "No video",
  youtube: "YouTube",
  vimeo: "Vimeo",
  stream: "Uploaded video",
};

/*
 * YouTube / Vimeo: the admin pastes a link; the server normalizes it into a
 * media library entry (media_assets, provider + id) and points the section
 * at it. Uploaded video ("stream") picks an existing provider video and is
 * refused by the server while no provider is configured.
 */
export const videoSchema = z
  .object({
    eyebrow: line(),
    title: line(),
    emptyText: text(),
    tiktokCta: line(),
    provider: z.enum(videoSources),
    videoUrl: z.string().trim().max(500, "Keep this to 500 characters or fewer."),
    videoMediaId: optionalId(),
    posterId: optionalId(),
    videoTitle: optionalLine(),
    caption: optionalLine(),
  })
  .superRefine((v, ctx) => {
    const need = (path: string, message: string) => ctx.addIssue({ code: "custom", path: [path], message });
    if (v.provider === "none") return;
    if (!v.videoTitle) need("videoTitle", "Describe the video for screen readers.");
    if (v.provider === "stream") {
      if (!v.videoMediaId) need("videoMediaId", "Choose the uploaded video.");
      return;
    }
    const link = parseVideoLink(v.videoUrl, v.provider);
    if (!link.ok) need("videoUrl", link.error);
  });

export type VideoValues = z.input<typeof videoSchema>;

/**
 * Only the fields that belong to the chosen source are kept (the rest are
 * NULL). `videoMediaId` is the library entry the server resolved.
 */
export function videoToRow(v: z.output<typeof videoSchema>, videoMediaId: string | null): Row {
  const base = { eyebrow: v.eyebrow, title: v.title, empty_text: v.emptyText, tiktok_cta: v.tiktokCta };
  const none = { video_media_id: null, poster_id: null, embed_url: null, video_title: null, caption: null };
  if (v.provider === "none") return { ...base, provider: null, ...none };
  return {
    ...base,
    ...none,
    provider: v.provider,
    video_media_id: videoMediaId,
    poster_id: v.posterId,
    video_title: v.videoTitle,
    caption: v.caption,
  };
}

/** `row.video` is the linked media entry (provider + source link), if any. */
export const videoToValues = (row: Row): VideoValues => {
  const video = row.video as { source_url?: string | null } | null | undefined;
  return {
    eyebrow: str(row.eyebrow),
    title: str(row.title),
    emptyText: str(row.empty_text),
    tiktokCta: str(row.tiktok_cta),
    provider: (videoSources as readonly string[]).includes(str(row.provider)) ? (row.provider as VideoSource) : "none",
    videoUrl: str(video?.source_url),
    videoMediaId: str(row.video_media_id),
    posterId: str(row.poster_id),
    videoTitle: str(row.video_title),
    caption: str(row.caption),
  };
};

/** Select for video_story including its media link (for videoToValues). */
export const VIDEO_STORY_SELECT = "*, video:media_assets!video_story_video_provider_fkey(source_url)";
