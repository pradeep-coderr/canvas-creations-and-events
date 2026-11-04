import { cn } from "@/lib/utils";

/*
 * A rose satin ribbon with a gold edge that ties into a bow: the divider
 * under "The studio". Scroll-linked (globals.css "Ribbon bow"): the two
 * ribbon ends draw in from the sides and meet in the middle, then the bow's
 * loops tie, then the knot sets and its tails drop. Scrolling back unties
 * it. Fully drawn with reduced motion and wherever scroll animation isn't
 * available. Every path uses pathLength="1" so the draw is a 1 → 0 dash
 * offset. Purely decorative: hidden from assistive technology.
 */

// The ribbon's two halves (a gentle wave), each running in to the knot.
const LEFT = "M6 40 C 46 32, 86 48, 118 40 S 148 35, 160 38";
const RIGHT = "M314 40 C 274 32, 234 48, 202 40 S 172 35, 160 38";
// Bow loops (each starts and ends at the knot) and the two tails.
const LOOP_L = "M160 38 C 146 8, 114 6, 112 25 C 110 44, 142 48, 160 38";
const LOOP_R = "M160 38 C 174 8, 206 6, 208 25 C 210 44, 178 48, 160 38";
const TAIL_L = "M158 41 C 152 54, 143 64, 130 76";
const TAIL_R = "M162 41 C 169 54, 179 63, 192 73";

/** A satin band: rose, a soft highlight along it and a fine gold edge. */
function Satin({ d, className, fill }: { d: string; className: string; fill?: boolean }) {
  return (
    <g className={className}>
      <path
        d={d}
        pathLength={1}
        stroke="var(--cc-rose)"
        strokeWidth="5"
        fill={fill ? "var(--cc-blush-soft)" : "none"}
        fillOpacity={fill ? 0.9 : undefined}
      />
      <path d={d} pathLength={1} stroke="var(--cc-blush-soft)" strokeOpacity="0.85" strokeWidth="1.3" fill="none" />
      <path d={d} pathLength={1} stroke="var(--cc-gold)" strokeWidth="0.8" fill="none" transform="translate(0 -2.4)" />
    </g>
  );
}

export function RibbonBow({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("ribbon-bow mx-auto w-full max-w-[22rem] sm:max-w-[28rem]", className)}>
      <svg viewBox="0 0 320 82" strokeLinecap="round" strokeLinejoin="round" className="h-auto w-full overflow-visible">
        <Satin d={LEFT} className="rb-ribbon" />
        <Satin d={RIGHT} className="rb-ribbon" />
        <Satin d={TAIL_L} className="rb-tail" />
        <Satin d={TAIL_R} className="rb-tail" />
        <Satin d={LOOP_L} className="rb-loop" fill />
        <Satin d={LOOP_R} className="rb-loop" fill />
        {/* The knot. */}
        <g className="rb-knot">
          <ellipse cx="160" cy="38" rx="7" ry="6" fill="var(--cc-rose)" />
          <ellipse cx="158" cy="36" rx="3" ry="2" fill="var(--cc-blush-soft)" opacity="0.8" />
          <ellipse cx="160" cy="38" rx="7" ry="6" fill="none" stroke="var(--cc-gold)" strokeWidth="0.8" />
        </g>
      </svg>
    </div>
  );
}
