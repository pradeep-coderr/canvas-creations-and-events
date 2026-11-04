import { cn } from "@/lib/utils";

/*
 * A rose wax seal stamped with the studio's "CC", sealing the enquiry card
 * like an invitation. Scroll-linked stamp (globals.css "Wax seal"): it
 * presses down as the card comes into view; it lifts a little when the card
 * is hovered, as if about to be broken. Still with reduced motion.
 * Purely decorative: hidden from assistive technology.
 */

// The seal's edge: wax squeezed out unevenly, as a closed smooth outline.
const EDGE = (() => {
  const n = 18;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    // A fixed, irregular wobble (no randomness: same on server and client).
    const r = 44 + 2.6 * Math.sin(i * 2.3) + 1.6 * Math.cos(i * 5.1);
    return [50 + r * Math.cos(a), 50 + r * Math.sin(a)] as const;
  });
  // Smooth closed curve through the points (Catmull-Rom → cubic Bézier).
  const f = (v: number) => v.toFixed(2);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const [p0, p1, p2, p3] = [pts[(i - 1 + n) % n], pts[i], pts[(i + 1) % n], pts[(i + 2) % n]];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${f(c1[0])} ${f(c1[1])}, ${f(c2[0])} ${f(c2[1])}, ${f(p2[0])} ${f(p2[1])}`;
  }
  return `${d} Z`;
})();

export function WaxSeal({ className, monogram = "CC" }: { className?: string; monogram?: string }) {
  return (
    <span aria-hidden="true" className={cn("wax-seal block", className)}>
      <svg viewBox="0 0 100 100" className="size-full overflow-visible">
        <defs>
          <radialGradient id="cc-wax" cx="38%" cy="32%" r="75%">
            <stop offset="0" stopColor="#e6a0b0" />
            <stop offset="0.45" stopColor="#c45a74" />
            <stop offset="1" stopColor="#8f2f49" />
          </radialGradient>
          <radialGradient id="cc-wax-well" cx="60%" cy="65%" r="70%">
            <stop offset="0" stopColor="#d9768d" />
            <stop offset="1" stopColor="#a63e59" />
          </radialGradient>
        </defs>
        {/* The wax. */}
        <path d={EDGE} fill="url(#cc-wax)" />
        {/* The pressed well, a gold ring and the monogram, embossed. */}
        <circle cx="50" cy="50" r="31" fill="url(#cc-wax-well)" stroke="#7e2740" strokeOpacity="0.45" strokeWidth="1.6" />
        <circle cx="50" cy="50" r="27" fill="none" stroke="var(--cc-champagne)" strokeOpacity="0.85" strokeWidth="0.9" strokeDasharray="0.6 2.4" strokeLinecap="round" />
        <text
          x="50"
          y="51"
          textAnchor="middle"
          dominantBaseline="central"
          className="font-display"
          fontSize="33"
          fontWeight="600"
          fontStyle="italic"
          letterSpacing="-3"
          fill="#fbe7eb"
          stroke="#7e2740"
          strokeOpacity="0.35"
          strokeWidth="0.6"
          style={{ textShadow: "0 1px 0 rgb(80 20 35 / 0.45)" }}
        >
          {monogram}
        </text>
        {/* A glint on the wax. */}
        <path d="M26 30 C 32 20, 44 15, 54 15" fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    </span>
  );
}
