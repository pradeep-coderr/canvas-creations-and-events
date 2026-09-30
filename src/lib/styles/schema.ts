import { z } from "zod";

/*
 * Page styles: controlled presets the admin can set in the visual editor.
 * Text styles are keyed by the editable field ("<scope>.<field>") and reach
 * the page through a `data-sk` attribute on the element that shows that
 * text; section styles are keyed by homepage section. Every value is a
 * choice from the lists below and becomes CSS from the recipes in this file
 * — never free-form CSS. Colours are theme tokens only (main text, muted
 * text, rose), which the Design page already guarantees are readable on
 * every background, including dark sections.
 *
 * Shared by the editor (client) and the server; no server-only imports.
 */

export const textSizes = ["sm", "base", "lead", "display-sm", "display-md", "display-lg", "display-xl"] as const;
export const textFonts = ["display", "sans"] as const;
export const textWeights = ["300", "400", "500", "600", "700"] as const;
export const textColors = ["main", "muted", "rose"] as const;
export const textStyles = ["normal", "italic"] as const;
export const textAligns = ["start", "center", "end"] as const;
export const sectionTones = ["default", "ivory", "blush", "dark"] as const;
export const sectionSpacings = ["compact", "normal", "spacious"] as const;

/** Text on the page that can be styled: the `data-sk` keys the components render. */
export const STYLE_KEYS = [
  "home.heroEyebrow",
  "site.headlineLead",
  "site.headlineEmphasis",
  "home.heroDescription",
  "site.callPrompt",
  "home.introEyebrow",
  "home.introTitle",
  "home.introBody",
  "home.servicesEyebrow",
  "home.servicesTitle",
  "home.servicesDescription",
  "home.categoriesEyebrow",
  "home.categoriesTitle",
  "home.pricingEyebrow",
  "home.pricingTitle",
  "home.pricingDescription",
  // Every package's parts (no per-package styles: one look for the list).
  "pricing.packageTitle",
  "pricing.packagePrice",
  "pricing.packageBody",
  "pricing.cta",
  "home.galleryEyebrow",
  "home.galleryTitle",
  "home.galleryEmptyTitle",
  "home.galleryEmptyText",
  "home.galleryIntro",
  "gallery.filter",
  "home.storiesEyebrow",
  "home.storiesTitle",
  "home.sampleNotice",
  // Every story's parts (one look for the list).
  "stories.category",
  "stories.title",
  "stories.body",
  "stories.quote",
  "about.eyebrow",
  "about.title",
  "about.body",
  "about.founderName",
  "about.founderRole",
  "home.processEyebrow",
  "home.processTitle",
  "home.testimonialsEyebrow",
  "home.whyEyebrow",
  "home.whyTitleLines",
  "video.eyebrow",
  "video.title",
  "video.emptyText",
  "films.title",
  "films.caption",
  "home.faqEyebrow",
  "home.faqTitle",
  "home.enquiryEyebrow",
  "home.enquiryTitle",
  "home.enquiryDescription",
  "home.contactEyebrow",
  "home.contactTitle",
  "home.contactDescription",
  "site.basedInLabel",
  "site.footerTagline",
  "site.footerExploreHeading",
  "site.footerContactHeading",
  "site.footerFollowHeading",
] as const;
export type StyleKey = (typeof STYLE_KEYS)[number];
export const isStyleKey = (key: string): key is StyleKey => (STYLE_KEYS as readonly string[]).includes(key);

export const SECTION_KEYS = [
  "hero",
  "intro",
  "services",
  "pricing",
  "categories",
  "gallery",
  "stories",
  "about",
  "process",
  "testimonials",
  "whyCanvas",
  "video",
  "faq",
  "enquiry",
  "contact",
] as const;
export type SectionStyleKey = (typeof SECTION_KEYS)[number];

export const textStyleSchema = z
  .object({
    size: z.enum(textSizes).optional(),
    font: z.enum(textFonts).optional(),
    weight: z.enum(textWeights).optional(),
    color: z.enum(textColors).optional(),
    style: z.enum(textStyles).optional(),
    align: z.enum(textAligns).optional(),
  })
  .strict();
export type TextStyle = z.infer<typeof textStyleSchema>;

export const sectionStyleSchema = z
  .object({
    tone: z.enum(sectionTones).optional(),
    spacing: z.enum(sectionSpacings).optional(),
  })
  .strict();
export type SectionStyle = z.infer<typeof sectionStyleSchema>;

export const pageStylesSchema = z
  .object({
    text: z.partialRecord(z.enum(STYLE_KEYS), textStyleSchema),
    sections: z.partialRecord(z.enum(SECTION_KEYS), sectionStyleSchema),
  })
  .strict();
export type PageStyles = z.infer<typeof pageStylesSchema>;

export const emptyPageStyles: PageStyles = { text: {}, sections: {} };

/** Drop empty entries so "reset" leaves nothing behind. */
export function compactStyles(styles: PageStyles): PageStyles {
  const text: PageStyles["text"] = {};
  for (const [k, v] of Object.entries(styles.text)) {
    const clean = Object.fromEntries(Object.entries(v ?? {}).filter(([, x]) => x !== undefined));
    if (Object.keys(clean).length) text[k as StyleKey] = clean as TextStyle;
  }
  const sections: PageStyles["sections"] = {};
  for (const [k, v] of Object.entries(styles.sections)) {
    const clean = Object.fromEntries(Object.entries(v ?? {}).filter(([, x]) => x !== undefined && x !== "normal"));
    if (Object.keys(clean).length) sections[k as SectionStyleKey] = clean as SectionStyle;
  }
  return { text, sections };
}

/** A stored row → validated styles; anything malformed is ignored. */
export function rowToStyles(row: { text_styles?: unknown; section_styles?: unknown } | null | undefined): PageStyles {
  const parsed = pageStylesSchema.safeParse({ text: row?.text_styles ?? {}, sections: row?.section_styles ?? {} });
  return parsed.success ? parsed.data : emptyPageStyles;
}

// ---------------------------------------------------------------------------
// Labels (what the admin sees)
// ---------------------------------------------------------------------------

export const styleLabels = {
  size: {
    sm: "Small",
    base: "Body",
    lead: "Large body",
    "display-sm": "Heading S",
    "display-md": "Heading M",
    "display-lg": "Heading L",
    "display-xl": "Heading XL",
  },
  font: { display: "Serif (Cormorant)", sans: "Sans (Manrope)" },
  weight: { "300": "Light", "400": "Regular", "500": "Medium", "600": "Semibold", "700": "Bold" },
  color: { main: "Main text", muted: "Muted", rose: "Rose" },
  style: { normal: "Upright", italic: "Italic" },
  align: { start: "Left", center: "Centre", end: "Right" },
  tone: { default: "Page background", ivory: "Ivory", blush: "Blush", dark: "Dark" },
  spacing: { compact: "Compact", normal: "Normal", spacious: "Spacious" },
} as const;

// ---------------------------------------------------------------------------
// CSS (text styles). Section styles are static rules in globals.css switched
// by attributes, so they need no generated CSS.
// ---------------------------------------------------------------------------

// Mirrors the type scale in globals.css (@theme).
const sizeRecipe: Record<(typeof textSizes)[number], string> = {
  sm: "font-size:0.875rem;line-height:1.5;",
  base: "font-size:1rem;line-height:1.625;",
  lead: "font-size:clamp(1.0625rem,1rem + 0.3vw,1.25rem);line-height:1.65;",
  "display-sm": "font-size:clamp(1.375rem,1.25rem + 0.5vw,1.75rem);line-height:1.25;",
  "display-md": "font-size:clamp(1.75rem,1.45rem + 1.2vw,2.5rem);line-height:1.15;",
  "display-lg": "font-size:clamp(2.25rem,1.7rem + 2.2vw,3.75rem);line-height:1.08;letter-spacing:-0.01em;",
  "display-xl": "font-size:clamp(2.75rem,1.6rem + 4.2vw,5.25rem);line-height:1.04;letter-spacing:-0.015em;",
};
// next/font variables (set on <html> in the root layout), with the same fallbacks as globals.css.
const fontRecipe = {
  display: "font-family:var(--font-cormorant),ui-serif,Georgia,serif;",
  sans: "font-family:var(--font-manrope),ui-sans-serif,system-ui,sans-serif;",
} as const;
// Semantic tokens: they re-map inside dark sections, so these stay readable there.
const colorRecipe = { main: "color:var(--foreground);", muted: "color:var(--muted-foreground);", rose: "color:var(--primary);" } as const;
const alignRecipe = { start: "text-align:start;", center: "text-align:center;", end: "text-align:end;" } as const;

/** CSS for the text styles. Keys and values are validated enums, so nothing can be injected. */
export function textStylesCss(input: PageStyles["text"]): string {
  const parsed = pageStylesSchema.shape.text.parse(input);
  let css = "";
  for (const [key, s] of Object.entries(parsed)) {
    if (!s || !isStyleKey(key)) continue;
    const decl =
      (s.size ? sizeRecipe[s.size] : "") +
      (s.font ? fontRecipe[s.font] : "") +
      (s.weight ? `font-weight:${s.weight};` : "") +
      (s.color ? colorRecipe[s.color] : "") +
      (s.style ? `font-style:${s.style};` : "") +
      (s.align ? alignRecipe[s.align] : "");
    if (decl) css += `[data-sk="${key}"]{${decl}}`;
  }
  return css;
}

/** Attributes for a section's wrapper (read by the static rules in globals.css). */
export function sectionAttrs(style: SectionStyle | undefined): Record<string, string> | null {
  if (!style) return null;
  const attrs: Record<string, string> = {};
  if (style.tone && style.tone !== "default") attrs["data-ss-tone"] = style.tone;
  if (style.tone === "default") attrs["data-ss-tone"] = "default";
  if (style.spacing && style.spacing !== "normal") attrs["data-ss-space"] = style.spacing;
  return Object.keys(attrs).length ? attrs : null;
}
