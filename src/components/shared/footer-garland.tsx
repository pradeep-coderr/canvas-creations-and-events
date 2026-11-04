/*
 * The end of the party, along the top of the footer: a floral garland
 * swagged across it (a sage vine with blush, champagne, rose and gold
 * blooms and leaves), and confetti scattered over the footer. As the
 * footer scrolls in, the vine draws, the flowers bloom from the middle
 * outwards and the confetti drifts down and settles (globals.css "Footer
 * party", driven by --party on the footer). Complete and still with reduced
 * motion. Decorative only.
 */

const W = 1440;
// The garland's three swags, as quadratic curves [start, control, end].
const SWAGS: [number, number][][] = [
  [[0, 8], [240, 78], [480, 16]],
  [[480, 16], [720, 78], [960, 16]],
  [[960, 16], [1200, 78], [1440, 8]],
];

function at([[x0, y0], [x1, y1], [x2, y2]]: [number, number][], t: number) {
  const u = 1 - t;
  const x = u * u * x0 + 2 * u * t * x1 + t * t * x2;
  const y = u * u * y0 + 2 * u * t * y1 + t * t * y2;
  // Direction along the curve, in degrees.
  const dx = 2 * u * (x1 - x0) + 2 * t * (x2 - x1);
  const dy = 2 * u * (y1 - y0) + 2 * t * (y2 - y1);
  return { x, y, angle: (Math.atan2(dy, dx) * 180) / Math.PI };
}

// Blooms open from the middle outwards: 0 at the centre, 0.55 at the ends.
const delay = (x: number) => +((Math.abs(x - W / 2) / (W / 2)) * 0.55).toFixed(3);

const PETALS = [
  ["#f3bccb", "#d98ea0"],
  ["#ebd2ad", "#c9a56e"],
  ["#f6c6d1", "#cc7e91"],
  ["#f8e2b3", "#d29a49"],
] as const;

const FLOWERS = SWAGS.flatMap((swag, s) =>
  [0.14, 0.5, 0.86].map((t, i) => {
    const p = at(swag, t);
    return { ...p, size: i === 1 ? 1.25 : 0.9, tone: PETALS[(s * 3 + i) % PETALS.length], spin: (s * 3 + i) * 23 };
  }),
);
const LEAVES = SWAGS.flatMap((swag) => [0.3, 0.68].map((t) => at(swag, t)));

// Confetti: a fixed, even scatter that never lines up (an R2 low-discrepancy
// sequence; no randomness, so the same on server and client). Mostly in
// the upper part, under the garland, thinning out over the content.
const CONFETTI_COLOURS = ["#f3bccb", "#d29a49", "#ebd2ad", "#cc7e91", "#f8e2b3", "#a6b898"];
const frac = (n: number) => n - Math.floor(n);
const CONFETTI = Array.from({ length: 28 }, (_, i) => ({
  left: +(frac(0.5 + i * 0.7548776662) * 98 + 1).toFixed(2),
  top: +(6 + frac(0.5 + i * 0.5698402911) ** 1.6 * 70).toFixed(2),
  colour: CONFETTI_COLOURS[i % CONFETTI_COLOURS.length],
  shape: (["rect", "dot", "strip"] as const)[i % 3],
  rotate: (i * 67) % 360,
  delay: +((((i * 29) % 100) / 100) * 0.5).toFixed(2),
}));

export function FooterGarland() {
  return (
    <>
      <span aria-hidden="true" className="footer-garland pointer-events-none absolute inset-x-0 top-0 block">
        <svg viewBox={`0 0 ${W} 100`} preserveAspectRatio="xMidYMin slice" className="size-full overflow-visible">
          <path
            className="fg-vine"
            pathLength={1}
            d={`M0 8 Q 240 78 480 16 Q 720 78 960 16 Q 1200 78 1440 8`}
            fill="none"
            stroke="#7d9270"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {LEAVES.map(({ x, y, angle }, i) => (
            <g key={`l${i}`} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
              <g className="fg-bloom" style={{ "--d": delay(x) } as React.CSSProperties}>
                <path transform={`rotate(${(angle - 38).toFixed(1)})`} d="M0 0 C 6 -7, 17 -7, 24 0 C 17 7, 6 7, 0 0 Z" fill="#93a786" />
                <path transform={`rotate(${(angle + 180 + 38).toFixed(1)})`} d="M0 0 C 6 -7, 17 -7, 24 0 C 17 7, 6 7, 0 0 Z" fill="#a6b898" />
              </g>
            </g>
          ))}
          {FLOWERS.map(({ x, y, size, tone: [petal, edge], spin }, i) => (
            <g key={`f${i}`} transform={`translate(${x.toFixed(1)} ${(y + 4).toFixed(1)}) scale(${size}) rotate(${spin})`}>
              <g className="fg-bloom" style={{ "--d": delay(x) } as React.CSSProperties}>
                {[0, 72, 144, 216, 288].map((a) => (
                  <ellipse key={a} cx="0" cy="-8.5" rx="6.5" ry="9.5" transform={`rotate(${a})`} fill={petal} stroke={edge} strokeWidth="0.8" />
                ))}
                <circle r="4.2" fill="#d29a49" />
                <circle r="1.6" fill="#f8e2b3" />
              </g>
            </g>
          ))}
        </svg>
      </span>
      {/* Confetti, settled over the footer, behind its content. */}
      <span aria-hidden="true" className="footer-confetti pointer-events-none absolute inset-0 block overflow-clip">
        {CONFETTI.map((c, i) => (
          <span
            key={i}
            className={`confetti confetti-${c.shape} absolute block`}
            style={
              {
                left: `${c.left}%`,
                top: `${c.top}%`,
                background: c.colour,
                "--r": `${c.rotate}deg`,
                "--d": c.delay,
              } as React.CSSProperties
            }
          />
        ))}
      </span>
    </>
  );
}
