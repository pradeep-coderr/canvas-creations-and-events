"use client";

import { cn } from "@/lib/utils";
import { GALLERY_FILTER_EVENT, TONES, type BalloonTone } from "./balloon-tones";

/*
 * One balloon of the Categories garland: a glossy balloon in a brand tone,
 * a curling string and a hanging tag with the category's name. It bobs
 * gently on its own rhythm (globals.css "Balloon garland") and lifts on
 * hover. As a link it scrolls to the gallery and asks it to show only that
 * category (GALLERY_FILTER_EVENT in balloon-tones, handled in gallery-lightbox).
 */

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
  const body = (
    <span
      className="balloon flex flex-col items-center"
      style={{ "--bob-d": `${5.5 + (index % 3) * 0.9}s`, "--bob-delay": `${-index * 1.3}s` } as React.CSSProperties}
    >
      <span className="balloon-body block w-20 transition-[translate,rotate] duration-700 ease-elegant sm:w-24 lg:w-26">
        <BalloonShape tone={tone} />
      </span>
      {/* The string, curling down to the tag. */}
      <svg viewBox="0 0 20 56" aria-hidden="true" className="-mt-0.5 h-12 w-4 overflow-visible sm:h-14">
        <path d="M10 0 C 4 10, 16 18, 10 28 S 4 46, 10 56" fill="none" stroke="var(--cc-gold-deep)" strokeWidth="1" strokeLinecap="round" />
      </svg>
      <span className="relative -mt-0.5 rounded-sm border border-highlight/50 bg-background/90 px-3 py-1.5 font-display text-lg leading-tight text-foreground italic shadow-[0_6px_14px_-8px_rgb(70_40_15/0.35)] transition-colors duration-500 group-hover:border-primary/50 group-hover:text-primary sm:text-xl">
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
      onClick={() => window.dispatchEvent(new CustomEvent(GALLERY_FILTER_EVENT, { detail: categoryId }))}
      className={cn("group block rounded-md focus-visible:outline-2 focus-visible:outline-offset-4")}
    >
      {body}
      <span className="sr-only">: see photos</span>
    </a>
  );
}
