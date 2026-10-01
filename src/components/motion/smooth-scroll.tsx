"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";

/*
 * Smooth scrolling for the public site (Lenis). Lenis eases the page's own
 * (native) scroll position, so everything that follows the scroll — the CSS
 * scroll-driven animations and <ScrollMotion> — simply moves more fluidly.
 *
 * - Mouse wheel / trackpad: smoothed. Touch: native (no syncTouch; it is
 *   unreliable on older iOS). Keyboard scrolling stays native.
 * - Reduced motion: Lenis is not started at all (and stops if the setting
 *   changes while the page is open).
 * - While a dialog locks the page (lightbox, film player, mobile menu —
 *   Radix sets body[data-scroll-locked]) Lenis is paused.
 * - In-page links ("/#pricing") glide to their section, landing below the
 *   fixed header.
 *
 * Not used in the admin area or the visual editor.
 */

const POPUP = "[role='dialog'], [role='alertdialog'], [role='listbox'], [role='menu'], [data-lenis-prevent]";

let current: Lenis | null = null;
const subscribers = new Set<(lenis: Lenis | null) => void>();

function setCurrent(lenis: Lenis | null) {
  current = lenis;
  subscribers.forEach((fn) => fn(lenis));
}

/** Calls `fn` now and whenever Lenis starts or stops. Returns an unsubscribe. */
export function subscribeLenis(fn: (lenis: Lenis | null) => void) {
  subscribers.add(fn);
  fn(current);
  return () => {
    subscribers.delete(fn);
  };
}

/**
 * Scrolls the page to `target` (an element, or 0 for the top): eased by
 * Lenis when it is running; otherwise the browser's own smooth scroll, or a
 * jump with reduced motion.
 */
export function scrollPageTo(target: HTMLElement | 0) {
  if (current) {
    // Lenis honours html's scroll-padding-top (the fixed header) itself.
    current.scrollTo(target);
  } else {
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    if (target === 0) window.scrollTo({ top: 0, behavior });
    else target.scrollIntoView({ behavior }); // honours scroll-padding-top
  }
  if (target !== 0) {
    // Like a native anchor jump: keyboard focus continues from the section.
    if (!target.hasAttribute("tabindex")) {
      target.setAttribute("tabindex", "-1");
      target.setAttribute("data-scroll-target", "");
    }
    target.focus({ preventScroll: true });
  }
}

/** The in-page section an <a> points at, if it is on this page. */
function inPageTarget(anchor: HTMLAnchorElement): HTMLElement | null {
  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !url.hash) return null;
  return document.getElementById(decodeURIComponent(url.hash.slice(1)));
}

export function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | null = null;

    const locked = () => document.body.hasAttribute("data-scroll-locked");
    const start = () => {
      if (lenis) return;
      lenis = new Lenis({
        autoRaf: true,
        lerp: 0.1,
        smoothWheel: true,
        syncTouch: false,
        stopInertiaOnNavigate: true,
        // Pop-ups (dialogs, menus, select lists) scroll natively: while one
        // is open Lenis is paused and would otherwise swallow their wheel.
        prevent: (node) => node.matches(POPUP),
      });
      if (locked()) lenis.stop();
      setCurrent(lenis);
    };
    const stop = () => {
      lenis?.destroy();
      lenis = null;
      setCurrent(null);
    };
    const sync = () => (reduce.matches ? stop() : start());
    sync();
    reduce.addEventListener("change", sync);

    // Pause while a dialog has locked the page; resume when it is released.
    const lockObserver = new MutationObserver(() => (locked() ? lenis?.stop() : lenis?.start()));
    lockObserver.observe(document.body, { attributes: true, attributeFilter: ["data-scroll-locked"] });

    // In-page links: glide to the section (a second click on the same link
    // works too). Modified clicks and other pages are left to the browser.
    const onClick = (event: MouseEvent) => {
      if (!lenis || event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.("a[href*='#']");
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === "_blank") return;
      const target = inPageTarget(anchor);
      if (!target) return;
      event.preventDefault();
      const hash = new URL(anchor.href).hash;
      if (window.location.hash !== hash) window.history.pushState(null, "", hash);
      scrollPageTo(target);
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      lockObserver.disconnect();
      reduce.removeEventListener("change", sync);
      stop();
    };
  }, []);
  return null;
}
