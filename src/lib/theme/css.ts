import { derivePalette } from "./palette";
import { HEX, themeSchema, type SiteTheme } from "./schema";

/*
 * Theme → CSS. Emits ONLY the layer-1 variables (--cc-*, --radius, button,
 * surface, shadow and weight variables) that globals.css maps onto the
 * semantic tokens. Components are never touched: they keep using
 * bg-primary, text-emphasis, rounded-md, shadow-soft, …
 *
 * The output is built exclusively from validated hex colours and the
 * recipe strings in this file (enum → constant), never from free text, so
 * it can't inject CSS or HTML. It is re-validated here anyway.
 */

const shadowRecipes = {
  none: { soft: "none", lift: "none" },
  soft: {
    soft: "0 1px 2px color-mix(in srgb, var(--cc-charcoal) 5%, transparent), 0 12px 32px -16px color-mix(in srgb, var(--cc-charcoal) 16%, transparent)",
    lift: "0 2px 4px color-mix(in srgb, var(--cc-charcoal) 5%, transparent), 0 24px 48px -20px color-mix(in srgb, var(--cc-charcoal) 22%, transparent)",
  },
  medium: {
    soft: "0 2px 4px color-mix(in srgb, var(--cc-charcoal) 8%, transparent), 0 16px 40px -16px color-mix(in srgb, var(--cc-charcoal) 26%, transparent)",
    lift: "0 4px 8px color-mix(in srgb, var(--cc-charcoal) 8%, transparent), 0 28px 56px -20px color-mix(in srgb, var(--cc-charcoal) 32%, transparent)",
  },
} as const;

const buttonRadius = { sharp: "0px", small: "0.25rem", medium: "0.5rem", rounded: "0.75rem", pill: "9999px" } as const;

// Height stays ≥ 44px (2.75rem) at every size: touch targets are not a theme choice.
const buttonSize = {
  compact: { height: "2.75rem", px: "1.25rem", text: "0.875rem" },
  normal: { height: "2.75rem", px: "1.5rem", text: "0.875rem" },
  large: { height: "3rem", px: "2rem", text: "1rem" },
} as const;

// Primary-button recipes. "filled" uses the button colour (its own setting,
// so a light brand pink can fill buttons with dark text); the others use the
// rose text colour, which is readable as text on light backgrounds. They reference semantic tokens, so they adapt
// inside dark sections (declared on those containers too, below).
const buttonRecipes = {
  filled: {
    bg: "var(--button)",
    fg: "var(--button-foreground)",
    border: "transparent",
    hoverBg: "var(--button-hover)",
    hoverFg: "var(--button-foreground)",
    inset: "color-mix(in srgb, var(--highlight-soft) 25%, transparent)",
  },
  outline: {
    bg: "transparent",
    fg: "var(--primary)",
    border: "var(--primary)",
    hoverBg: "var(--primary)",
    hoverFg: "var(--primary-foreground)",
    inset: "transparent",
  },
  soft: {
    bg: "var(--secondary)",
    fg: "var(--secondary-foreground)",
    border: "transparent",
    hoverBg: "var(--primary)",
    hoverFg: "var(--primary-foreground)",
    inset: "transparent",
  },
  ghost: {
    bg: "transparent",
    fg: "var(--primary)",
    border: "transparent",
    hoverBg: "var(--secondary)",
    hoverFg: "var(--secondary-foreground)",
    inset: "transparent",
  },
} as const;

const surfaceBg = { background: "var(--background)", surface: "var(--surface-ivory)", blush: "var(--surface-blush)" } as const;
const surfaceBorder = {
  none: "transparent",
  hairline: "var(--border)",
  accent: "color-mix(in srgb, var(--highlight) 60%, transparent)",
} as const;

const px = (v: string) => (v === "0" ? "0px" : `${Number(v) / 16}rem`);

/** Only real hex colours reach the stylesheet. */
const safe = (color: string) => {
  if (!HEX.test(color)) throw new Error("Invalid theme colour");
  return color;
};

/**
 * CSS for a theme. `scope` is `:root:root` for the website (beats the
 * defaults in globals.css whatever the stylesheet order) or an attribute
 * selector for a scoped preview (the element must also carry
 * `data-theme-scope` so globals.css re-derives the semantic tokens there).
 */
export function themeCss(input: SiteTheme, scope = ":root:root"): string {
  const t = themeSchema.parse(input);
  const p = derivePalette(t);
  const button = buttonRecipes[t.buttonStyle];
  const size = buttonSize[t.buttonSize];
  const decl = (vars: Record<string, string>) =>
    Object.entries(vars)
      .map(([k, v]) => `${k}:${v};`)
      .join("");

  const base = decl({
    "--cc-white": safe(p.white),
    "--cc-ivory": safe(p.ivory),
    "--cc-blush": safe(p.blush),
    "--cc-blush-soft": safe(p.blushSoft),
    "--cc-rose": safe(p.rose),
    "--cc-rose-deep": safe(p.roseInk),
    "--cc-rose-ink": safe(p.roseInk),
    "--cc-on-primary": safe(p.onPrimary),
    "--cc-button": safe(p.button),
    "--cc-on-button": safe(p.onButton),
    "--cc-button-hover": safe(p.buttonHover),
    "--cc-champagne": safe(p.champagne),
    "--cc-gold": safe(p.gold),
    "--cc-gold-deep": safe(p.goldDeep),
    "--cc-charcoal": safe(p.charcoal),
    "--cc-muted": safe(p.muted),
    "--cc-border": safe(p.border),
    "--cc-input": safe(p.input),
    "--radius": px(t.radius),
    "--cc-shadow-soft": shadowRecipes[t.shadow].soft,
    "--cc-shadow-lift": shadowRecipes[t.shadow].lift,
    "--cc-heading-weight": t.headingWeight,
    "--cc-body-weight": t.bodyWeight,
    "--btn-radius": buttonRadius[t.buttonRadius],
    "--btn-height": size.height,
    "--btn-px": size.px,
    "--btn-text": size.text,
    "--surface-radius": px(t.surfaceRadius),
    "--surface-shadow": shadowRecipes[t.surfaceShadow].soft,
  });

  // Tone-dependent variables are re-declared on dark containers so their
  // var() references resolve against the dark tokens there.
  const toned = decl({
    "--btn-bg": button.bg,
    "--btn-fg": button.fg,
    "--btn-border": button.border,
    "--btn-hover-bg": button.hoverBg,
    "--btn-hover-fg": button.hoverFg,
    "--btn-inset": button.inset,
    "--surface-bg": surfaceBg[t.surfaceBackground],
    "--surface-border": surfaceBorder[t.surfaceBorder],
  });

  return `${scope}{${base}}${scope},${scope} [data-tone="dark"]{${toned}}`;
}
