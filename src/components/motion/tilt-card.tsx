"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

/*
 * A card that tilts towards the cursor like a place card picked up off the
 * table, with a soft shine that follows the pointer (globals.css "Tilt
 * card"). Mouse and pen only, and not with reduced motion. On touch screens
 * (no hover) it instead leans gently as it scrolls past, from CSS alone.
 * The pointer writes CSS variables directly (no React state, no re-render).
 */

const MAX_TILT = 6; // degrees

export function TiltCard({ className, children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  const allowed = (e: React.PointerEvent) =>
    e.pointerType !== "touch" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || !allowed(e)) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width; // 0..1
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--tilt-x", `${((0.5 - py) * 2 * MAX_TILT).toFixed(2)}deg`);
    el.style.setProperty("--tilt-y", `${((px - 0.5) * 2 * MAX_TILT).toFixed(2)}deg`);
    el.style.setProperty("--shine-x", `${(px * 100).toFixed(1)}%`);
    el.style.setProperty("--shine-y", `${(py * 100).toFixed(1)}%`);
    el.dataset.tilting = "true";
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tilt-x", "0deg");
    el.style.setProperty("--tilt-y", "0deg");
    delete el.dataset.tilting;
  };

  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className={cn("tilt-card relative", className)}>
      {children}
      {/* The shine: a soft light under the pointer (hover devices only). */}
      <span aria-hidden="true" className="tilt-shine pointer-events-none absolute inset-0 rounded-(--surface-radius)" />
    </div>
  );
}
