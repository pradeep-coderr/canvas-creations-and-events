import Link from "next/link";
import { BellRing, CircleCheck, ClipboardList, Inbox, MessageCircle, Star, type LucideIcon } from "lucide-react";
import type { AdminNotification, NotificationKind } from "@/lib/admin/notifications";
import { cn } from "@/lib/utils";

/* One notification, as the header's bell menu and the Notifications page show it. */

const ICONS: Record<NotificationKind, { icon: LucideIcon; tone: string }> = {
  enquiry: { icon: Inbox, tone: "bg-surface-blush text-emphasis" },
  chat: { icon: MessageCircle, tone: "bg-surface-blush text-emphasis" },
  "quote-details": { icon: ClipboardList, tone: "bg-surface-ivory text-[#8a6427]" },
  "quote-accepted": { icon: CircleCheck, tone: "bg-[#eef6f1] text-[#2f6b4c]" },
  review: { icon: Star, tone: "bg-surface-ivory text-[#8a6427]" },
  reminder: { icon: BellRing, tone: "bg-destructive/10 text-destructive" },
};

/** "Today", "Yesterday" or a date. */
export function notificationDay(iso: string, now: number) {
  const d = new Date(iso);
  if (d.toDateString() === new Date(now).toDateString()) return "Today";
  if (d.toDateString() === new Date(now - 24 * 3600 * 1000).toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" });
}

/** "2:15 pm" today, otherwise "14 Oct". */
function shortWhen(iso: string, now: number, withDay: boolean) {
  const d = new Date(iso);
  if (!withDay || d.toDateString() === new Date(now).toDateString()) return d.toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" });
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}

export function NotificationItem({
  item,
  isNew,
  now,
  compact = false,
  onOpen,
}: {
  item: AdminNotification;
  isNew: boolean;
  now: number;
  /** The bell menu: smaller, and the date shown when it isn't today. */
  compact?: boolean;
  onOpen?: () => void;
}) {
  const { icon: Icon, tone } = ICONS[item.kind];
  return (
    <Link
      href={item.href}
      onClick={onOpen}
      className={cn(
        "flex items-start gap-3 transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none",
        compact ? "px-3 py-2.5" : "gap-3.5 px-4 py-3.5 sm:px-5",
        isNew && "bg-surface-blush/40",
      )}
    >
      <span aria-hidden="true" className={cn("flex shrink-0 items-center justify-center rounded-full", compact ? "size-8" : "size-10", tone)}>
        <Icon className={compact ? "size-4" : "size-5"} />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block text-sm", isNew ? "font-bold" : "font-semibold", compact && "line-clamp-2")}>{item.title}</span>
        {item.detail && <span className="mt-0.5 block truncate text-[13px] text-muted-foreground">{item.detail}</span>}
      </span>
      <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground tabular-nums">
        {shortWhen(item.at, now, compact)}
        {isNew && (
          <span className="size-2.5 rounded-full bg-emphasis">
            <span className="sr-only">New</span>
          </span>
        )}
      </span>
    </Link>
  );
}
