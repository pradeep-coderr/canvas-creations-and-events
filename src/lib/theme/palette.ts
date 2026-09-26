import type { SiteTheme } from "./schema";

/*
 * Colour maths for the theme: WCAG 2.x contrast and the palette derived from
 * the nine client-chosen colours. Shared by the Design editor (live checks)
 * and the server (save validation, CSS), so both judge exactly the same
 * values.
 */

type Rgb = [number, number, number];

const toRgb = (hex: string): Rgb => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as Rgb;
const toHex = (rgb: Rgb) => `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;

/** `amount` of `a`, the rest `b` (like CSS color-mix in srgb). */
export function mix(a: string, b: string, amount: number): string {
  const A = toRgb(a);
  const B = toRgb(b);
  return toHex(A.map((v, i) => v * amount + B[i] * (1 - amount)) as Rgb);
}

function luminance(hex: string) {
  const [r, g, b] = toRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio (1–21), rounded down to 2 decimals so 4.499 never passes as 4.5. */
export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return Math.floor(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
}

/** The better of white or the main text colour on top of `background`. */
export function readableOn(background: string, dark: string): string {
  return contrast("#ffffff", background) >= contrast(dark, background) ? "#ffffff" : dark;
}

/**
 * Lighten `color` toward white until it reaches `min` contrast on `on`
 * (used for the rose on dark sections). Returns null if even white can't.
 */
function liftUntil(color: string, on: string, min: number): string | null {
  for (let step = 0; step <= 20; step++) {
    const c = mix("#ffffff", color, step / 20);
    if (contrast(c, on) >= min) return c;
  }
  return null;
}

/**
 * Button hover: move the button colour away from its text colour (lighter
 * under dark text, darker under light text), so hovering never lowers the
 * text contrast.
 */
function hoverFor(button: string, text: string) {
  return luminance(text) < 0.18 ? mix(button, "#ffffff", 0.85) : mix(button, "#302a29", 0.86);
}

/** Every concrete colour the site uses, derived from the theme. */
export function derivePalette(t: SiteTheme) {
  const input = mix(t.mutedForeground, t.background, 0.8);
  const darkPrimary = liftUntil(t.primary, t.foreground, 4.5);
  return {
    white: t.background,
    ivory: t.surface,
    // Very light blush used for whole sections; the chosen blush is the stronger tint.
    blush: mix(t.blush, t.background, 0.3),
    blushSoft: t.blush,
    roseInk: t.primary,
    onPrimary: t.primaryForeground,
    button: t.button,
    onButton: t.buttonForeground,
    buttonHover: hoverFor(t.button, t.buttonForeground),
    // Rose for dark sections: the primary lifted until it reads on the dark background.
    rose: darkPrimary ?? mix("#ffffff", t.primary, 0.5),
    roseOk: darkPrimary !== null,
    gold: t.accent,
    goldDeep: mix(t.accent, t.foreground, 0.8),
    champagne: mix(t.accent, "#ffffff", 0.45),
    charcoal: t.foreground,
    muted: t.mutedForeground,
    border: t.border,
    // Form field boundary: ≥3:1 required (WCAG 1.4.11); fall back to the muted text colour.
    input: contrast(input, t.background) >= 3 ? input : t.mutedForeground,
  };
}

export type Palette = ReturnType<typeof derivePalette>;

export interface ContrastCheck {
  id: string;
  label: string;
  ratio: number;
  min: number;
  pass: boolean;
  /** Which colour setting to change to fix it. */
  fix: keyof SiteTheme;
}

/**
 * The combinations the website actually uses. Every check must pass before a
 * theme can be saved (enforced again on the server).
 */
export function checkTheme(t: SiteTheme): ContrastCheck[] {
  const p = derivePalette(t);
  const check = (id: string, label: string, fg: string, bg: string, min: number, fix: keyof SiteTheme): ContrastCheck => {
    const ratio = contrast(fg, bg);
    return { id, label, ratio, min, pass: ratio >= min, fix };
  };
  return [
    check("button-text", "Button text on buttons", p.onButton, p.button, 4.5, "buttonForeground"),
    check("button-hover-text", "Button text on hovered buttons", p.onButton, p.buttonHover, 4.5, "buttonForeground"),
    check("on-primary", "Text on rose backgrounds", p.onPrimary, p.roseInk, 4.5, "primaryForeground"),
    check("primary-page", "Rose text on the page background", p.roseInk, p.white, 4.5, "primary"),
    check("primary-surface", "Rose text on surface sections", p.roseInk, p.ivory, 4.5, "primary"),
    check("primary-blush", "Rose text on blush sections", p.roseInk, p.blush, 4.5, "primary"),
    check("text-page", "Main text on the page background", p.charcoal, p.white, 4.5, "foreground"),
    check("text-surface", "Main text on surface sections", p.charcoal, p.ivory, 4.5, "foreground"),
    check("text-blush", "Main text on soft blush", p.charcoal, p.blushSoft, 4.5, "blush"),
    check("muted-page", "Muted text on the page background", p.muted, p.white, 4.5, "mutedForeground"),
    check("muted-surface", "Muted text on surface sections", p.muted, p.ivory, 4.5, "mutedForeground"),
    check("muted-blush", "Muted text on blush sections", p.muted, p.blush, 4.5, "mutedForeground"),
    check("field-border", "Form field borders", p.input, p.white, 3, "mutedForeground"),
    check("dark-text", "Text in dark sections (surface on main text colour)", p.ivory, p.charcoal, 4.5, "surface"),
    check("dark-rose", "Rose in dark sections", p.rose, p.charcoal, 4.5, "primary"),
    check("dark-focus", "Focus outline in dark sections", p.champagne, p.charcoal, 3, "accent"),
  ];
}

export function themeIsAccessible(t: SiteTheme) {
  return checkTheme(t).every((c) => c.pass);
}
