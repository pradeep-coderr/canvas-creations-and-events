"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { GALLERY_FILTER_EVENT, TONES, type BalloonTone } from "./balloon-tones";

/*
 * One balloon of the Categories garland: a glossy balloon in a brand tone,
 * a curling string and a hanging tag with the category's name. It bobs
 * gently on its own rhythm (globals.css "Balloon garland") and swells on
 * hover. As a link it scrolls to the gallery and asks it to show only that
 * category (GALLERY_FILTER_EVENT in balloon-tones, handled in gallery-lightbox).
 *
 * The balloon can be pulled away on its string (useTether): the tag stays
 * tied in place, tugging a little, and the string stretches thin and loses
 * its curl. Let go and a spring brings the balloon back with a wobble. A
 * drag doesn't open the gallery; a click or tap does. Only as a link (not in
 * the editor), and not with reduced motion.
 */

const REST_STRING = "M10 0 C 4 10, 16 18, 10 28 S 4 46, 10 56";
const STRING_LENGTH = 56; // viewBox units
const REACH = 240; // px: the furthest a balloon can be pulled
const STIFFNESS = 170;
const DAMPING = 7; // low, so it overshoots and wobbles

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

function useTether(root: React.RefObject<HTMLSpanElement | null>, enabled: boolean) {
  useEffect(() => {
    const el = root.current;
    const body = el?.querySelector<HTMLElement>(".balloon-body");
    const stringSvg = el?.querySelector<SVGSVGElement>(".balloon-string");
    const string = stringSvg?.querySelector("path");
    const tag = el?.querySelector<HTMLElement>(".balloon-tag");
    if (!enabled || !el || !body || !stringSvg || !string || !tag) return;

    let x = 0;
    let y = 0;
    let vx = 0;
    let vy = 0;
    let grabX = 0;
    let grabY = 0;
    let time = 0;
    let frame = 0;
    let held = false;
    let dragged = false;

    const draw = () => {
      // Turns about the neck (globals.css), so the string stays tied to it.
      const lean = clamp(x * 0.09 + vx * 0.012, -28, 28);
      body.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${lean}deg)`;
      const tagX = x * 0.07;
      const tagY = y * 0.05;
      tag.style.transform = `translate3d(${tagX}px, ${tagY}px, 0) rotate(${clamp(x * 0.02, -5, 5)}deg)`;

      // The string, in its viewBox units: the same S curve between the neck
      // and the tag, its curl fading as it stretches and growing when slack.
      const k = STRING_LENGTH / (stringSvg.clientHeight || STRING_LENGTH);
      const fromX = 10 + x * k;
      const fromY = y * k;
      const dx = 10 + tagX * k - fromX;
      const dy = STRING_LENGTH + tagY * k - fromY;
      const length = Math.hypot(dx, dy) || 1;
      const stretch = (length - STRING_LENGTH) / STRING_LENGTH;
      const curl = clamp(6 * (1 - stretch / 1.2), 0, 14);
      const at = (t: number, side: number) =>
        `${(fromX + dx * t + (dy / length) * side).toFixed(2)} ${(fromY + dy * t - (dx / length) * side).toFixed(2)}`;
      string.setAttribute(
        "d",
        `M${at(0, 0)} C ${at(0.18, -curl)}, ${at(0.32, curl)}, ${at(0.5, 0)} C ${at(0.68, -curl)}, ${at(0.82, -curl)}, ${at(1, 0)}`,
      );
      string.setAttribute("stroke-width", clamp(1 - stretch * 0.15, 0.7, 1).toFixed(2));
    };

    const settle = () => {
      x = y = vx = vy = 0;
      body.style.removeProperty("transform");
      tag.style.removeProperty("transform");
      string.setAttribute("d", REST_STRING);
      string.setAttribute("stroke-width", "1");
      delete el.dataset.held;
    };

    const spring = (now: number) => {
      const dt = clamp((now - time) / 1000, 0, 0.032);
      time = now;
      // Two small steps a frame keep the bounce steady.
      for (let i = 0; i < 2; i++) {
        const h = dt / 2;
        vx += (-STIFFNESS * x - DAMPING * vx) * h;
        vy += (-STIFFNESS * y - DAMPING * vy) * h;
        x += vx * h;
        y += vy * h;
      }
      if (Math.hypot(x, y) < 0.3 && Math.hypot(vx, vy) < 6) {
        settle();
        return;
      }
      draw();
      frame = requestAnimationFrame(spring);
    };

    const onDown = (e: PointerEvent) => {
      dragged = false;
      if (e.button !== 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      cancelAnimationFrame(frame);
      body.setPointerCapture(e.pointerId);
      held = true;
      // From where it is now, so it can be caught mid-bounce.
      grabX = e.clientX - x;
      grabY = e.clientY - y;
      vx = vy = 0;
      time = e.timeStamp;
      el.dataset.held = "";
    };

    const onMove = (e: PointerEvent) => {
      if (!held) return;
      const dx = e.clientX - grabX;
      const dy = e.clientY - grabY;
      const pull = Math.hypot(dx, dy);
      if (pull > 6) dragged = true;
      // Follows the pointer, then resists more the further it goes.
      const give = pull ? (REACH * (1 - Math.exp(-pull / REACH))) / pull : 1;
      const dt = Math.max((e.timeStamp - time) / 1000, 0.008);
      vx = clamp((dx * give - x) / dt, -2500, 2500);
      vy = clamp((dy * give - y) / dt, -2500, 2500);
      x = dx * give;
      y = dy * give;
      time = e.timeStamp;
      draw();
    };

    const onRelease = () => {
      if (!held) return;
      held = false;
      time = performance.now();
      frame = requestAnimationFrame(spring);
    };

    // A drag isn't a click: stop it before it reaches the link.
    const onClick = (e: MouseEvent) => {
      if (!dragged) return;
      e.preventDefault();
      e.stopPropagation();
    };

    body.addEventListener("pointerdown", onDown);
    body.addEventListener("pointermove", onMove);
    body.addEventListener("pointerup", onRelease);
    body.addEventListener("pointercancel", onRelease);
    el.addEventListener("click", onClick, true);
    return () => {
      cancelAnimationFrame(frame);
      body.removeEventListener("pointerdown", onDown);
      body.removeEventListener("pointermove", onMove);
      body.removeEventListener("pointerup", onRelease);
      body.removeEventListener("pointercancel", onRelease);
      el.removeEventListener("click", onClick, true);
    };
  }, [root, enabled]);
}

function BalloonShape({ tone }: { tone: BalloonTone }) {
  const [light, mid, deep] = TONES[tone];
  const id = `cc-balloon-${tone}`;
  return (
    <svg viewBox="0 0 80 92" className="w-full overflow-visible" aria-hidden="true">
      <defs>
        <radialGradient id={id} cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor={light} />
          <stop offset="0.5" stopColor={mid} />
          <stop offset="1" stopColor={deep} />
        </radialGradient>
      </defs>
      <path d="M40 3 C 63 3, 77 21, 77 42 C 77 64, 57 82, 40 84 C 23 82, 3 64, 3 42 C 3 21, 17 3, 40 3 Z" fill={`url(#${id})`} />
      {/* The tied neck. */}
      <path d="M40 83 L 35.5 90 Q 40 88.5, 44.5 90 Z" fill={deep} />
      {/* Gloss. */}
      <ellipse cx="25" cy="25" rx="6.5" ry="12" transform="rotate(-28 25 25)" fill="#fff" fillOpacity="0.5" />
      <ellipse cx="33" cy="12" rx="2.6" ry="1.8" fill="#fff" fillOpacity="0.55" />
    </svg>
  );
}

export function Balloon({
  label,
  categoryId,
  tone,
  index,
  href,
}: {
  label: React.ReactNode;
  categoryId: string;
  tone: BalloonTone;
  /** Position in the garland: varies the bob's rhythm. */
  index: number;
  /** Where the balloon leads (the gallery). None: not a link (the editor). */
  href?: string;
}) {
  const root = useRef<HTMLSpanElement>(null);
  useTether(root, Boolean(href));
  const body = (
    <span
      ref={root}
      className="balloon flex flex-col items-center"
      style={{ "--bob-d": `${5.5 + (index % 3) * 0.9}s`, "--bob-delay": `${-index * 1.3}s` } as React.CSSProperties}
    >
      <span data-pull={href ? "" : undefined} className="balloon-body block w-20 sm:w-24 lg:w-26">
        <BalloonShape tone={tone} />
      </span>
      {/* The string, curling down to the tag. */}
      <svg viewBox="0 0 20 56" aria-hidden="true" className="balloon-string -mt-0.5 h-12 w-4 overflow-visible sm:h-14">
        <path d={REST_STRING} fill="none" stroke="var(--cc-gold-deep)" strokeWidth="1" strokeLinecap="round" />
      </svg>
      <span className="balloon-tag relative -mt-0.5 rounded-sm border border-highlight/50 bg-background/90 px-3 py-1.5 font-display text-lg leading-tight text-foreground italic shadow-[0_6px_14px_-8px_rgb(70_40_15/0.35)] transition-colors duration-500 group-hover:border-primary/50 group-hover:text-primary sm:text-xl">
        {/* The tag's hole, threaded by the string. */}
        <span aria-hidden="true" className="absolute -top-1 left-1/2 size-1.5 -translate-x-1/2 rounded-full border border-highlight bg-background" />
        {label}
      </span>
    </span>
  );

  if (!href) return body;

  return (
    <a
      href={href}
      draggable={false}
      onClick={() => window.dispatchEvent(new CustomEvent(GALLERY_FILTER_EVENT, { detail: categoryId }))}
      className={cn("group block rounded-md focus-visible:outline-2 focus-visible:outline-offset-4")}
    >
      {body}
      <span className="sr-only">: see photos</span>
    </a>
  );
}
