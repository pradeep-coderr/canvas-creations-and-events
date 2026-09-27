"use client";

import { useCallback, useEffect, useState } from "react";
import {
  removePushSubscription,
  savePushSubscription,
  sendTestPush,
  setPushPreferences,
  type PushResult,
} from "@/app/admin/(portal)/settings/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { describeActionFailure } from "@/lib/admin/action-error";

/*
 * Push notifications for this device (super admins). Nothing is requested on
 * page load: the browser's permission prompt appears only after "Turn on
 * notifications" is pressed. Support is detected, not assumed (iPhone/iPad
 * need the app added to the Home Screen first).
 */

type Support = "checking" | "supported" | "unsupported" | "ios-needs-install" | "not-configured";
type Busy = null | "enable" | "disable" | "test" | "prefs";

function base64ToBytes(base64: string) {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(padded);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

export function NotificationPanel({
  publicKey,
  prefs,
}: {
  publicKey: string | null;
  /** This admin's saved subscriptions (endpoint → preferences). */
  prefs: Record<string, { enquiries: boolean; reminders: boolean }>;
}) {
  const [support, setSupport] = useState<Support>("checking");
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [enquiries, setEnquiries] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [busy, setBusy] = useState<Busy>(null);
  const [status, setStatus] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const registration = useCallback(async () => {
    // The public site's worker (scope "/") also handles push for the admin; it
    // never caches /admin responses.
    return navigator.serviceWorker.register("/sw.js");
  }, []);

  useEffect(() => {
    const check = async () => {
      if (!publicKey) return setSupport("not-configured");
      const hasApis = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
      const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
      const standalone = window.matchMedia("(display-mode: standalone)").matches;
      if (!hasApis) return setSupport(ios && !standalone ? "ios-needs-install" : "unsupported");
      setPermission(Notification.permission);
      const reg = await registration();
      const existing = await reg.pushManager.getSubscription();
      const saved = existing ? prefs[existing.endpoint] : undefined;
      setSubscription(existing && saved ? existing : null);
      if (saved) {
        setEnquiries(saved.enquiries);
        setReminders(saved.reminders);
      }
      setSupport("supported");
    };
    void check();
  }, [publicKey, prefs, registration]);

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
        return { ok: false, error: "Notifications are blocked for this site. Allow them in the browser's site settings, then try again." };
      }
      const reg = await registration();
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64ToBytes(publicKey!) }));
      const json = sub.toJSON();
      const saved = await savePushSubscription({ endpoint: json.endpoint, keys: json.keys, userAgent: navigator.userAgent.slice(0, 300) });
      if (saved.ok) setSubscription(sub);
      return saved;
    });

  const disable = () =>
    run("disable", async () => {
      if (!subscription) return;
      const result = await removePushSubscription(subscription.endpoint);
      if (result.ok) {
        await subscription.unsubscribe().catch(() => undefined);
        setSubscription(null);
      }
      return result;
    });

  const savePrefs = (next: { enquiries: boolean; reminders: boolean }) =>
    run("prefs", async () => {
      if (!subscription) return;
      setEnquiries(next.enquiries);
      setReminders(next.reminders);
      return setPushPreferences({ endpoint: subscription.endpoint, ...next });
    });

  if (support === "checking") return <p className="text-sm text-muted-foreground">Checking this device…</p>;
  if (support === "not-configured") {
    return <p className="text-sm text-muted-foreground">Notifications aren&apos;t set up on this website yet (the push keys are missing).</p>;
  }
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
            <Button type="button" variant="outline" pending={busy === "disable"} pendingLabel="Turning off…" aria-disabled={busy !== null || undefined} onClick={() => void disable()}>
              Turn off notifications
            </Button>
            <Button
              type="button"
              variant="secondary"
              pending={busy === "test"}
              pendingLabel="Sending…"
              aria-disabled={busy !== null || undefined}
              onClick={() => void run("test", () => sendTestPush(subscription!.endpoint))}
            >
              Send test notification
            </Button>
          </>
        ) : (
          <Button type="button" pending={busy === "enable"} pendingLabel="Enabling…" aria-disabled={permission === "denied" || busy !== null || undefined} onClick={() => void enable()}>
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
              onCheckedChange={(v) => busy === null && void savePrefs({ enquiries: v === true, reminders })}
            />
            <Label htmlFor="notify-enquiries">New enquiries</Label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              id="notify-reminders"
              checked={reminders}
              aria-disabled={busy !== null || undefined}
              onCheckedChange={(v) => busy === null && void savePrefs({ enquiries, reminders: v === true })}
            />
            <Label htmlFor="notify-reminders">Calendar reminders</Label>
          </div>
        </fieldset>
      )}
      <p className="max-w-prose text-xs text-muted-foreground">
        Notifications use this device&apos;s normal alert: whether they make a sound or vibrate depends on the browser and
        the device&apos;s notification settings.
      </p>
      <p role="alert" className="text-sm font-medium text-destructive empty:hidden">
        {status?.kind === "error" ? status.text : ""}
      </p>
      {status?.kind === "success" && <p className="text-sm text-muted-foreground">{status.text}</p>}
    </div>
  );
}
