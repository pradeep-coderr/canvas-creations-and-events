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
