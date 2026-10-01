import { z } from "zod";

/*
 * Reviews & feedback (Phase 25). One schema for the visitor's form and the
 * server action; the database CHECK constraints mirror these limits
 * (supabase/migrations/20261001130000_reviews.sql).
 *
 * `canPublish` is the author's own choice: unticked, it's private feedback
 * for the team and can never appear on the website.
 */

const singleLine = /^[^\r\n]*$/;

export const REVIEW_MESSAGE_MIN = 10;
export const REVIEW_MESSAGE_MAX = 1500;

export const reviewSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Please enter your name.")
    .max(100, "Please keep your name under 100 characters.")
    .regex(singleLine, "Please keep your name on one line."),
  // 0 = not chosen yet (the form's starting value).
  rating: z
    .number({ error: "Please choose a star rating." })
    .int("Please choose a star rating.")
    .min(1, "Please choose a star rating.")
    .max(5, "Please choose a star rating."),
  message: z
    .string()
    .trim()
    .min(REVIEW_MESSAGE_MIN, `Please write at least ${REVIEW_MESSAGE_MIN} characters.`)
    .max(REVIEW_MESSAGE_MAX, `Please keep it under ${REVIEW_MESSAGE_MAX} characters.`),
  eventType: z
    .string()
    .trim()
    .max(100, "Please keep this under 100 characters.")
    .regex(singleLine, "Please keep this on one line."),
  email: z
    .string()
    .trim()
    .max(254, "Please check your email address.")
    .refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Please enter a valid email address, or leave it empty."),
  canPublish: z.boolean(),
});

export type ReviewInput = z.input<typeof reviewSchema>;
export type Review = z.output<typeof reviewSchema>;

export type ReviewResult =
  | { status: "sent"; canPublish: boolean }
  | { status: "unavailable" }
  | { status: "error"; message: string };

/** A review as the website shows it (approved only; never the email). */
export interface PublicReview {
  id: string;
  name: string;
  eventType: string | null;
  rating: number;
  message: string;
}

export const reviewStatuses = ["new", "approved", "hidden"] as const;
export type ReviewStatus = (typeof reviewStatuses)[number];
export const reviewStatusLabels: Record<ReviewStatus, string> = {
  new: "New",
  approved: "On the website",
  hidden: "Hidden",
};
