import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/session";
import { loadNotifications } from "@/lib/admin/notifications";
import { createClient } from "@/lib/supabase/server";
import { NotificationList } from "./notification-list";

export const metadata: Metadata = { title: "Notifications" };

/** When this render's data was read (for "Today" / "Yesterday"). */
const readAt = () => Date.now();

/**
 * Everything that needs the team's attention, newest first: new enquiries,
 * chats asking for the team, quote details and acceptances, new reviews and
 * due reminders. Opening the page marks them read (they stay highlighted
 * for this visit).
 */
export default async function NotificationsPage() {
  const admin = await requireAdmin();
  const supabase = await createClient();
  const items = await loadNotifications(supabase, admin.userId);
  return (
    <>
      <h1 className="font-display text-display-md font-title">Notifications</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        New enquiries, chats asking for the team, quotes, reviews and reminders from the last 30 days.
      </p>
      <NotificationList items={items} now={readAt()} />
    </>
  );
}
