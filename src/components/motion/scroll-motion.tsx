"use client";

import { useEffect } from "react";
import { subscribeLenis } from "./smooth-scroll";

/*
 * Scroll motion for browsers WITHOUT CSS scroll timelines (e.g. Firefox).
 * Where `animation-timeline: view()` is supported, the CSS does everything
 * and this does nothing. Otherwise it reproduces the same scroll-linked
 * motion: on every scroll frame (Lenis's scroll event where Lenis runs, the
 * native scroll event otherwise) it works out how far each element is
 * through its view ranges — exactly as `view()` with the ranges in
 * globals.css would — and writes that progress as CSS variables
 * (--cc-in, --cc-out, ...). CSS (html.js-motion) turns them into opacity,
 * transforms and clips, so the motion follows the scroll position in both
 * directions. No React state; nothing at all with reduced motion. Server
 * HTML stays fully visible: the variables default to "in view".
 */

type Range = [from: number, to: number];
// A view-timeline range edge: [named range, percentage as 0..1].
type Edge = ["entry" | "cover" | "exit", number];

/** The ranges used in globals.css, per class (in order of precedence). */
const SPECS: { cls: string; vars: Record<string, [Edge, Edge]> }[] = [
  { cls: "reveal", vars: { "--cc-in": [["entry", 0], ["cover", 0.35]], "--cc-out": [["exit", 0.25], ["exit", 1]] } },
  { cls: "reveal-in", vars: { "--cc-in": [["entry", 0], ["cover", 0.3]] } },
  {
    cls: "reveal-mask",
    vars: {
      "--cc-in": [["entry", 0], ["cover", 0.45]],
      "--cc-out": [["exit", 0.3], ["exit", 1]],
      "--cc-settle": [["entry", 0], ["cover", 0.6]],
    },
  },
  { cls: "reveal-line", vars: { "--cc-in": [["entry", 0.1], ["cover", 0.4]], "--cc-out": [["exit", 0.4], ["exit", 1]] } },
  { cls: "drift", vars: { "--cc-cover": [["cover", 0], ["cover", 1]] } },
  { cls: "drift-slow", vars: { "--cc-cover": [["cover", 0], ["cover", 1]] } },
];
const SELECTOR = SPECS.map((s) => `.${s.cls}`).join(", ");

/**
 * Where an edge of a view() range falls, as the element's top relative to
 * the viewport (CSS Scroll-driven Animations: entry/cover/exit for a
 * subject of height h in a viewport of height v).
 */
function edgeTop([range, pct]: Edge, h: number, v: number) {
  const coverEnd = -h;
  if (range === "cover") return v + pct * (coverEnd - v);
  if (range === "entry") {
    const entryEnd = Math.max(v - h, 0);
    return v + pct * (entryEnd - v);
  }
  const exitStart = Math.min(0, v - h);
  return exitStart + pct * (coverEnd - exitStart);
}

/** 0..1 progress of an element at `top` through [from, to] (tops, decreasing). */
function progress(top: number, [from, to]: Range) {
  if (from === to) return top <= to ? 1 : 0;
  return Math.min(1, Math.max(0, (from - top) / (from - to)));
}

/** The element's layout position in the document, ignoring transforms. */
function documentTop(el: HTMLElement) {
  let y = 0;
  for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) y += n.offsetTop;
  return y;
}

export function ScrollMotion() {
  useEffect(() => {
    if (typeof CSS !== "undefined" && CSS.supports("animation-timeline: view()")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    const heroLinked = !(typeof CSS !== "undefined" && CSS.supports("animation-timeline: scroll()"));
    let elements: { el: HTMLElement; vars: Record<string, [Edge, Edge]> }[] = [];
    const written = new WeakMap<HTMLElement, Record<string, string>>();

    const collect = () => {
      elements = [...document.querySelectorAll<HTMLElement>(SELECTOR)].map((el) => {
        const spec = SPECS.find((s) => el.classList.contains(s.cls))!;
        return { el, vars: spec.vars };
      });
    };

    const write = (el: HTMLElement, name: string, value: number) => {
      const text = value.toFixed(3);
      const prev = written.get(el) ?? {};
      if (prev[name] === text) return;
      prev[name] = text;
      written.set(el, prev);
      el.style.setProperty(name, text);
    };

    const update = () => {
      const scrollY = window.scrollY;
      const v = window.innerHeight;
      // Read every position first, then write: one layout read per frame.
      const measured = elements.map(({ el, vars }) =>
        el.offsetParent === null ? null : { el, vars, top: documentTop(el) - scrollY, h: el.offsetHeight },
      );
      for (const m of measured) {
        if (!m) continue;
        for (const [name, [a, b]] of Object.entries(m.vars)) {
          write(m.el, name, progress(m.top, [edgeTop(a, m.h, v), edgeTop(b, m.h, v)]));
        }
      }
      if (heroLinked) {
        // The hero follows the page scroll (scroll(root) 0–85vh and 0–70vh).
        write(root, "--cc-hero", Math.min(1, scrollY / (0.85 * v)));
        write(root, "--cc-hero-depth", Math.min(1, scrollY / (0.7 * v)));
      }
    };

    let frame = 0;
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };

    collect();
    update();
    root.classList.add("js-motion");

    // Lenis (when running) reports every eased frame; the native events
    // cover keyboard, touch and pages without Lenis.
    let offLenis: (() => void) | undefined;
    const stopWatchingLenis = subscribeLenis((lenis) => {
      offLenis?.();
      offLenis = lenis?.on("scroll", update);
    });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    // Content added or removed later (the editor, filters) is picked up too;
    // layout shifts (images loading, a filter) re-measure.
    const mo = new MutationObserver(() => {
      collect();
      schedule();
    });
    mo.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "hidden", "data-portfolio-filter"],
    });
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);

    return () => {
      cancelAnimationFrame(frame);
      stopWatchingLenis();
      offLenis?.();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      mo.disconnect();
      ro.disconnect();
      root.classList.remove("js-motion");
      root.style.removeProperty("--cc-hero");
      root.style.removeProperty("--cc-hero-depth");
      for (const { el, vars } of elements) Object.keys(vars).forEach((name) => el.style.removeProperty(name));
    };
  }, []);
  return null;
}
