"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Bell, CheckCheck } from "lucide-react";
import { markNotificationsRead } from "@/app/admin/(portal)/notifications/actions";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { AdminNotification } from "@/lib/admin/notifications";
import { cn } from "@/lib/utils";
import { NotificationItem } from "./notification-item";

/**
 * The header's bell: a count of new notifications, and a menu with the
 * latest ones. Opening it reads them (the count clears; they stay
 * highlighted while it's open). "View all" opens Admin → Notifications.
 */
export function AdminNotificationsBell({ items, unread, now }: { items: AdminNotification[]; unread: number; now: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [marking, startMarking] = useTransition();
  // What was new when the menu was opened stays highlighted until it closes.
  const [seenNew, setSeenNew] = useState<Set<string>>(new Set());

  const markRead = () =>
    startMarking(async () => {
      await markNotificationsRead();
      router.refresh();
    });

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setSeenNew(new Set(items.filter((i) => i.unread).map((i) => i.id)));
          // Opening the menu is reading it.
          if (unread) markRead();
        }
      }}
    >
      <PopoverTrigger
        aria-label={unread ? `Notifications, ${unread} new` : "Notifications"}
        title="Notifications"
        className="relative flex size-11 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none data-[state=open]:bg-accent"
      >
        <Bell className="size-5" aria-hidden="true" />
        {unread > 0 && (
          <span
            aria-hidden="true"
            className="absolute top-1 right-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-background bg-emphasis px-1 text-[10px] font-bold text-white"
          >
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="flex max-h-[min(36rem,80dvh)] w-[min(24rem,calc(100vw-1.5rem))] flex-col gap-0 overflow-hidden p-0">
        <div className="flex items-center justify-between gap-3 border-b border-border px-3.5 py-3">
          <p className="text-sm font-bold">
            Notifications
            {seenNew.size > 0 && <span className="ml-1.5 font-semibold text-emphasis">{seenNew.size} new</span>}
          </p>
          <button
            type="button"
            onClick={markRead}
            disabled={marking}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-emphasis hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-60"
          >
            <CheckCheck className="size-3.5" aria-hidden="true" />
            Mark all as read
          </button>
        </div>
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
            <Bell className="size-6 text-primary" aria-hidden="true" />
            <p className="text-sm font-semibold">No notifications yet</p>
            <p className="text-xs text-muted-foreground">New enquiries, chats, quotes, reviews and due reminders show up here.</p>
          </div>
        ) : (
          <ul className="min-h-0 flex-1 divide-y divide-border overflow-y-auto">
            {items.map((n) => (
              <li key={n.id}>
                <NotificationItem item={n} isNew={seenNew.has(n.id)} now={now} compact onOpen={() => setOpen(false)} />
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/admin/notifications"
          onClick={() => setOpen(false)}
          className={cn(
            "flex items-center justify-center gap-1.5 border-t border-border px-3.5 py-3 text-sm font-semibold text-emphasis hover:bg-accent focus-visible:bg-accent focus-visible:outline-none",
          )}
        >
          View all notifications
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </PopoverContent>
    </Popover>
  );
}
