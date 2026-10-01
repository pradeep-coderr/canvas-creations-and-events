"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/session";
import { reviewSchema, reviewStatuses } from "@/lib/review";
import { createClient } from "@/lib/supabase/server";
import { CMS_CONTENT_TAG } from "@/lib/supabase/public";

/*
 * Review moderation. Every action re-checks the admin and writes with the
 * signed-in session, so RLS applies the same rule in the database (where a
 * client's own words can't be edited, and private feedback can't be made
 * public). Public changes expire the homepage cache straight away.
 */

export type ReviewActionResult = { ok: true; message: string } | { ok: false; error: string };

function changed() {
  updateTag(CMS_CONTENT_TAG);
  revalidatePath("/admin/reviews");
  revalidatePath("/admin/editor");
}

const statusInput = z.object({ id: z.uuid(), status: z.enum(reviewStatuses) });

export async function setReviewStatus(input: unknown): Promise<ReviewActionResult> {
  await requireAdmin();
  const parsed = statusInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "That change wasn't valid." };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id)
    .select("status")
    .maybeSingle();
  if (error) {
    console.error("[reviews] status change failed", { code: error.code });
    return {
      ok: false,
      error:
        error.code === "23514"
          ? "This is private feedback: the client didn't allow it on the website."
          : "The review couldn't be updated. Try again.",
    };
  }
  if (!data) return { ok: false, error: "That review no longer exists. Refresh the page." };
  changed();
  const messages = {
    approved: "Approved: it's now on the website.",
    hidden: "Hidden: it's no longer on the website.",
    new: "Moved back to New.",
  } as const;
  return { ok: true, message: messages[parsed.data.status] };
}

export async function deleteReview(id: unknown): Promise<ReviewActionResult> {
  await requireAdmin();
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return { ok: false, error: "That review wasn't valid." };
  const supabase = await createClient();
  const { data, error } = await supabase.from("reviews").delete().eq("id", parsed.data).select("id");
  if (error || !data?.length) {
    console.error("[reviews] delete failed", { code: error?.code });
    return { ok: false, error: "The review couldn't be deleted. Try again." };
  }
  changed();
  return { ok: true, message: "Review deleted." };
}

/**
 * A review the client sent another way (WhatsApp, email, Google), added by
 * an admin with the client's permission. Shown straight away if chosen.
 */
const addInput = reviewSchema.omit({ email: true, canPublish: true }).extend({
  publishNow: z.boolean(),
  permission: z.literal(true, { error: "Please confirm the client is happy for it to be shown." }),
});

export async function addReview(input: unknown): Promise<ReviewActionResult & { fieldErrors?: Record<string, string> }> {
  await requireAdmin();
  const parsed = addInput.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { ok: false, error: "Please check the highlighted fields.", fieldErrors };
  }
  const v = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("reviews").insert({
    id: crypto.randomUUID(),
    name: v.name,
    event_type: v.eventType || null,
    rating: v.rating,
    message: v.message,
    can_publish: true,
    source: "admin",
    status: v.publishNow ? "approved" : "new",
  });
  if (error) {
    console.error("[reviews] add failed", { code: error.code });
    return { ok: false, error: "The review couldn't be added. Try again." };
  }
  changed();
  return { ok: true, message: v.publishNow ? "Review added and shown on the website." : "Review added to New." };
}
