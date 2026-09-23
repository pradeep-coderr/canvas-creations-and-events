"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

const isScrolled = () => window.scrollY > 8;

/**
 * Sticky <header>. At the top of the page it sits flush with the content;
 * once the page scrolls it gains a hairline and a soft shadow. No resizing.
 */
export function HeaderShell({ children }: { children: React.ReactNode }) {
  const scrolled = useSyncExternalStore(subscribe, isScrolled, () => false);

  return (
    <header
      data-scrolled={scrolled || undefined}
      className="sticky top-0 z-40 border-b border-transparent bg-background transition-[border-color,box-shadow] duration-500 ease-elegant data-scrolled:border-border data-scrolled:shadow-soft"
    >
      {children}
    </header>
  );
}
