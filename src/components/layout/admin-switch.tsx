"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { CircleUserRound, UserRoundCog } from "lucide-react";
import { Button } from "@/components/ui/button";

/*
 * Site header: a round icon, "Admin" in a browser that's signed in to the
 * admin (it has a Supabase auth cookie), otherwise "Login", so it stays quiet
 * beside the enquiry button. The cookie check is a hint only:
 * /admin itself still checks the session and the admin role. No Supabase
 * code is loaded on the public site for this.
 */
// This project's own cookie only: Supabase names it after the project's
// address ("sb-<first part of the host>-auth-token", split into .0/.1 when
// long). Cookies ignore the port, so on localhost another project's Supabase
// login would otherwise show "Admin" here after signing out.
const cookieName = (() => {
  try {
    return `sb-${new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname.split(".")[0]}-auth-token`;
  } catch {
    return null;
  }
})();
const escaped = cookieName?.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const hasSession = () => Boolean(escaped && new RegExp(`(?:^|;\\s*)${escaped}(?:\\.0)?=`).test(document.cookie));
// Signing in or out in another tab: check again when this page is shown.
const subscribe = (onChange: () => void) => {
  window.addEventListener("pageshow", onChange);
  document.addEventListener("visibilitychange", onChange);
  return () => {
    window.removeEventListener("pageshow", onChange);
    document.removeEventListener("visibilitychange", onChange);
  };
};

export function AdminSwitch() {
  const signedIn = useSyncExternalStore(subscribe, hasSession, () => false);
  return (
    <Button asChild variant="ghost" size="icon" className="rounded-full" title={signedIn ? "Admin" : "Login"}>
      <Link href={signedIn ? "/admin" : "/admin/login"} prefetch={false}>
        {signedIn ? <UserRoundCog className="size-5" /> : <CircleUserRound className="size-5" />}
        <span className="sr-only">{signedIn ? "Admin" : "Login"}</span>
      </Link>
    </Button>
  );
}
