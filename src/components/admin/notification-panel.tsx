"use client";

import { useCallback, useEffect, useState } from "react";
import {
  confirmPushTest,
  getPushDeviceStatus,
  removePushSubscription,
  savePushSubscription,
  sendTestPush,
  setPushPreferences,
  type PushResult,
  type PushTest,
} from "@/app/admin/(portal)/settings/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { describeActionFailure } from "@/lib/admin/action-error";
import { formatShortDateTime } from "@/lib/datetime";

/*
 * Push notifications for this device (super admins). Nothing is requested on
 * page load: the browser's permission prompt appears only after "Turn on
 * notifications" is pressed. Support is detected, not assumed (iPhone/iPad
 * need the app added to the Home Screen first).
 *
 * "Send test notification" is end to end: it checks every step on this
 * device, sends a real push through the server, and only reports success once
 * the service worker says it showed the notification.
 */

type Support = "checking" | "supported" | "unsupported" | "ios-needs-install" | "not-configured";
type Busy = null | "enable" | "disable" | "test" | "prefs";

/** How long to wait for this device to show a test notification. */
const TEST_WAIT_MS = 20_000;

function base64ToBytes(base64: string) {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(padded);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

/** Resolves true when the service worker reports showing test `testId`, false after `ms`. */
function waitForTestShown(testId: string, ms: number) {
  return new Promise<boolean>((resolve) => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; testId?: string } | null;
      if (data?.type === "cc-push" && data.testId === testId) finish(true);
    };
    const timer = window.setTimeout(() => finish(false), ms);
    function finish(shown: boolean) {
      window.clearTimeout(timer);
      navigator.serviceWorker.removeEventListener("message", onMessage);
      resolve(shown);
    }
    navigator.serviceWorker.addEventListener("message", onMessage);
  });
}

interface Diagnostics {
  apis: boolean;
  worker: boolean;
  permission: NotificationPermission | "unsupported";
  subscription: boolean;
  stored: boolean | null;
  lastTest: PushTest;
}

export function NotificationPanel({
  publicKey,
  prefs,
}: {
  publicKey: string | null;
  /** This admin's saved subscriptions (endpoint → preferences). */
  prefs: Record<string, { enquiries: boolean; reminders: boolean; reviews: boolean }>;
}) {
  const [support, setSupport] = useState<Support>("checking");
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [enquiries, setEnquiries] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [reviews, setReviews] = useState(true);
  const [busy, setBusy] = useState<Busy>(null);
  const [status, setStatus] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [diag, setDiag] = useState<Diagnostics>({
    apis: false,
    worker: false,
    permission: "unsupported",
    subscription: false,
    stored: null,
    lastTest: null,
  });

  const registration = useCallback(async () => {
    // The public site's worker (scope "/") also handles push for the admin; it
    // never caches /admin responses.
    const reg = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;
    return reg;
  }, []);

  /** Re-read every step on this device (no prompts). */
  const refresh = useCallback(async () => {
    const apis = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    if (!apis) {
      setDiag((d) => ({ ...d, apis: false }));
      return null;
    }
    const reg = await registration();
    const existing = await reg.pushManager.getSubscription();
    const device = existing ? await getPushDeviceStatus(existing.endpoint) : { stored: false, lastTest: null };
    setPermission(Notification.permission);
    setDiag({
      apis: true,
      worker: Boolean(reg.active),
      permission: Notification.permission,
      subscription: Boolean(existing),
      stored: existing ? device.stored : null,
      lastTest: device.lastTest,
    });
    setSubscription(existing && device.stored ? existing : null);
    return existing;
  }, [registration]);

  useEffect(() => {
    const check = async () => {
      const apis = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
      const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
      const standalone = window.matchMedia("(display-mode: standalone)").matches;
      if (!apis) return setSupport(ios && !standalone ? "ios-needs-install" : "unsupported");
      if (!publicKey) {
        setSupport("not-configured");
        return void refresh();
      }
      const existing = await refresh();
      const saved = existing ? prefs[existing.endpoint] : undefined;
      if (saved) {
        setEnquiries(saved.enquiries);
        setReminders(saved.reminders);
        setReviews(saved.reviews);
      }
      setSupport("supported");
    };
    void check();
  }, [publicKey, prefs, refresh]);

  const run = async (kind: Busy, work: () => Promise<PushResult | void>) => {
    setBusy(kind);
    setStatus(null);
    try {
      const result = await work();
      if (result) setStatus(result.ok ? { kind: "success", text: result.message } : { kind: "error", text: result.error });
    } catch (error) {
      setStatus({ kind: "error", text: describeActionFailure(error).text });
    } finally {
      setBusy(null);
    }
  };

  const enable = () =>
    run("enable", async () => {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== "granted") {
        await refresh();
        return { ok: false, error: "Notifications are blocked for this site. Allow them in the browser's site settings, then try again." };
      }
      const reg = await registration();
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64ToBytes(publicKey!) }));
      const json = sub.toJSON();
      const saved = await savePushSubscription({ endpoint: json.endpoint, keys: json.keys, userAgent: navigator.userAgent.slice(0, 300) });
      await refresh();
      return saved;
    });

  const disable = () =>
    run("disable", async () => {
      if (!subscription) return;
      const result = await removePushSubscription(subscription.endpoint);
      if (result.ok) {
        await subscription.unsubscribe().catch(() => undefined);
        setSubscription(null);
        await refresh();
      }
      return result;
    });

  // Every step, in order, so a failure names where the chain breaks.
  const test = () =>
    run("test", async () => {
      if (!("serviceWorker" in navigator && "PushManager" in window && "Notification" in window)) {
        return { ok: false, error: "This browser doesn't support push notifications." };
      }
      if (Notification.permission !== "granted") {
        return { ok: false, error: `Notification permission is "${Notification.permission}", not granted. Turn notifications on again.` };
      }
      const existing = await refresh();
      if (!existing) return { ok: false, error: "This device has no push subscription. Turn notifications off and on again." };
      const device = await getPushDeviceStatus(existing.endpoint);
      if (!device.stored) {
        return { ok: false, error: "This device's subscription isn't stored on the server. Turn notifications off and on again." };
      }
      // Listen before sending: on a fast device the service worker can report
      // "shown" before the server action has even returned.
      const shownIds = new Set<string>();
      const collect = (event: MessageEvent) => {
        const data = event.data as { type?: string; testId?: string } | null;
        if (data?.type === "cc-push" && data.testId) shownIds.add(data.testId);
      };
      navigator.serviceWorker.addEventListener("message", collect);
      let sent: Awaited<ReturnType<typeof sendTestPush>>;
      try {
        sent = await sendTestPush(existing.endpoint);
      } catch (error) {
        navigator.serviceWorker.removeEventListener("message", collect);
        throw error;
      }
      if (sent.lastTest) setDiag((d) => ({ ...d, lastTest: sent.lastTest ?? d.lastTest }));
      if (!sent.ok) {
        navigator.serviceWorker.removeEventListener("message", collect);
        return sent;
      }
      setStatus({ kind: "success", text: sent.message });
      const shown = shownIds.has(sent.testId) || (await waitForTestShown(sent.testId, TEST_WAIT_MS));
      navigator.serviceWorker.removeEventListener("message", collect);
      if (!shown) {
        return {
          ok: false,
          error:
            "The push service accepted the test, but this device didn't report showing it within 20 seconds. Check that notifications for this site or app are allowed in the device's settings, and that Focus / Do Not Disturb isn't on.",
        };
      }
      const confirmed = await confirmPushTest(existing.endpoint, sent.testId);
      if (confirmed.lastTest) setDiag((d) => ({ ...d, lastTest: confirmed.lastTest }));
      return { ok: true, message: "Delivered: the test notification was shown on this device." };
    });

  const savePrefs = (next: { enquiries: boolean; reminders: boolean; reviews: boolean }) =>
    run("prefs", async () => {
      if (!subscription) return;
      setEnquiries(next.enquiries);
      setReminders(next.reminders);
      setReviews(next.reviews);
      return setPushPreferences({ endpoint: subscription.endpoint, ...next });
    });

  if (support === "checking") return <p className="text-sm text-muted-foreground">Checking this device…</p>;
  if (support === "ios-needs-install") {
    return (
      <p className="max-w-prose text-sm text-muted-foreground">
        On iPhone and iPad, notifications work only from the installed app: open this page in Safari, tap Share → “Add to
        Home Screen”, then open Canvas Admin from the Home Screen and turn notifications on there.
      </p>
    );
  }
  if (support === "unsupported") {
    return <p className="text-sm text-muted-foreground">This browser doesn&apos;t support notifications. Try Chrome, Edge, Firefox or Safari.</p>;
  }

  const on = Boolean(subscription) && permission === "granted";

  return (
    <div className="grid gap-5">
      {support === "not-configured" ? (
        <p role="status" className="text-sm font-semibold">
          Push notifications aren&apos;t set up on this website yet (the push keys are missing on the server).
        </p>
      ) : (
        <>
          <p role="status" className="text-sm font-semibold">
            {on ? "Notifications are enabled on this device." : "Notifications are not enabled on this device."}
            {permission === "denied" && (
              <span className="block font-normal text-muted-foreground">
                They&apos;re blocked in this browser&apos;s settings for this site; allow them there first.
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {on ? (
              <>
                <Button type="button" pending={busy === "test"} pendingLabel="Testing…" aria-disabled={busy !== null || undefined} onClick={() => busy === null && void test()}>
                  Send test notification
                </Button>
                <Button type="button" variant="outline" pending={busy === "disable"} pendingLabel="Turning off…" aria-disabled={busy !== null || undefined} onClick={() => busy === null && void disable()}>
                  Turn off notifications
                </Button>
              </>
            ) : (
              <Button type="button" pending={busy === "enable"} pendingLabel="Enabling…" aria-disabled={permission === "denied" || busy !== null || undefined} onClick={() => busy === null && void enable()}>
                Turn on notifications
              </Button>
            )}
          </div>
          {on && (
            <fieldset className="grid gap-3" aria-busy={busy === "prefs"}>
              <legend className="text-sm font-semibold">Notify me about</legend>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="notify-enquiries"
                  checked={enquiries}
                  aria-disabled={busy !== null || undefined}
                  onCheckedChange={(v) => busy === null && void savePrefs({ enquiries: v === true, reminders, reviews })}
                />
                <Label htmlFor="notify-enquiries">New enquiries</Label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="notify-reminders"
                  checked={reminders}
                  aria-disabled={busy !== null || undefined}
                  onCheckedChange={(v) => busy === null && void savePrefs({ enquiries, reminders: v === true, reviews })}
                />
                <Label htmlFor="notify-reminders">Calendar reminders</Label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="notify-reviews"
                  checked={reviews}
                  aria-disabled={busy !== null || undefined}
                  onCheckedChange={(v) => busy === null && void savePrefs({ enquiries, reminders, reviews: v === true })}
                />
                <Label htmlFor="notify-reviews">New reviews and feedback</Label>
              </div>
            </fieldset>
          )}
          <p role="alert" className="text-sm font-medium text-destructive empty:hidden">
            {status?.kind === "error" ? status.text : ""}
          </p>
          {status?.kind === "success" && (
            <p role="status" className="text-sm text-muted-foreground">
              {status.text}
            </p>
          )}
        </>
      )}

      <PushDiagnostics diag={diag} vapid={Boolean(publicKey)} />

      <p className="max-w-prose text-xs text-muted-foreground">
        A notification uses this device&apos;s normal alert. We ask for a normal, non-silent notification; whether it makes
        a sound or vibrates is decided by the phone or browser: its notification settings for this site or app, its
        volume, Focus / Do Not Disturb, and battery-saving limits. A custom sound isn&apos;t possible.
      </p>
    </div>
  );
}

function PushDiagnostics({ diag, vapid }: { diag: Diagnostics; vapid: boolean }) {
  const yesNo = (v: boolean) => (v ? "Yes" : "No");
  const permission =
    diag.permission === "unsupported" ? "Not supported" : diag.permission === "default" ? "Not asked yet" : diag.permission === "granted" ? "Granted" : "Denied";
  const last = diag.lastTest
    ? `${diag.lastTest.result === "delivered" ? "Delivered" : diag.lastTest.result === "sent" ? "Sent, not confirmed" : "Failed"} · ${formatShortDateTime(diag.lastTest.at)}`
    : "Never tested";
  const rows: [string, string][] = [
    ["Browser supports notifications", yesNo(diag.apis)],
    ["Service worker registered", yesNo(diag.worker)],
    ["Notification permission", permission],
    ["Push subscription", diag.subscription ? "Active" : "Missing"],
    ["Subscription stored", diag.stored === null ? "—" : yesNo(diag.stored)],
    ["Push keys configured", yesNo(vapid)],
    ["Last test notification", last],
  ];
  return (
    <details className="border border-border bg-background">
      <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">Diagnostics for this device</summary>
      <dl className="grid gap-x-6 gap-y-2 border-t border-border px-4 py-3 text-sm sm:grid-cols-[auto_1fr]">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-medium" data-diag={label}>
              {value}
            </dd>
          </div>
        ))}
        {diag.lastTest?.result === "failed" && (
          <p className="text-xs text-destructive sm:col-span-2">{diag.lastTest.detail}</p>
        )}
      </dl>
    </details>
  );
}
