import "server-only";
import webpush from "web-push";
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/*
 * Web Push delivery (server only). The private VAPID key and the dispatch
 * secret never reach the browser; the browser only gets the public key
 * (NEXT_PUBLIC_VAPID_PUBLIC_KEY) to create a subscription.
 *
 * Targets are read through `push_targets(secret, kind)`: a narrow database
 * function that returns delivery details only to holders of the dispatch
 * secret — so no Supabase secret/service-role key is needed in the app.
 *
 * Payloads are minimal (no enquiry message, email or phone). How a
 * notification is presented — sound, vibration, banner — is decided by the
 * browser and the device's settings; we only ask for a normal, non-silent one.
 */

export type PushKind = "enquiry" | "reminder";

export interface PushPayload {
  title: string;
  body: string;
  /** Same-site admin path opened when the notification is tapped. */
  url: string;
  /** Notifications with the same tag replace each other. */
  tag: string;
}

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT;
const dispatchSecret = process.env.PUSH_DISPATCH_SECRET;

export function pushConfigured() {
  return Boolean(publicKey && privateKey && subject && dispatchSecret && dispatchSecret.length >= 32 && isSupabaseConfigured());
}

let vapidSet = false;
function ensureVapid() {
  if (!vapidSet) {
    webpush.setVapidDetails(subject!, publicKey!, privateKey!);
    vapidSet = true;
  }
}

export interface Target {
  endpoint: string;
  p256dh: string;
  auth: string;
}

/** Send one payload to the given subscriptions; gone subscriptions are revoked. */
export async function deliver(targets: Target[], payload: PushPayload): Promise<{ sent: number; failed: number }> {
  if (!pushConfigured() || targets.length === 0) return { sent: 0, failed: 0 };
  ensureVapid();
  const body = JSON.stringify(payload);
  let sent = 0;
  let failed = 0;
  await Promise.all(
    targets.map(async (t) => {
      try {
        await webpush.sendNotification({ endpoint: t.endpoint, keys: { p256dh: t.p256dh, auth: t.auth } }, body, {
          TTL: 60 * 60 * 24,
          urgency: "high",
        });
        sent++;
      } catch (error) {
        failed++;
        const status = (error as { statusCode?: number }).statusCode;
        // Log the status only: never the endpoint (a capability) or the payload.
        console.warn("[push] delivery failed", { status });
        if (status === 404 || status === 410) {
          await createPublicClient().rpc("revoke_push_endpoint", { p_secret: dispatchSecret!, p_endpoint: t.endpoint });
        }
      }
    }),
  );
  return { sent, failed };
}

/** Send to every super admin subscribed to this kind of alert. */
export async function pushToAdmins(kind: PushKind, payload: PushPayload) {
  if (!pushConfigured()) return { sent: 0, failed: 0 };
  const { data, error } = await createPublicClient().rpc("push_targets", { p_secret: dispatchSecret!, p_kind: kind });
  if (error) {
    console.error("[push] targets unavailable", { code: error.code });
    return { sent: 0, failed: 0 };
  }
  return deliver((data ?? []) as Target[], payload);
}

/** "New enquiry" — name and event date only; the message stays in the admin. */
export async function notifyNewEnquiry(enquiry: { id: string; name: string; eventDate: string | null }) {
  const date = enquiry.eventDate
    ? new Date(`${enquiry.eventDate}T00:00:00`).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })
    : null;
  try {
    const result = await pushToAdmins("enquiry", {
      title: "New enquiry",
      body: `${enquiry.name}${date ? ` · ${date}` : ""}\nTap to open the enquiry.`,
      url: `/admin/enquiries/${enquiry.id}`,
      tag: `enquiry-${enquiry.id}`,
    });
    console.info("[push] new enquiry alert", result);
  } catch (error) {
    // Never affects the stored enquiry.
    console.error("[push] new enquiry alert failed", { message: error instanceof Error ? error.message.slice(0, 120) : "unknown" });
  }
}

/** The dispatch secret, for the reminder endpoint's own check. */
export function dispatchSecretMatches(header: string | null) {
  return Boolean(pushConfigured() && header && header === `Bearer ${dispatchSecret}`);
}

export { dispatchSecret };
