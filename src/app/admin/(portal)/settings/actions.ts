"use server";

import { z } from "zod";
import { requireSuperAdmin } from "@/lib/admin/session";
import { deliver, pushConfigured } from "@/lib/push/server";
import { createClient } from "@/lib/supabase/server";

/*
 * Push notification management — super admins only (requireSuperAdmin here,
 * and RLS: a super admin can only see and change their own subscriptions).
 * Subscriptions are created in the browser after an explicit click and the
 * browser's own permission prompt; the server stores only what delivery needs.
 */

export type PushResult = { ok: true; message: string } | { ok: false; error: string };

const subscriptionSchema = z.object({
  endpoint: z.string().url().startsWith("https://").max(1000),
  keys: z.object({ p256dh: z.string().min(40).max(200), auth: z.string().min(10).max(100) }),
  userAgent: z.string().max(300).optional(),
});

export async function savePushSubscription(input: unknown): Promise<PushResult> {
  const admin = await requireSuperAdmin();
  if (!pushConfigured()) return { ok: false, error: "Notifications aren't set up on this website yet." };
  const parsed = subscriptionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "This browser's notification details weren't valid. Try again." };
  const { endpoint, keys, userAgent } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      admin_user_id: admin.userId,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      user_agent: userAgent ?? null,
      last_seen_at: new Date().toISOString(),
      revoked_at: null,
    },
    { onConflict: "endpoint" },
  );
  if (error) {
    console.error("[push] subscription save failed", { code: error.code });
    return { ok: false, error: "Notifications couldn't be turned on. Try again." };
  }
  return { ok: true, message: "Notifications are on for this device." };
}

export async function removePushSubscription(endpoint: unknown): Promise<PushResult> {
  const admin = await requireSuperAdmin();
  const parsed = z.string().url().max(1000).safeParse(endpoint);
  if (!parsed.success) return { ok: false, error: "That device couldn't be found." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("push_subscriptions")
    .update({ revoked_at: new Date().toISOString() })
    .eq("endpoint", parsed.data)
    .eq("admin_user_id", admin.userId);
  if (error) {
    console.error("[push] unsubscribe failed", { code: error.code });
    return { ok: false, error: "Notifications couldn't be turned off. Try again." };
  }
  return { ok: true, message: "Notifications are off for this device." };
}

export async function setPushPreferences(input: unknown): Promise<PushResult> {
  const admin = await requireSuperAdmin();
  const parsed = z
    .object({ endpoint: z.string().url().max(1000), enquiries: z.boolean(), reminders: z.boolean() })
    .safeParse(input);
  if (!parsed.success) return { ok: false, error: "Those settings weren't valid." };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("push_subscriptions")
    .update({ notify_enquiries: parsed.data.enquiries, notify_reminders: parsed.data.reminders })
    .eq("endpoint", parsed.data.endpoint)
    .eq("admin_user_id", admin.userId)
    .is("revoked_at", null)
    .select("id");
  if (error || !data?.length) {
    console.error("[push] preferences failed", { code: error?.code });
    return { ok: false, error: "The settings couldn't be saved. Turn notifications on again and retry." };
  }
  return { ok: true, message: "Notification settings saved." };
}

export async function sendTestPush(endpoint: unknown): Promise<PushResult> {
  const admin = await requireSuperAdmin();
  const parsed = z.string().url().max(1000).safeParse(endpoint);
  if (!parsed.success) return { ok: false, error: "That device couldn't be found." };
  const supabase = await createClient();
  const { data } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("endpoint", parsed.data)
    .eq("admin_user_id", admin.userId)
    .is("revoked_at", null)
    .maybeSingle();
  if (!data) return { ok: false, error: "Notifications aren't on for this device." };
  const result = await deliver([data], {
    title: "Test notification",
    body: "Notifications from Canvas Admin are working on this device.",
    url: "/admin/settings",
    tag: "test",
  });
  return result.sent
    ? { ok: true, message: "Test notification sent. It should appear in a moment." }
    : { ok: false, error: "The test notification couldn't be delivered. Turn notifications off and on again." };
}
