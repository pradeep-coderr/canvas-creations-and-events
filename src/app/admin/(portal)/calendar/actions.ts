"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/session";
import { reminderDueAt, reminderSchema } from "@/lib/calendar";
import { createClient } from "@/lib/supabase/server";

/*
 * Reminder mutations. Every action re-checks the admin and writes with the
 * admin's session, so RLS ("Admins manage reminders") applies. Reminders are
 * the business's shared calendar: any admin can manage them.
 */

export type ReminderResult =
  | { ok: true; message: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) out[String(issue.path[0])] ??= issue.message;
  return out;
}

function changed() {
  revalidatePath("/admin/calendar");
}

export async function saveReminder(id: unknown, input: unknown): Promise<ReminderResult> {
  const admin = await requireAdmin();
  const parsed = reminderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  const reminderId = id === null ? null : z.uuid().safeParse(id);
  if (reminderId && !reminderId.success) return { ok: false, error: "That reminder couldn't be found." };

  const v = parsed.data;
  const row = {
    title: v.title,
    notes: v.notes || null,
    due_at: reminderDueAt(v).toISOString(),
    all_day: v.allDay,
    related_enquiry_id: v.relatedEnquiryId || null,
    // A changed time should notify again.
    notified_at: null,
  };
  const supabase = await createClient();
  const query = reminderId
    ? supabase.from("admin_reminders").update(row).eq("id", reminderId.data).select("id")
    : supabase.from("admin_reminders").insert({ ...row, created_by: admin.userId }).select("id");
  const { data, error } = await query;
  if (error || !data?.length) {
    console.error("[calendar] reminder save failed", { code: error?.code });
    return { ok: false, error: "The reminder couldn't be saved. Try again." };
  }
  changed();
  return { ok: true, message: reminderId ? "Reminder updated." : "Reminder added." };
}

export async function setReminderCompleted(id: unknown, completed: unknown): Promise<ReminderResult> {
  await requireAdmin();
  const parsed = z.object({ id: z.uuid(), completed: z.boolean() }).safeParse({ id, completed });
  if (!parsed.success) return { ok: false, error: "That reminder couldn't be found." };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("admin_reminders")
    .update({ completed_at: parsed.data.completed ? new Date().toISOString() : null })
    .eq("id", parsed.data.id)
    .select("id");
  if (error || !data?.length) {
    console.error("[calendar] reminder complete failed", { code: error?.code });
    return { ok: false, error: "The reminder couldn't be updated. Try again." };
  }
  changed();
  return { ok: true, message: parsed.data.completed ? "Reminder completed." : "Reminder marked as not done." };
}

export async function deleteReminder(id: unknown): Promise<ReminderResult> {
  await requireAdmin();
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return { ok: false, error: "That reminder couldn't be found." };
  const supabase = await createClient();
  const { data, error } = await supabase.from("admin_reminders").delete().eq("id", parsed.data).select("id");
  if (error || !data?.length) {
    console.error("[calendar] reminder delete failed", { code: error?.code });
    return { ok: false, error: "The reminder couldn't be deleted. Try again." };
  }
  changed();
  return { ok: true, message: "Reminder deleted." };
}
