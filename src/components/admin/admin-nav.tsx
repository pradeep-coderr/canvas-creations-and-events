"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CalendarDays, FileText, Inbox, MessageCircle, Palette, Settings, Star, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Section {
  label: string;
  href: string;
  icon: LucideIcon;
  match: (p: string) => boolean;
}

const sections: Section[] = [
  { label: "Enquiries", href: "/admin", icon: Inbox, match: (p) => p === "/admin" || p.startsWith("/admin/enquiries") },
  { label: "Chats", href: "/admin/chats", icon: MessageCircle, match: (p) => p.startsWith("/admin/chats") },
  // The full list (the count is on the header's bell).
  { label: "Notifications", href: "/admin/notifications", icon: Bell, match: (p) => p.startsWith("/admin/notifications") },
  { label: "Reviews", href: "/admin/reviews", icon: Star, match: (p) => p.startsWith("/admin/reviews") },
  { label: "Content", href: "/admin/content", icon: FileText, match: (p) => p.startsWith("/admin/content") },
  { label: "Calendar", href: "/admin/calendar", icon: CalendarDays, match: (p) => p.startsWith("/admin/calendar") },
  { label: "Design", href: "/admin/design", icon: Palette, match: (p) => p.startsWith("/admin/design") },
];

// Super admins only (the server decides; the page itself also checks).
const superSections: Section[] = [
  { label: "Settings", href: "/admin/settings", icon: Settings, match: (p) => p.startsWith("/admin/settings") },
];

/**
 * The admin sections as tabs. The current one is marked with aria-current
 * and an underline (not colour alone). On narrow screens the row scrolls
 * sideways: the current tab is brought into view, and a soft fade shows
 * when there are more tabs off-screen.
 */
export function AdminNav({
  superAdmin = false,
  chatUnread = 0,
  className,
}: {
  superAdmin?: boolean;
  chatUnread?: number;
  className?: string;
}) {
  const pathname = usePathname();
  const items = superAdmin ? [...sections, ...superSections] : sections;
  const listRef = useRef<HTMLUListElement>(null);
  const [more, setMore] = useState({ left: false, right: false });

  const measure = () => {
    const el = listRef.current;
    if (!el) return;
    setMore({ left: el.scrollLeft > 4, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  };

  // Bring the current tab into view (phones), and keep the fades right on resize.
  useEffect(() => {
    const el = listRef.current;
    const current = el?.querySelector<HTMLElement>("[aria-current=page]");
    if (el && current) el.scrollTo({ left: current.offsetLeft - (el.clientWidth - current.offsetWidth) / 2 });
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [pathname]);

  const fade = more.left && more.right
    ? "[mask-image:linear-gradient(to_right,transparent,black_2rem,black_calc(100%-2rem),transparent)]"
    : more.right
      ? "[mask-image:linear-gradient(to_right,black_calc(100%-2.5rem),transparent)]"
      : more.left
        ? "[mask-image:linear-gradient(to_right,transparent,black_2.5rem)]"
        : "";

  return (
    <nav aria-label="Admin sections" className={cn("min-w-0", className)}>
      <ul ref={listRef} onScroll={measure} className={cn("flex gap-1 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden", fade)}>
        {items.map((s) => {
          const current = s.match(pathname);
          const Icon = s.icon;
          return (
            <li key={s.href} className="shrink-0">
              <Link
                href={s.href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "group relative inline-flex h-11 items-center gap-2 px-3 text-sm font-semibold whitespace-nowrap transition-colors 2xl:h-16",
                  // The underline sits on the header's bottom border.
                  "after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:transition-colors",
                  current
                    ? "text-foreground after:bg-primary"
                    : "text-muted-foreground after:bg-transparent hover:text-foreground hover:after:bg-foreground/20",
                )}
              >
                <Icon aria-hidden="true" className={cn("size-4 shrink-0", current ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {s.label}
                {s.href === "/admin/chats" && chatUnread > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emphasis px-1.5 text-[11px] font-bold text-white">
                    {chatUnread}
                    <span className="sr-only"> chats with unread messages</span>
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
