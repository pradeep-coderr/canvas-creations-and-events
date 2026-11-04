"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationItem, notificationDay } from "@/components/admin/notification-item";
import type { AdminNotification } from "@/lib/admin/notifications";
import { cn } from "@/lib/utils";
import { markNotificationsRead } from "./actions";

export function NotificationList({ items, now }: { items: AdminNotification[]; now: number }) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [pending, start] = useTransition();
  // What was new when the page opened stays highlighted for this visit.
  const [unreadIds] = useState(() => new Set(items.filter((i) => i.unread).map((i) => i.id)));
  const unreadCount = unreadIds.size;

  // Opening the page reads them (the tab's badge clears).
  useEffect(() => {
    if (!unreadCount) return;
    const id = window.setTimeout(() => void markNotificationsRead().then(() => router.refresh()), 1500);
    return () => window.clearTimeout(id);
  }, [unreadCount, router]);

  const shown = filter === "unread" ? items.filter((i) => unreadIds.has(i.id)) : items;
  const groups: { label: string; items: AdminNotification[] }[] = [];
  for (const item of shown) {
    const label = notificationDay(item.at, now);
    const last = groups.at(-1);
    if (last?.label === label) last.items.push(item);
    else groups.push({ label, items: [item] });
  }

  return (
    <div className="mt-8 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Show" className="flex gap-1 rounded-lg bg-surface-ivory p-1">
          {(["all", "unread"] as const).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                filter === f ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f === "all" ? "All" : "New"}
              <span className="text-muted-foreground tabular-nums">{f === "all" ? items.length : unreadCount}</span>
            </button>
          ))}
        </nav>
        <Button
          type="button"
          variant="outline"
          size="sm"
          pending={pending}
          pendingLabel="Marking…"
          aria-disabled={!unreadCount || undefined}
          onClick={() => unreadCount && start(async () => {
            await markNotificationsRead();
            router.refresh();
          })}
        >
          <CheckCheck data-icon="inline-start" />
          Mark all as read
        </Button>
      </div>

      {shown.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-border bg-background px-6 py-14 text-center">
          <Bell className="size-8 text-primary" aria-hidden="true" />
          <p className="font-display text-display-sm font-title">{filter === "unread" ? "Nothing new" : "No notifications yet"}</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            New enquiries, chats asking for the team, quotes, reviews and due reminders appear here.
          </p>
        </div>
      ) : (
        groups.map((group) => (
          <section key={group.label} aria-labelledby={`n-${group.label}`} className="mt-8">
            <h2 id={`n-${group.label}`} className="text-eyebrow font-semibold text-emphasis uppercase">
              {group.label}
            </h2>
            <ul className="mt-3 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-background">
              {group.items.map((n) => (
                <li key={n.id}>
                  <NotificationItem item={n} isNew={unreadIds.has(n.id)} now={now} />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
