import { z } from "zod";
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

export const videoProviders = ["none", "upload", "youtube", "vimeo"] as const;
export type VideoProvider = (typeof videoProviders)[number];

export const videoProviderLabels: Record<VideoProvider, string> = {
  none: "No video",
  upload: "Uploaded video file",
  youtube: "YouTube",
  vimeo: "Vimeo",
};

// Same hosts as the video_story_video_check constraint.
const EMBED_HOSTS: Record<"youtube" | "vimeo", RegExp> = {
  youtube: /^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com|youtu\.be)\/\S+$/,
  vimeo: /^https:\/\/(player\.)?vimeo\.com\/\S+$/,
};

export const videoSchema = z
  .object({
    eyebrow: line(),
    title: line(),
    emptyText: text(),
    tiktokCta: line(),
    provider: z.enum(videoProviders),
    videoMediaId: optionalId(),
    posterId: optionalId(),
    embedUrl: z.string().trim().max(500, "Keep this to 500 characters or fewer."),
    videoTitle: optionalLine(),
    caption: optionalLine(),
  })
  .superRefine((v, ctx) => {
    const need = (path: string, message: string) => ctx.addIssue({ code: "custom", path: [path], message });
    if (v.provider === "none") return;
    if (!v.videoTitle) need("videoTitle", "Describe the video for screen readers.");
    if (v.provider === "upload") {
      if (!v.videoMediaId) need("videoMediaId", "Choose the video file.");
      if (!v.posterId) need("posterId", "Choose a poster image.");
    } else if (!EMBED_HOSTS[v.provider].test(v.embedUrl)) {
      need(
        "embedUrl",
        v.provider === "youtube"
          ? "Paste a YouTube link, e.g. https://www.youtube.com/watch?v=…"
          : "Paste a Vimeo link, e.g. https://vimeo.com/…",
      );
    }
  });

export type VideoValues = z.input<typeof videoSchema>;

/** Only the fields that belong to the chosen provider are kept (the rest are NULL). */
export function videoToRow(v: z.output<typeof videoSchema>): Row {
  const base = { eyebrow: v.eyebrow, title: v.title, empty_text: v.emptyText, tiktok_cta: v.tiktokCta };
  const none = { video_media_id: null, poster_id: null, embed_url: null, video_title: null, caption: null };
  if (v.provider === "none") return { ...base, provider: null, ...none };
  if (v.provider === "upload")
    return {
      ...base,
      ...none,
      provider: "upload",
      video_media_id: v.videoMediaId,
      poster_id: v.posterId,
      video_title: v.videoTitle,
      caption: v.caption,
    };
  return { ...base, ...none, provider: v.provider, embed_url: v.embedUrl, video_title: v.videoTitle, caption: v.caption };
}

export const videoToValues = (row: Row): VideoValues => ({
  eyebrow: str(row.eyebrow),
  title: str(row.title),
  emptyText: str(row.empty_text),
  tiktokCta: str(row.tiktok_cta),
  provider: (videoProviders as readonly string[]).includes(str(row.provider)) ? (row.provider as VideoProvider) : "none",
  videoMediaId: str(row.video_media_id),
  posterId: str(row.poster_id),
  embedUrl: str(row.embed_url),
  videoTitle: str(row.video_title),
  caption: str(row.caption),
});
