"use client";

import { useEffect } from "react";

/**
 * Registers the public-site service worker (public/sw.js). Production only,
 * so development never serves stale cached assets. Rendered from the public
 * (site) layout; the worker itself ignores /admin requests entirely.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch(() => {
        // Registration failures only mean no offline support; the site works normally.
      });
  }, []);

  return null;
}
