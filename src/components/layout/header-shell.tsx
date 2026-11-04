"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

const isScrolled = () => window.scrollY > 8;

/**
 * Sticky <header>, frosted with a hairline like the admin header. Once the
 * page scrolls it gains a soft shadow, and the thin gold ribbon along its
 * bottom edge fills as you go. No resizing.
 */
export function HeaderShell({ children }: { children: React.ReactNode }) {
  const scrolled = useSyncExternalStore(subscribe, isScrolled, () => false);
  const header = useRef<HTMLElement>(null);

  // The ribbon's progress (--page) comes from a CSS scroll timeline; where
  // that isn't supported (e.g. Firefox), it's written here on scroll.
  useEffect(() => {
    const el = header.current;
    if (!el || CSS.supports("animation-timeline: scroll()")) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      el.style.setProperty("--page", String(max > 0 ? Math.min(1, window.scrollY / max) : 0));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <header
      ref={header}
      data-scrolled={scrolled || undefined}
      className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur transition-shadow duration-500 ease-elegant data-scrolled:shadow-soft"
    >
      {children}
      {/* A thin gold ribbon along the bottom edge: how far down the page
          you are (globals.css "Header ribbon"). */}
      <span aria-hidden="true" className="header-ribbon pointer-events-none absolute inset-x-0 -bottom-px">
        <span className="header-ribbon-fill absolute inset-0" />
      </span>
    </header>
  );
}
