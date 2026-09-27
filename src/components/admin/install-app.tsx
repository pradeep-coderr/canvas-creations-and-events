"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

/*
 * "Install app" for the Canvas Admin PWA (rendered only for super admins —
 * the server decides). Uses the browser's own install prompt where it exists
 * (Chromium: beforeinstallprompt, kept until the button is pressed). Where
 * there's no prompt (iPhone/iPad Safari, Firefox), it explains how to add the
 * app from the browser menu instead of pretending to install.
 */

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Mode = "checking" | "installed" | "prompt" | "ios" | "manual";

export function InstallApp({ compact = false }: { compact?: boolean }) {
  const [mode, setMode] = useState<Mode>("checking");
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [busy, setBusy] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const initial: Mode = standalone ? "installed" : ios ? "ios" : "manual";
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
      setMode("prompt");
    };
    const onInstalled = () => {
      setPromptEvent(null);
      setMode("installed");
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    // Decide after the current render (a prompt event may still arrive).
    const id = window.setTimeout(() => setMode((m) => (m === "checking" ? initial : m)), 0);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (mode === "checking") return null;

  if (mode === "installed") {
    return compact ? null : <p className="text-sm text-muted-foreground">Canvas Admin is installed on this device.</p>;
  }

  if (mode === "prompt" && promptEvent) {
    return (
      <Button
        type="button"
        variant={compact ? "outline" : "default"}
        pending={busy}
        pendingLabel="Installing…"
        onClick={async () => {
          setBusy(true);
          try {
            await promptEvent.prompt();
            const { outcome } = await promptEvent.userChoice;
            if (outcome === "accepted") setMode("installed");
          } finally {
            setBusy(false);
            setPromptEvent(null);
            setMode((m) => (m === "prompt" ? "manual" : m));
          }
        }}
      >
        <Download data-icon="inline-start" aria-hidden="true" />
        {/* Icon-only in the phone header, where space is tight. */}
        <span className={compact ? "sr-only sm:not-sr-only" : undefined}>Install app</span>
      </Button>
    );
  }

  if (compact) return null;

  return (
    <div className="grid gap-2 text-sm">
      <Button type="button" variant="outline" className="justify-self-start" aria-expanded={showHelp} onClick={() => setShowHelp((s) => !s)}>
        <Download data-icon="inline-start" aria-hidden="true" />
        How to install the app
      </Button>
      {showHelp && (
        <p className="max-w-prose text-muted-foreground">
          {mode === "ios"
            ? "On iPhone or iPad: open this page in Safari, tap the Share button, then “Add to Home Screen”. Notifications work from the Home Screen app."
            : "Use your browser's menu: “Install app” or “Add to Home screen”. If you don't see it, this browser can't install web apps — try Chrome or Edge."}
        </p>
      )}
    </div>
  );
}
