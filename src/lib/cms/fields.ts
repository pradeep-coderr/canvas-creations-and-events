import { z } from "zod";

/*
 * Client-side mirrors of the CMS database domains
 * (supabase/migrations/…_create_cms_content.sql). They exist for friendly,
 * immediate feedback; the database constraints remain the final authority.
 * Values are trimmed before saving, and optional fields save "" as NULL.
 */

export const LINE_MAX = 200; // public.cms_line
export const TEXT_MAX = 2000; // public.cms_text
export const SLUG_MAX = 80; // public.cms_slug
export const HREF_MAX = 500; // public.cms_href
export const ORDER_MAX = 100_000;

const SINGLE_LINE = /^[^\r\n]*$/;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
// Same pattern as public.cms_href: site-relative "/…" (not "//host"), tel:,
// mailto: or https: only.
const HREF = /^(\/([^/\\].*)?|tel:\+?[0-9]{6,15}|mailto:[^@]+@[^@]+|https:\/\/.+)$/;

/** Required single line (cms_line). */
export const line = () =>
  z
    .string()
    .trim()
    .min(1, "This is required.")
    .max(LINE_MAX, `Keep this to ${LINE_MAX} characters or fewer.`)
    .regex(SINGLE_LINE, "Keep this on one line.");

/** Optional single line: empty saves as NULL. */
export const optionalLine = () =>
  z
    .string()
    .trim()
    .max(LINE_MAX, `Keep this to ${LINE_MAX} characters or fewer.`)
    .regex(SINGLE_LINE, "Keep this on one line.")
    .transform((v) => v || null);

/** Required text, line breaks allowed (cms_text). */
export const text = () =>
  z
    .string()
    .trim()
    .min(1, "This is required.")
    .max(TEXT_MAX, `Keep this to ${TEXT_MAX} characters or fewer.`);

export const slug = () =>
  z
    .string()
    .trim()
    .min(1, "This is required.")
    .max(SLUG_MAX, `Keep this to ${SLUG_MAX} characters or fewer.`)
    .regex(SLUG, "Use lowercase letters, numbers and single hyphens, e.g. event-styling.");

/** Optional link (cms_href): empty saves as NULL. */
export const optionalHref = () =>
  z
    .string()
    .trim()
    .max(HREF_MAX, `Keep this to ${HREF_MAX} characters or fewer.`)
    .refine((v) => v === "" || (!/\s/.test(v) && HREF.test(v)), {
      message: "Use a page link like /#enquire, or a full https://, tel: or mailto: link.",
    })
    .transform((v) => v || null);

export const sortOrder = () =>
  z
    .number({ error: "Enter a whole number." })
    .int("Enter a whole number.")
    .min(0, "Use 0 or more.")
    .max(ORDER_MAX, "Use a smaller number.");

/** A media / related-row reference from a Select ("" = none). */
export const optionalId = () =>
  z.union([z.uuid(), z.literal("")]).transform((v) => v || null);

export const requiredId = (message: string) => z.uuid({ error: message });

/** Turns a URL-friendly slug out of a title, for the "suggest" helper. */
export function suggestSlug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX)
    .replace(/-+$/, "");
}

/** Optional text, line breaks allowed: empty saves as NULL. */
export const optionalText = () =>
  z
    .string()
    .trim()
    .max(TEXT_MAX, `Keep this to ${TEXT_MAX} characters or fewer.`)
    .transform((v) => v || null);

/** Optional short single line (a price's words before/after), empty saves as NULL. */
export const optionalShort = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep this to ${max} characters or fewer.`)
    .regex(SINGLE_LINE, "Keep this on one line.")
    .transform((v) => v || null);

export const LIST_MAX = 12; // public.cms_line_list_ok

/** One line per item (textarea) → a list of up to LIST_MAX single lines. */
export const lineList = () =>
  z
    .string()
    .transform((v) =>
      v
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean),
    )
    .refine((items) => items.length <= LIST_MAX, `Use ${LIST_MAX} lines or fewer.`)
    .refine((items) => items.every((i) => i.length <= LINE_MAX), `Keep each line to ${LINE_MAX} characters or fewer.`);

export const PRICE_MAX = 1_000_000;

/**
 * A price in Australian dollars as typed ("1500", "1,500", "$1,500.50") →
 * a number, or null when empty. Never 0.
 */
export const optionalPrice = () =>
  z
    .string()
    .trim()
    .transform((v) => v.replace(/^\$/, "").replace(/,/g, ""))
    .refine((v) => v === "" || /^\d{1,7}(\.\d{1,2})?$/.test(v), "Enter an amount like 1500 or 1500.50.")
    .transform((v) => (v === "" ? null : Number(v)))
    .refine((v) => v === null || (v > 0 && v <= PRICE_MAX), `Enter an amount between $1 and $${PRICE_MAX.toLocaleString("en-AU")}.`);
