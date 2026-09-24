"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const sections = [
  { label: "Enquiries", href: "/admin", match: (p: string) => p === "/admin" || p.startsWith("/admin/enquiries") },
  { label: "Content", href: "/admin/content", match: (p: string) => p.startsWith("/admin/content") },
] as const;

/** Enquiries | Content. The current section is marked with aria-current and an underline, not colour alone. */
export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin sections">
      <ul className="flex gap-2">
        {sections.map((s) => {
          const current = s.match(pathname);
          return (
            <li key={s.href}>
              <Link
                href={s.href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "inline-flex h-11 items-center border-b-2 px-3 text-sm font-semibold transition-colors",
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
