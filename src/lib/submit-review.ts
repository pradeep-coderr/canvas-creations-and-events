"use server";

import { after } from "next/server";
import { sendReviewNotification } from "@/lib/email/send-review-notification";
import { notifyNewReview } from "@/lib/push/server";
import { reviewSchema, type Review, type ReviewResult } from "@/lib/review";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

const FAILED: ReviewResult = {
  status: "error",
  message: "Your review couldn't be sent. Please try again in a moment.",
};

function toRow(id: string, review: Review) {
  const optional = (value: string) => (value === "" ? null : value);
  return {
    id,
    name: review.name,
    email: optional(review.email),
    event_type: optional(review.eventType),
    rating: review.rating,
    message: review.message,
    can_publish: review.canPublish,
  };
}

/**
 * The public entry point for reviews and feedback (server action), same
 * shape as submitEnquiry:
 *
 *   1. honeypot            → quiet "sent", nothing stored
 *   2. Supabase configured → otherwise "unavailable"
 *   3. Zod re-validation   → the browser is never trusted
 *   4. insert              → status 'new': nothing is public until an admin
 *                            approves it (and only with the author's consent)
 *   5. email + push alert  → after the response, best effort
 */
export async function submitReview(input: unknown, honeypot?: unknown): Promise<ReviewResult> {
  const parsed = reviewSchema.safeParse(input);
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return { status: "sent", canPublish: parsed.success ? parsed.data.canPublish : false };
  }
  if (!isSupabaseConfigured()) return { status: "unavailable" };
  if (!parsed.success) {
    console.warn("[review] rejected invalid payload", {
      fields: parsed.error.issues.map((issue) => issue.path.join(".")),
    });
    return { status: "error", message: "Some details weren't valid. Please check the form and try again." };
  }

  const id = crypto.randomUUID();
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("reviews").insert(toRow(id, parsed.data));
    if (error) {
      console.error("[review] insert failed", { code: error.code, message: error.message });
      return FAILED;
    }
  } catch (error) {
    console.error("[review] unexpected failure", {
      message: error instanceof Error ? error.message : String(error),
    });
    return FAILED;
  }

  console.info(`[review] stored ${id}`);
  const review = parsed.data;
  after(async () => {
    await notifyNewReview({ id, name: review.name, rating: review.rating, canPublish: review.canPublish });
    await sendReviewNotification(id, review);
  });
  return { status: "sent", canPublish: review.canPublish };
}
