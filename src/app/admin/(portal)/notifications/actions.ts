"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/session";
import { createClient } from "@/lib/supabase/server";

/** Everything up to now counts as read for this admin (every device). */
export async function markNotificationsRead(): Promise<{ ok: boolean }> {
  const admin = await requireAdmin();
  const supabase = await createClient();
  const readAt = new Date().toISOString();
  // Move the marker; the very first time there's none yet, so add it.
  // (Not an upsert: that would need permission to rewrite user_id too.)
  const { data: moved, error: updateError } = await supabase
    .from("admin_notification_reads")
    .update({ read_at: readAt })
    .eq("user_id", admin.userId)
    .select("user_id");
  let error = updateError;
  if (!error && !moved?.length) {
    ({ error } = await supabase.from("admin_notification_reads").insert({ user_id: admin.userId, read_at: readAt }));
  }
  if (error) {
    console.error("[notifications] mark read failed", { code: error.code });
    return { ok: false };
  }
  // The tab's badge lives in the admin layout.
  revalidatePath("/admin", "layout");
  return { ok: true };
}
