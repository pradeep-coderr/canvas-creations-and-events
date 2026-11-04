"use client";

import { motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

/*
 * The hero's hanging sign: the studio's name engraved on a honey-toned
 * wooden board, hung on two ropes from the top of the hero, dressed with
 * blush flowers, sage leaves and gold berries at its top corners. All CSS
 * and SVG (sharp at any size, nothing to download). It drops in on load,
 * then sways gently (globals.css "Hanging sign"); still with reduced motion.
 *
 * It can be grabbed and pulled like a sign on elastic: it follows the
 * pointer with resistance, tilts the way it's pulled (as if swinging on its
 * ropes), and on release springs back with a wobble. Phones: sideways drags
 * swing it, vertical swipes still scroll the page. Off with reduced motion,
 * and in the visual editor (where the name is edited in place).
 */

/** A corner arrangement: three blush flowers, sage leaves, gold berries and a trailing sprig. */
function Florals({ className }: { className?: string }) {
  const flower = (x: number, y: number, s: number, key: string) => (
    <g key={key} transform={`translate(${x} ${y}) scale(${s})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="0" cy="-7" rx="5.2" ry="8" transform={`rotate(${a})`} fill="#f6c3cc" stroke="#e396a6" strokeWidth="0.8" />
      ))}
      <circle r="3.4" fill="#d29a49" />
      <circle r="1.4" cx="-0.8" cy="-0.8" fill="#ebd2ad" />
    </g>
  );
  const leaf = (d: string, fill: string, key: string) => <path key={key} d={d} fill={fill} stroke="#6f8566" strokeWidth="0.6" />;

  return (
    <svg viewBox="0 0 130 92" aria-hidden="true" className={className}>
      {/* trailing sprig */}
      <path d="M40 34 C 44 52, 38 66, 46 84" fill="none" stroke="#7f9572" strokeWidth="1.4" strokeLinecap="round" />
      {leaf("M44 58 C 52 54, 56 60, 52 66 C 47 66, 44 62, 44 58 Z", "#a6b898", "s1")}
      {leaf("M41 70 C 33 68, 31 75, 36 79 C 40 78, 42 74, 41 70 Z", "#93a786", "s2")}
      {leaf("M46 80 C 53 79, 55 85, 50 89 C 46 88, 45 84, 46 80 Z", "#a6b898", "s3")}
      {/* leaves behind the flowers */}
      {leaf("M30 30 C 10 22, 2 34, 8 44 C 20 46, 28 40, 30 30 Z", "#93a786", "l1")}
      {leaf("M58 22 C 70 6, 88 10, 90 20 C 80 30, 66 30, 58 22 Z", "#a6b898", "l2")}
      {leaf("M72 36 C 92 34, 102 46, 96 54 C 84 54, 74 46, 72 36 Z", "#93a786", "l3")}
      {leaf("M26 18 C 22 4, 34 0, 40 8 C 38 16, 32 20, 26 18 Z", "#a6b898", "l4")}
      {/* gold berries */}
      {[
        [96, 18],
        [102, 26],
        [14, 52],
        [20, 58],
        [84, 60],
      ].map(([cx, cy]) => (
        <g key={`${cx}-${cy}`}>
          <line x1={cx} y1={cy} x2={cx - 6} y2={cy + 4} stroke="#b28443" strokeWidth="0.8" />
          <circle cx={cx} cy={cy} r="2.6" fill="#d29a49" />
        </g>
      ))}
      {flower(34, 32, 1.25, "f1")}
      {flower(58, 38, 1, "f2")}
      {flower(48, 18, 0.8, "f3")}
    </svg>
  );
}

export function HangingSign({
  children,
  className,
  draggable = true,
}: {
  children: React.ReactNode;
  className?: string;
  /** Grab-and-pull with a spring back (off in the visual editor). */
  draggable?: boolean;
}) {
  const reduced = useReducedMotion();
  const canDrag = draggable && !reduced;
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  // Pulled right, the board tilts anticlockwise about its top (its ropes lean
  // back towards where they hang from), and the reverse to the left.
  const rotate = useTransform(x, [-180, 180], [12, -12]);
  // The ropes stretch as the board is pulled down, so they always run up past
  // the hero's top edge (never ending in mid-air).
  const ropeHeight = useTransform(y, (v) => `calc(var(--sign-rope) + ${Math.max(0, v)}px)`);

  return (
    <div className={cn("hanging-sign relative mx-auto w-fit max-w-full", className)}>
      <motion.div
        drag={canDrag}
        // Zero constraints + elastic: it follows with resistance and always
        // springs home on release (bounce = the wobble).
        dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
        // Loose sideways (a swing), stiff up and down (it's hung on ropes).
        dragElastic={{ left: 0.35, right: 0.35, top: 0.08, bottom: 0.2 }}
        dragTransition={{ bounceStiffness: 240, bounceDamping: 7 }}
        whileDrag={{ scale: 1.03 }}
        style={{ x, y, rotate, originX: 0.5, originY: 0, touchAction: canDrag ? "pan-y" : undefined }}
        className={cn("relative", canDrag && "cursor-grab select-none active:cursor-grabbing")}
      >
        {/* The ropes, from the top of the hero down to brass rings on the board. */}
        {["left-[16%]", "right-[16%]"].map((side) => (
          <motion.span
            key={side}
            aria-hidden="true"
            style={{ height: ropeHeight }}
            className={cn(
              "absolute bottom-[calc(100%-0.5rem)] w-[3px] rounded-full bg-[repeating-linear-gradient(160deg,#c9a46e_0_3px,#9c7442_3px_6px)] shadow-[0_1px_1px_rgb(0_0_0/0.15)]",
              side,
            )}
          >
            <span className="absolute -bottom-1 left-1/2 size-3 -translate-x-1/2 rounded-full border-2 border-[#b28443] bg-transparent" />
          </motion.span>
        ))}

        {/* The board: honey wood with grain, a gold inner line, a soft drop shadow. */}
        <div className="relative rounded-md bg-[#a8713c] bg-[repeating-linear-gradient(178deg,rgb(255_255_255/0.07)_0_2px,transparent_2px_9px),repeating-linear-gradient(181deg,rgb(60_30_10/0.12)_0_1px,transparent_1px_14px),linear-gradient(180deg,#b98049,#9a6534_55%,#8a5a2e)] px-9 py-4 shadow-[0_18px_30px_-14px_rgb(70_40_15/0.55),inset_0_1px_0_rgb(255_255_255/0.25),inset_0_-2px_0_rgb(0_0_0/0.18)] sm:px-14 sm:py-5 lg:px-20">
          <div aria-hidden="true" className="pointer-events-none absolute inset-1.5 rounded-[3px] border border-[#ebd2ad]/55" />
          <p className="relative font-display text-[clamp(1.25rem,0.95rem+1.3vw,2.125rem)] leading-tight font-title text-balance text-[#fbf5ec] max-[359px]:text-center min-[360px]:whitespace-nowrap [text-shadow:0_1px_0_rgb(0_0_0/0.35),0_-1px_0_rgb(255_255_255/0.12)]">
            {children}
          </p>
        </div>

        {/* Florals on the top corners, spilling over the board's edges (pulled in on very small phones). */}
        <Florals className="pointer-events-none absolute -top-7 -left-6 w-20 -scale-x-100 min-[400px]:-left-10 min-[400px]:w-24 sm:-top-11 sm:-left-14 sm:w-32 lg:w-36" />
        <Florals className="pointer-events-none absolute -top-7 -right-6 w-20 min-[400px]:-right-10 min-[400px]:w-24 sm:-top-11 sm:-right-14 sm:w-32 lg:w-36" />
      </motion.div>
    </div>
  );
}
