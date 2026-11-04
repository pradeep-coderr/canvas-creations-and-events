"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/*
 * A living background: soft pools of blush and champagne light drifting
 * slowly, a few fine gold sparkles rising, and (desktop) one glow that eases
 * towards the pointer. Plain canvas, no library: drawn at a quarter of the
 * screen resolution (the light is soft anyway) at ~30fps, paused when off
 * screen or when the tab is hidden, a single still frame with reduced motion.
 * Colours come from the theme (globals.css --cc-*), so the Design page's
 * palette applies. Server HTML gets a static CSS glow, so nothing flashes
 * before the canvas fades in.
 */

type Variant = "hero" | "intro";

interface Glow {
  /** Home position and drift (fractions of the box). */
  x: number;
  y: number;
  ax: number;
  ay: number;
  /** Radius as a fraction of the box's larger side. */
  r: number;
  speed: number;
  phase: number;
  color: string;
  alpha: number;
}

// Where the light pools: the hero lights the right (behind the logo) and
// keeps the headline side calm; the studio glows around its centred text.
const layouts: Record<Variant, Omit<Glow, "color" | "alpha" | "phase">[]> = {
  hero: [
    { x: 0.78, y: 0.42, ax: 0.08, ay: 0.1, r: 0.42, speed: 0.07 },
    { x: 0.62, y: 0.78, ax: 0.1, ay: 0.06, r: 0.36, speed: 0.05 },
    { x: 0.92, y: 0.12, ax: 0.05, ay: 0.08, r: 0.3, speed: 0.06 },
    { x: 0.18, y: 0.9, ax: 0.08, ay: 0.05, r: 0.34, speed: 0.04 },
    { x: 0.35, y: 0.2, ax: 0.06, ay: 0.06, r: 0.26, speed: 0.05 },
  ],
  intro: [
    { x: 0.2, y: 0.4, ax: 0.08, ay: 0.12, r: 0.38, speed: 0.05 },
    { x: 0.82, y: 0.55, ax: 0.08, ay: 0.12, r: 0.38, speed: 0.06 },
    { x: 0.5, y: 0.95, ax: 0.15, ay: 0.05, r: 0.34, speed: 0.04 },
  ],
};

// Theme colour per glow (cycled), with its strength.
const tints: { token: string; alpha: number }[] = [
  { token: "--cc-blush-soft", alpha: 0.95 },
  { token: "--cc-champagne", alpha: 0.75 },
  { token: "--cc-button", alpha: 0.32 },
  { token: "--cc-champagne", alpha: 0.6 },
  { token: "--cc-rose", alpha: 0.18 },
];

const SCALE = 0.25;
const FRAME_MS = 1000 / 30;

function rgba(hex: string, alpha: number) {
  const h = hex.trim().replace("#", "");
  const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h.slice(0, 6);
  const n = Number.parseInt(full, 16);
  if (Number.isNaN(n)) return `rgba(249,221,226,${alpha})`;
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

export function AmbientGlow({ variant, className }: { variant: Variant; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const glowCanvas = useRef<HTMLCanvasElement>(null);
  const sparkCanvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = box.current;
    const gc = glowCanvas.current;
    const sc = sparkCanvas.current;
    const g = gc?.getContext("2d");
    const s = sc?.getContext("2d");
    if (!el || !gc || !sc || !g || !s) return;

    const css = getComputedStyle(document.documentElement);
    const glows: Glow[] = layouts[variant].map((l, i) => {
      const tint = tints[i % tints.length];
      return { ...l, phase: i * 1.7, color: css.getPropertyValue(tint.token) || "#f9dde2", alpha: tint.alpha };
    });
    const gold = css.getPropertyValue("--cc-gold") || "#d29a49";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;

    let w = 0;
    let h = 0;
    const resize = () => {
      w = el.clientWidth;
      h = el.clientHeight;
      gc.width = Math.max(1, Math.round(w * SCALE));
      gc.height = Math.max(1, Math.round(h * SCALE));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      sc.width = Math.round(w * dpr);
      sc.height = Math.round(h * dpr);
      s.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // Sparkles: fewer on small screens.
    const count = Math.round(Math.min(46, Math.max(14, (w * h) / 26000)));
    const sparks = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: 0.6 + Math.random() * 1.4,
      rise: 0.004 + Math.random() * 0.01,
      twinkle: 0.6 + Math.random() * 1.6,
      phase: Math.random() * Math.PI * 2,
    }));

    // The pointer glow eases towards the pointer (desktop only).
    const pointer = { x: 0.7, y: 0.45, tx: 0.7, ty: 0.45, on: false };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      pointer.tx = (e.clientX - r.left) / r.width;
      pointer.ty = (e.clientY - r.top) / r.height;
      pointer.on = pointer.ty > -0.2 && pointer.ty < 1.2;
    };

    const draw = (t: number) => {
      const cw = gc.width;
      const ch = gc.height;
      const big = Math.max(cw, ch);
      g.clearRect(0, 0, cw, ch);
      g.globalCompositeOperation = "source-over";
      for (const glow of glows) {
        const x = (glow.x + Math.sin(t * glow.speed + glow.phase) * glow.ax) * cw;
        const y = (glow.y + Math.cos(t * glow.speed * 0.8 + glow.phase) * glow.ay) * ch;
        const r = glow.r * big * (1 + Math.sin(t * glow.speed * 1.3 + glow.phase) * 0.08);
        const grad = g.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, rgba(glow.color, glow.alpha));
        grad.addColorStop(1, rgba(glow.color, 0));
        g.fillStyle = grad;
        g.fillRect(0, 0, cw, ch);
      }
      if (fine && variant === "hero") {
        pointer.x += (pointer.tx - pointer.x) * 0.04;
        pointer.y += (pointer.ty - pointer.y) * 0.04;
        const x = pointer.x * cw;
        const y = pointer.y * ch;
        const r = 0.22 * big;
        const grad = g.createRadialGradient(x, y, 0, x, y, r);
        const strength = pointer.on ? 0.5 : 0.25;
        grad.addColorStop(0, rgba(glows[1].color, strength));
        grad.addColorStop(1, rgba(glows[1].color, 0));
        g.fillStyle = grad;
        g.fillRect(0, 0, cw, ch);
      }

      s.clearRect(0, 0, w, h);
      for (const p of sparks) {
        const y = ((p.y - t * p.rise) % 1 + 1) % 1;
        const x = p.x + Math.sin(t * 0.3 + p.phase) * 0.006;
        const a = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(t * p.twinkle + p.phase));
        s.beginPath();
        s.arc(x * w, y * h, p.size, 0, Math.PI * 2);
        s.fillStyle = rgba(gold, a * (variant === "hero" ? 0.9 : 0.7));
        s.fill();
      }
    };

    el.dataset.ready = "true";
    if (reduced) {
      draw(12);
      const ro = new ResizeObserver(() => {
        resize();
        draw(12);
      });
      ro.observe(el);
      return () => ro.disconnect();
    }

    let raf = 0;
    let last = 0;
    let visible = true;
    const start = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < FRAME_MS) return;
      last = now;
      draw((now - start) / 1000 + 8);
    };
    const run = () => {
      cancelAnimationFrame(raf);
      if (visible && !document.hidden) raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      run();
    });
    io.observe(el);
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    document.addEventListener("visibilitychange", run);
    if (fine && variant === "hero") window.addEventListener("pointermove", onMove, { passive: true });
    run();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", run);
      window.removeEventListener("pointermove", onMove);
    };
  }, [variant]);

  return (
    <div
      ref={box}
      aria-hidden="true"
      className={cn(
        "group/ambient pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        // Faded where the hero meets the studio, so the two glows blend with no seam.
        variant === "hero"
          ? "[mask-image:linear-gradient(to_bottom,black_70%,transparent)]"
          : "[mask-image:linear-gradient(to_bottom,transparent,black_30%,black_70%,transparent)]",
        className,
      )}
    >
      {/* The static glow: what the server HTML shows; it hands over to the canvas. */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-1000 group-data-[ready=true]/ambient:opacity-0",
          variant === "hero"
            ? "bg-[radial-gradient(60%_70%_at_78%_42%,color-mix(in_oklab,var(--cc-blush-soft)_85%,transparent),transparent_70%),radial-gradient(45%_55%_at_60%_85%,color-mix(in_oklab,var(--cc-champagne)_60%,transparent),transparent_70%)]"
            : "bg-[radial-gradient(45%_70%_at_20%_40%,color-mix(in_oklab,var(--cc-blush-soft)_85%,transparent),transparent_70%),radial-gradient(45%_70%_at_82%_55%,color-mix(in_oklab,var(--cc-champagne)_60%,transparent),transparent_70%)]",
        )}
      />
      <canvas
        ref={glowCanvas}
        className="absolute inset-0 size-full opacity-0 blur-2xl transition-opacity duration-1000 group-data-[ready=true]/ambient:opacity-100"
      />
      <canvas
        ref={sparkCanvas}
        className="absolute inset-0 size-full opacity-0 transition-opacity duration-1000 group-data-[ready=true]/ambient:opacity-100"
      />
    </div>
  );
}
