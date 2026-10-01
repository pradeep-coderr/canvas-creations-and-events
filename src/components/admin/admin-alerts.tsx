"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BellRing, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/*
 * In-app alert while the admin is open: the service worker forwards each push
 * (it still shows the system notification). Announced politely; nothing is
 * played automatically — the system notification carries the device's sound.
 */
export function AdminAlerts() {
  const [alert, setAlert] = useState<{ title: string; url: string } | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const onMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; title?: string; url?: string; testId?: string } | null;
      if (data?.type !== "cc-push" || typeof data.url !== "string" || !data.url.startsWith("/admin")) return;
      // Settings shows its own result for a test notification.
      if (data.testId) return;
      setAlert({ title: typeof data.title === "string" ? data.title : "New notification", url: data.url });
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setAlert(null), 15000);
    };
    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, []);

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      {alert && (
        <div role="status" className="pointer-events-auto flex max-w-md items-center gap-3 border border-border bg-background p-3 pl-4 shadow-lift">
          <BellRing aria-hidden="true" className="size-5 shrink-0 text-primary" />
          <p className="min-w-0 flex-1 text-sm font-semibold">{alert.title === "New enquiry" ? "New enquiry received" : alert.title === "New review" ? "New review received" : alert.title}</p>
          <Button asChild size="sm" className="h-11">
            <Link href={alert.url as never} onClick={() => setAlert(null)}>
              View
            </Link>
          </Button>
          <Button type="button" variant="ghost" size="icon" aria-label="Dismiss" onClick={() => setAlert(null)}>
            <X aria-hidden="true" />
          </Button>
        </div>
      )}
    </div>
  );
}
