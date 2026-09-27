"use server";

import { z } from "zod";
import { requireSuperAdmin } from "@/lib/admin/session";
import { getEmailConfig } from "@/lib/email/config";
import { deliverEnquiryEmail } from "@/lib/email/send-enquiry-notification";
import { formatShortDateTime } from "@/lib/datetime";
import { deliver, pushConfigured, pushService } from "@/lib/push/server";
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
  console.info("[push] subscription saved", { service: pushService(endpoint) });
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

export type PushTest = { result: "sent" | "delivered" | "failed"; detail: string; at: string } | null;

const endpointSchema = z.string().url().max(1000);

/** Is this device's subscription stored (and not turned off), and its last test. */
export async function getPushDeviceStatus(endpoint: unknown): Promise<{ stored: boolean; lastTest: PushTest }> {
  const admin = await requireSuperAdmin();
  const parsed = endpointSchema.safeParse(endpoint);
  if (!parsed.success) return { stored: false, lastTest: null };
  const supabase = await createClient();
  const { data } = await supabase
    .from("push_subscriptions")
    .select("last_test_at, last_test_result, last_test_detail")
    .eq("endpoint", parsed.data)
    .eq("admin_user_id", admin.userId)
    .is("revoked_at", null)
    .maybeSingle();
  if (!data) return { stored: false, lastTest: null };
  return {
    stored: true,
    lastTest:
      data.last_test_at && data.last_test_result
        ? { result: data.last_test_result, detail: data.last_test_detail ?? "", at: data.last_test_at }
        : null,
  };
}

/**
 * A real push to this device through the production path. "Sent" only means
 * the push service accepted it; the page then waits for the service worker to
 * report that the notification was shown (confirmPushTest) before saying it
 * arrived.
 */
export async function sendTestPush(
  endpoint: unknown,
): Promise<({ ok: true; message: string; testId: string } | { ok: false; error: string }) & { lastTest?: PushTest }> {
  const admin = await requireSuperAdmin();
  const parsed = endpointSchema.safeParse(endpoint);
  if (!parsed.success) return { ok: false, error: "That device couldn't be found." };
  if (!pushConfigured()) return { ok: false, error: "Push isn't set up on the server (the push keys or dispatch secret are missing)." };
  const supabase = await createClient();
  const { data } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("endpoint", parsed.data)
    .eq("admin_user_id", admin.userId)
    .is("revoked_at", null)
    .maybeSingle();
  if (!data) return { ok: false, error: "This device's subscription isn't stored. Turn notifications off and on again." };

  const testId = crypto.randomUUID();
  const report = await deliver([data], {
    title: "Test notification",
    body: "Notifications from Canvas Admin are working on this device.",
    url: "/admin/settings",
    tag: "test",
    testId,
  });
  const at = new Date().toISOString();
  const lastTest: PushTest = report.sent
    ? { result: "sent", detail: `Accepted by ${pushService(data.endpoint)}; waiting for this device (test ${testId})`, at }
    : { result: "failed", detail: (report.errors[0] ?? "not sent").slice(0, 250), at };
  await supabase
    .from("push_subscriptions")
    .update({ last_test_at: at, last_test_result: lastTest.result, last_test_detail: lastTest.detail })
    .eq("endpoint", data.endpoint)
    .eq("admin_user_id", admin.userId);
  console.info("[push] test notification", { service: pushService(data.endpoint), result: lastTest.result });

  if (!report.sent) {
    const gone = report.errors.some((e) => / (404|410)$/.test(e));
    return {
      ok: false,
      lastTest,
      error: gone
        ? "This device's subscription has expired (the push service no longer accepts it). Turn notifications off and on again."
        : `The push service didn't accept the test notification: ${lastTest.detail}.`,
    };
  }
  return { ok: true, lastTest, testId, message: "Sent. Waiting for this device to show it…" };
}

/** The service worker showed test `testId` on this device: record it as delivered. */
export async function confirmPushTest(endpoint: unknown, testId: unknown): Promise<{ lastTest: PushTest }> {
  const admin = await requireSuperAdmin();
  const e = endpointSchema.safeParse(endpoint);
  const id = z.uuid().safeParse(testId);
  if (!e.success || !id.success) return { lastTest: null };
  const at = new Date().toISOString();
  const lastTest: PushTest = { result: "delivered", detail: "Shown on this device by the service worker", at };
  const supabase = await createClient();
  const { data } = await supabase
    .from("push_subscriptions")
    .update({ last_test_at: at, last_test_result: "delivered", last_test_detail: lastTest.detail })
    .eq("endpoint", e.data)
    .eq("admin_user_id", admin.userId)
    // Only the test this server just sent to this device.
    .like("last_test_detail", `%test ${id.data})`)
    .select("id");
  return { lastTest: data?.length ? lastTest : null };
}

// ---------------------------------------------------------------------------
// Email notifications
// ---------------------------------------------------------------------------

export type EmailTest = { ok: boolean; detail: string; at: string } | null;

/**
 * Sends a clearly marked test through the same Resend path as real enquiry
 * emails. No enquiry is created: the test data exists only in this email.
 * Reply-To is the signed-in super admin, so replying reaches them.
 */
export async function sendTestEnquiryEmail(): Promise<{ ok: boolean; message: string; lastTest: EmailTest }> {
  const admin = await requireSuperAdmin();
  const config = getEmailConfig();
  const id = `test-${crypto.randomUUID()}`;
  const eventDate = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);
  const result = await deliverEnquiryEmail({
    id,
    test: true,
    idempotencyKey: `enquiry-notification-test/${id}`,
    enquiry: {
      name: "Test enquiry (from Admin → Settings)",
      email: admin.email ?? "test@example.com",
      phone: "0400 000 000",
      eventType: "Test event",
      eventDate,
      venue: "Test venue, Adelaide",
      message:
        "This is a test email sent from Canvas Admin → Settings → Email notifications.\n\nNo enquiry was created. " +
        "Real enquiries arrive in exactly this format, with Reply-To set to the visitor's email address.",
    },
  });
  const at = new Date().toISOString();
  const detail =
    result.outcome === "sent"
      ? `Sent to ${config?.to.length ?? 0} recipient${config?.to.length === 1 ? "" : "s"} (${formatShortDateTime(at)})`
      : result.outcome === "not-configured"
        ? "Not configured: the email settings are missing on the server"
        : `Failed: ${result.error ?? "unknown error"}`.slice(0, 280);
  const lastTest: EmailTest = { ok: result.outcome === "sent", detail, at };

  const supabase = await createClient();
  const { error } = await supabase
    .from("notification_checks")
    .upsert({ kind: "email", ok: lastTest.ok, detail, checked_at: at, checked_by: admin.userId }, { onConflict: "kind" });
  if (error) console.error("[email] test result not recorded", { code: error.code });

  return {
    ok: lastTest.ok,
    lastTest,
    message: lastTest.ok ? "Test email sent. Check the business inbox (and its spam folder)." : detail,
  };
}
