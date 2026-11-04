"use client";

import { useTransition } from "react";
import Link from "next/link";
import { House, LogOut } from "lucide-react";
import { signOut } from "@/app/admin/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Two letters for the account button, from the email ("pradeep.p@…" → "PP"). */
function initials(email: string | null) {
  if (!email) return "A";
  const name = email.split("@")[0];
  const parts = name.split(/[._-]+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : name.replace(/[^a-z]/gi, "").slice(0, 2);
  return (letters || "A").toUpperCase();
}

/**
 * The signed-in admin: a round button with their initials. The menu shows
 * who's signed in, "View website" (on phones, where the header has no room
 * for it), and Sign out.
 */
export function AdminAccountMenu({ email }: { email: string | null }) {
  const [signingOut, startSignOut] = useTransition();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Account${email ? `: ${email}` : ""}`}
        title={email ?? "Account"}
        className="flex size-11 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-surface-blush text-sm font-bold text-emphasis transition-colors hover:border-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none data-[state=open]:border-primary"
      >
        {initials(email)}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 rounded-md p-1 shadow-soft">
        <DropdownMenuLabel className="px-2 py-2 font-normal">
          <span className="block text-xs text-muted-foreground">Signed in as</span>
          <span className="block truncate text-sm font-semibold text-foreground">{email ?? "Admin"}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="min-h-11 lg:hidden">
          <Link href="/">
            <House aria-hidden="true" />
            View website
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="min-h-11"
          disabled={signingOut}
          onSelect={(event) => {
            // Keep the menu open while signing out (it says so), then the page changes.
            event.preventDefault();
            startSignOut(async () => {
              await signOut();
            });
          }}
        >
          <LogOut aria-hidden="true" />
          {signingOut ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
