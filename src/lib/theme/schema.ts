import { z } from "zod";

/*
 * The global site theme: WHAT the website looks like. The code (globals.css,
 * the components) defines HOW these values become the semantic tokens every
 * component already uses. One theme exists (the `site_theme` singleton); it
 * applies to the public website for every visitor.
 *
 * Shared by the admin Design editor (client) and the server (validation,
 * rendering), so it must stay free of server-only imports.
 */

export const HEX = /^#[0-9a-f]{6}$/;

const hex = z
  .string()
  .trim()
  .toLowerCase()
  .regex(HEX, "Use a 6-digit hex colour, like #ad4a66.");

export const buttonStyles = ["filled", "outline", "soft", "ghost"] as const;
export const buttonRadii = ["sharp", "small", "medium", "rounded", "pill"] as const;
export const buttonSizes = ["compact", "normal", "large"] as const;
export const radii = ["0", "4", "8", "10", "12", "16", "24"] as const;
export const shadows = ["none", "soft", "medium"] as const;
export const surfaceBackgrounds = ["background", "surface", "blush"] as const;
export const surfaceBorders = ["none", "hairline", "accent"] as const;
export const headingWeights = ["300", "400", "500", "600"] as const;
export const bodyWeights = ["400", "500"] as const;

export const colorKeys = [
  "primary",
  "primaryForeground",
  "button",
  "buttonForeground",
  "blush",
  "accent",
  "background",
  "surface",
  "foreground",
  "mutedForeground",
  "border",
] as const;
export type ColorKey = (typeof colorKeys)[number];

export const themeSchema = z
  .object({
    primary: hex,
    primaryForeground: hex,
    button: hex,
    buttonForeground: hex,
    blush: hex,
    accent: hex,
    background: hex,
    surface: hex,
    foreground: hex,
    mutedForeground: hex,
    border: hex,
    buttonStyle: z.enum(buttonStyles),
    buttonRadius: z.enum(buttonRadii),
    buttonSize: z.enum(buttonSizes),
    radius: z.enum(radii),
    shadow: z.enum(shadows),
    surfaceBackground: z.enum(surfaceBackgrounds),
    surfaceBorder: z.enum(surfaceBorders),
    surfaceRadius: z.enum(radii),
    surfaceShadow: z.enum(shadows),
    headingWeight: z.enum(headingWeights),
    bodyWeight: z.enum(bodyWeights),
  })
  .strict();

export type SiteTheme = z.infer<typeof themeSchema>;

/**
 * The canonical default theme (rose-pink refresh, Phase 17). Also the
 * fallback when no database is configured or the theme can't be loaded, and
 * what "Reset to defaults" restores. globals.css holds the same values, so a
 * page without a theme style renders identically.
 */
export const defaultTheme: SiteTheme = {
  // Rose for text-level accents (links, labels, headline accent, focus): a
  // deeper shade of the button pink that reads on every light surface.
  primary: "#b64762",
  primaryForeground: "#ffffff",
  // The brand pink on the main buttons, with charcoal text (6.0:1).
  button: "#f7889a",
  buttonForeground: "#302a29",
  blush: "#f9dde2",
  accent: "#d29a49",
  background: "#ffffff",
  surface: "#fbf5ec",
  foreground: "#302a29",
  mutedForeground: "#756a67",
  border: "#ebe1df",
  buttonStyle: "filled",
  buttonRadius: "medium",
  buttonSize: "normal",
  radius: "10",
  shadow: "soft",
  surfaceBackground: "background",
  surfaceBorder: "none",
  surfaceRadius: "0",
  surfaceShadow: "none",
  headingWeight: "500",
  bodyWeight: "400",
};

/** Client-facing names; the admin never sees token names. */
export const colorLabels: Record<ColorKey, { label: string; hint: string }> = {
  primary: {
    label: "Rose text and links",
    hint: "Headline accents, labels above headings, links and focus outlines. Must be readable on light backgrounds.",
  },
  primaryForeground: { label: "Text on rose", hint: "Text on rose backgrounds, e.g. outline buttons when hovered." },
  button: { label: "Button colour", hint: "Main buttons: Enquire Now, Send enquiry." },
  buttonForeground: { label: "Button text", hint: "Text on the main buttons." },
  blush: { label: "Soft blush", hint: "Blush sections, soft buttons, selected text." },
  accent: { label: "Accent gold", hint: "Hairlines, frames and ornaments. Never used for text." },
  background: { label: "Page background", hint: "The main page colour." },
  surface: { label: "Surface background", hint: "Ivory sections and image placeholders." },
  foreground: { label: "Main text", hint: "Headings and body text. Also the dark sections' background." },
  mutedForeground: { label: "Muted text", hint: "Supporting text and captions." },
  border: { label: "Border", hint: "Dividers and hairlines." },
};

export const optionLabels = {
  buttonStyle: { filled: "Filled", outline: "Outline", soft: "Soft", ghost: "Ghost" },
  buttonRadius: { sharp: "Sharp", small: "Small", medium: "Medium", rounded: "Rounded", pill: "Pill" },
  buttonSize: { compact: "Compact", normal: "Normal", large: "Large" },
  radius: { "0": "Sharp", "4": "4 px", "8": "8 px", "10": "10 px", "12": "12 px", "16": "16 px", "24": "24 px" },
  shadow: { none: "None", soft: "Soft", medium: "Medium" },
  surfaceBackground: { background: "Page background", surface: "Surface (ivory)", blush: "Soft blush" },
  surfaceBorder: { none: "None", hairline: "Hairline", accent: "Gold hairline" },
  headingWeight: { "300": "Light", "400": "Regular", "500": "Medium", "600": "Semibold" },
  bodyWeight: { "400": "Regular", "500": "Medium" },
} as const;

/** Database row ⇄ theme. Columns are snake_case; every value is validated. */
export const themeColumns = {
  primary: "primary_color",
  primaryForeground: "primary_foreground",
  button: "button_color",
  buttonForeground: "button_foreground",
  blush: "blush",
  accent: "accent",
  background: "background",
  surface: "surface",
  foreground: "foreground",
  mutedForeground: "muted_foreground",
  border: "border",
  buttonStyle: "button_style",
  buttonRadius: "button_radius",
  buttonSize: "button_size",
  radius: "radius",
  shadow: "shadow",
  surfaceBackground: "surface_background",
  surfaceBorder: "surface_border",
  surfaceRadius: "surface_radius",
  surfaceShadow: "surface_shadow",
  headingWeight: "heading_weight",
  bodyWeight: "body_weight",
} as const satisfies Record<keyof SiteTheme, string>;

export const THEME_SELECT = Object.values(themeColumns).join(", ");

export function themeToRow(theme: SiteTheme): Record<string, string> {
  const row: Record<string, string> = {};
  for (const [key, column] of Object.entries(themeColumns)) row[column] = theme[key as keyof SiteTheme];
  return row;
}

/** A row from the database, validated; null if anything is malformed. */
export function rowToTheme(row: Record<string, unknown> | null | undefined): SiteTheme | null {
  if (!row) return null;
  const value: Record<string, unknown> = {};
  for (const [key, column] of Object.entries(themeColumns)) value[key] = row[column];
  const parsed = themeSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
