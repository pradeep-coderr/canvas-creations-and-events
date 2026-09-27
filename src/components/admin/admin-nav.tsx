"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const sections = [
  { label: "Enquiries", href: "/admin", match: (p: string) => p === "/admin" || p.startsWith("/admin/enquiries") },
  { label: "Content", href: "/admin/content", match: (p: string) => p.startsWith("/admin/content") },
  { label: "Calendar", href: "/admin/calendar", match: (p: string) => p.startsWith("/admin/calendar") },
  { label: "Design", href: "/admin/design", match: (p: string) => p.startsWith("/admin/design") },
] as const;

// Super admins only (the server decides; the page itself also checks).
const superSections = [
  { label: "Settings", href: "/admin/settings", match: (p: string) => p.startsWith("/admin/settings") },
] as const;

/** Enquiries | Content | Design (the "Edit website" button beside it opens the editor). The current section is marked with aria-current and an underline, not colour alone. */
export function AdminNav({ superAdmin = false }: { superAdmin?: boolean }) {
  const pathname = usePathname();
  const items = superAdmin ? [...sections, ...superSections] : sections;
  return (
    <nav aria-label="Admin sections" className="min-w-0 overflow-x-auto">
      <ul className="flex gap-1 sm:gap-2">
        {items.map((s) => {
          const current = s.match(pathname);
          return (
            <li key={s.href}>
              <Link
                href={s.href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "inline-flex h-11 items-center border-b-2 px-2 text-sm font-semibold whitespace-nowrap transition-colors sm:px-3",
                  current
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:border-foreground/25 hover:text-foreground",
                )}
              >
                {s.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
