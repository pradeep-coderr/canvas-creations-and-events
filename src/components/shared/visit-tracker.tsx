"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { recordPageView, startVisitTracking } from "@/lib/visitor/signals";

/**
 * This visit's pages, sections seen and activity (this tab only), for the
 * visitor info on chats and enquiries (lib/visitor/signals.ts).
 */
export function VisitTracker() {
  const pathname = usePathname();
  useEffect(() => startVisitTracking(), []);
  useEffect(() => {
    recordPageView(pathname);
  }, [pathname]);
  return null;
}
