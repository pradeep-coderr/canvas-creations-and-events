"use client";

import { useSyncExternalStore } from "react";

/**
 * Whether a media query matches, kept in sync as it changes. On the server
 * (and during hydration) it reports `serverValue`.
 */
export function useMediaQuery(query: string, serverValue = false) {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}
