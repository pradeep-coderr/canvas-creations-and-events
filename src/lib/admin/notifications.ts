import "server-only";
import type { createClient } from "@/lib/supabase/server";

/*
 * Admin → Notifications: one feed built from what's already stored, the
 * last 30 days, newest first. "New" means after this admin's read marker
 * (admin_notification_reads); a first visit treats the last 7 days as new.
 */

type Supabase = Awaited<ReturnType<typeof createClient>>;

export type NotificationKind = "enquiry" | "chat" | "quote-details" | "quote-accepted" | "review" | "reminder";

export interface AdminNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  detail: string | null;
  at: string;
  href: string;
  unread: boolean;
}

const DAY = 24 * 3600 * 1000;
const one = <T,>(v: T | T[] | null | undefined): T | null => (Array.isArray(v) ? (v[0] ?? null) : (v ?? null));

/** This admin's read marker (null: never opened Notifications). */
async function readMarker(supabase: Supabase, userId: string) {
  const { data } = await supabase.from("admin_notification_reads").select("read_at").eq("user_id", userId).maybeSingle();
  return data?.read_at ? new Date(data.read_at as string).getTime() : null;
}

export async function loadNotifications(supabase: Supabase, userId: string, limit = 100): Promise<AdminNotification[]> {
  const now = Date.now();
  const since = new Date(now - 30 * DAY).toISOString();
  const [marker, enquiries, chatEvents, reviews, reminders] = await Promise.all([
    readMarker(supabase, userId),
    supabase
      .from("enquiries")
      .select("id, name, event_type, event_date, source, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(limit),
    // Chats: details shared (asked for the team), quote details, quote accepted.
    supabase
      .from("chat_messages")
      .select("id, conversation_id, sender, kind, created_at, chat:chat_conversations(name)")
      .gte("created_at", since)
      .or("and(sender.eq.system,kind.is.null),kind.eq.quote_details,kind.eq.quote_accept")
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("reviews")
      .select("id, name, rating, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(limit),
    // Reminders that are due (or overdue) and not done.
    supabase
      .from("admin_reminders")
      .select("id, title, due_at")
      .is("completed_at", null)
      .lte("due_at", new Date(now).toISOString())
      .gte("due_at", since)
      .order("due_at", { ascending: false })
      .limit(limit),
  ]);
  for (const r of [enquiries, chatEvents, reviews, reminders]) {
    if (r.error) console.error("[notifications] load failed", { code: r.error.code });
  }

  const items: Omit<AdminNotification, "unread">[] = [];
  for (const e of enquiries.data ?? []) {
    // Enquiries made from a chat are the team's own action: not news.
    if (e.source === "chat") continue;
    const when = e.event_date
      ? new Date(`${e.event_date}T00:00:00`).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })
      : null;
    items.push({
      id: `enquiry:${e.id}`,
      kind: "enquiry",
      title: `New enquiry from ${e.name}`,
      detail: [e.event_type, when].filter(Boolean).join(" · ") || null,
      at: e.created_at as string,
      href: `/admin/enquiries/${e.id}`,
    });
  }
  for (const m of chatEvents.data ?? []) {
    const name = one(m.chat as { name: string | null } | { name: string | null }[] | null)?.name ?? "A visitor";
    const href = `/admin/chats?c=${m.conversation_id}`;
    if (m.kind === "quote_details") {
      items.push({ id: `chat:${m.id}`, kind: "quote-details", title: `${name} sent their quote details`, detail: "Ready for a quote", at: m.created_at as string, href });
    } else if (m.kind === "quote_accept") {
      items.push({ id: `chat:${m.id}`, kind: "quote-accepted", title: `${name} accepted the quote`, detail: "Follow up to confirm the booking", at: m.created_at as string, href });
    } else {
      items.push({ id: `chat:${m.id}`, kind: "chat", title: `${name} asked for the team`, detail: "In the website chat", at: m.created_at as string, href });
    }
  }
  for (const r of reviews.data ?? []) {
    items.push({
      id: `review:${r.id}`,
      kind: "review",
      title: `New review from ${r.name}`,
      detail: `${r.rating} out of 5 stars`,
      at: r.created_at as string,
      href: "/admin/reviews",
    });
  }
  for (const r of reminders.data ?? []) {
    items.push({ id: `reminder:${r.id}`, kind: "reminder", title: `Reminder: ${r.title}`, detail: "Due", at: r.due_at as string, href: "/admin/calendar" });
  }

  const newSince = marker ?? now - 7 * DAY;
  return items
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, limit)
    .map((item) => ({ ...item, unread: new Date(item.at).getTime() > newSince }));
}
