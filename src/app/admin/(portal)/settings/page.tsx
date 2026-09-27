import type { Metadata } from "next";
import { InstallApp } from "@/components/admin/install-app";
import { NotificationPanel } from "@/components/admin/notification-panel";
import { requireSuperAdmin } from "@/lib/admin/session";
import { pushConfigured } from "@/lib/push/server";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Settings" };

/** Super admins only: the admin app on this device (install, notifications). */
export default async function SettingsPage() {
  const admin = await requireSuperAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("push_subscriptions")
    .select("endpoint, notify_enquiries, notify_reminders")
    .eq("admin_user_id", admin.userId)
    .is("revoked_at", null);
  const prefs = Object.fromEntries(
    (data ?? []).map((s) => [s.endpoint, { enquiries: s.notify_enquiries, reminders: s.notify_reminders }]),
  );

  return (
    <>
      <h1 className="font-display text-display-md font-title">Settings</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">The Canvas Admin app on this device. Only super admins see this page.</p>

      <section aria-labelledby="install-title" className="mt-10 max-w-2xl border-t border-border pt-8">
        <h2 id="install-title" className="font-display text-display-sm font-title">
          Install the app
        </h2>
        <p className="mt-2 mb-5 text-sm text-muted-foreground">
          Opens straight into the admin, with shortcuts to enquiries and the calendar.
        </p>
        <InstallApp />
      </section>

      <section aria-labelledby="notify-title" className="mt-10 max-w-2xl border-t border-border pt-8">
        <h2 id="notify-title" className="mb-5 font-display text-display-sm font-title">
          Notifications
        </h2>
        <NotificationPanel publicKey={pushConfigured() ? (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null) : null} prefs={prefs} />
      </section>
    </>
  );
}
