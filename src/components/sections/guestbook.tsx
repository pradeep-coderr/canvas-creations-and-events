"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Stars } from "@/components/shared/stars";
import type { PublicReview } from "@/lib/review";
import { cn } from "@/lib/utils";

/*
 * The reviews as an open guestbook (globals.css "Guestbook"). Each approved
 * review is a signed page: stars, the message, and the reviewer's name
 * signed beneath. Large screens show a two-page spread; phones one page.
 * Pages turn by grabbing and dragging the page (it follows the pointer and
 * completes past about a quarter turn, or falls back), clicking the right or
 * left page, the arrow keys, or the buttons: a leaf curls over the spine (a
 * 3D turn with shading), carrying one page on its front and the next on its
 * back. With reduced motion the pages simply change. With no reviews yet,
 * the book lies open on a page inviting the first signature.
 */

const TURN_MS = 900;
const RETURN_MS = 350;

function Page({ review, number, side, invite = false }: { review?: PublicReview; number?: number; side: "left" | "right"; invite?: boolean }) {
  return (
    <div
      className={cn(
        "guestbook-page relative flex h-full flex-col bg-[#fffaf2] px-7 pt-8 pb-6 sm:px-10 sm:pt-10",
        side === "left" ? "guestbook-page-left" : "guestbook-page-right",
      )}
    >
      {review ? (
        <figure className="flex flex-1 flex-col">
          <Stars rating={review.rating} />
          <blockquote className="mt-5 flex-1 font-display text-xl leading-relaxed text-[#4a3b33] italic sm:text-[1.375rem]">
            <p className="whitespace-pre-line">{review.message}</p>
          </blockquote>
          <figcaption className="mt-6 text-right">
            <span className="block font-script text-3xl leading-none text-primary">{review.name}</span>
            {review.eventType && <span className="mt-2 block text-xs font-semibold tracking-wide text-[#8a7a70] uppercase">{review.eventType}</span>}
          </figcaption>
        </figure>
      ) : invite ? (
        // The blank page after the last review: an invitation to add one.
        <p className="flex flex-1 items-center justify-center text-center font-script text-2xl text-[#b3a194]">
          This page is waiting for your celebration.
        </p>
      ) : (
        <div aria-hidden="true" className="flex-1" />
      )}
      {number !== undefined && (
        <span aria-hidden="true" className="mt-4 text-center font-display text-sm text-[#a8968a] italic">
          {number}
        </span>
      )}
    </div>
  );
}

/** Pages shown at once: two side by side from the lg breakpoint, else one. */
function usePerView() {
  const [perView, setPerView] = useState(2);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 64rem)");
    const update = () => setPerView(mq.matches ? 2 : 1);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return perView;
}

/*
 * A turn in progress. The leaf rotates about the spine (rotateY, degrees):
 *   two pages, next: the right page, 0 → −180 (lands on the left)
 *   two pages, prev: the left page, 0 → 180 (lands on the right)
 *   one page, next:  the page, 0 → −180 (lifts away to the left)
 *   one page, prev:  the earlier page, −180 → 0 (comes back over it)
 * "drag": following the pointer (no transition); "settle": finishing the
 * turn; "return": let go early, falling back to where it started.
 */
type Dir = "next" | "prev";
type Leaf = {
  dir: Dir;
  from: number;
  to: number;
  angle: number;
  phase: "drag" | "settle" | "return";
  /** The curl shading it was let go with, for the finish to carry on from. */
  shadeFrom?: number;
  /** Let go past upright or falling back: the shading only fades from here. */
  fading?: boolean;
};

const startAngle = (dir: Dir, single: boolean) => (single && dir === "prev" ? -180 : 0);
const endAngle = (dir: Dir, single: boolean) => (dir === "next" ? -180 : single ? 0 : 180);
/** The curl shading at an angle: strongest with the leaf upright. */
const shadeAt = (angle: number) => Math.sin((Math.abs(angle) / 180) * Math.PI);

export function Guestbook({ reviews, emptyText }: { reviews: PublicReview[]; emptyText: React.ReactNode }) {
  const perView = usePerView();
  const single = perView === 1;
  const [start, setStart] = useState(0);
  const [leaf, setLeaf] = useState<Leaf | null>(null);
  const [grabbing, setGrabbing] = useState(false);
  const drag = useRef<{ x: number; w: number; moved: boolean } | null>(null);
  const book = useRef<HTMLDivElement>(null);
  const [closed, setClosed] = useState(false);

  // The cover opens by itself once the book's top reaches the middle of the
  // screen, and closes again only when the whole book is back below the
  // screen (so it never flaps near the middle, and opens afresh next time).
  // Set as data-book; CSS eases --open (globals.css). Nothing with reduced
  // motion: the book is simply open.
  useEffect(() => {
    const el = book.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let shut: boolean | null = null;
    let frame = 0;
    const check = () => {
      frame = 0;
      const top = el.getBoundingClientRect().top;
      const next = top <= window.innerHeight / 2 ? false : top >= window.innerHeight ? true : (shut ?? true);
      if (next === shut) return;
      const first = shut === null;
      shut = next;
      el.dataset.book = next ? "closed" : "open";
      setClosed(next);
      // The first state is set without animating; changes after it ease.
      if (first) requestAnimationFrame(() => requestAnimationFrame(() => (el.dataset.bookReady = "")));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reviews.length]);

  // Keep the spread aligned when the layout changes between one and two pages.
  const aligned = Math.floor(start / perView) * perView;
  const count = reviews.length;
  const multi = count > perView;
  const canPrev = aligned > 0;
  const canNext = aligned + perView < count;
  const allowed = (dir: Dir) => (dir === "next" ? canNext : canPrev);
  const target = (dir: Dir) => (dir === "next" ? aligned + perView : aligned - perView);
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /** A whole turn (the buttons, a click on a page, the arrow keys). */
  const go = (dir: Dir) => {
    if (leaf || closed || !allowed(dir)) return;
    if (reduced()) {
      setStart(target(dir));
      return;
    }
    setLeaf({ dir, from: aligned, to: target(dir), angle: startAngle(dir, single), phase: "drag" });
    // Two frames later, let it go, so the transition runs from the start angle.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setLeaf((l) => (l ? { ...l, angle: endAngle(dir, single), phase: "settle" } : l))),
    );
  };

  // Finish: a settled turn makes the new spread current; a returned one clears.
  useEffect(() => {
    if (!leaf || leaf.phase === "drag") return;
    const t = window.setTimeout(
      () => {
        if (leaf.phase === "settle") setStart(leaf.to);
        setLeaf(null);
      },
      leaf.phase === "settle" ? TURN_MS : RETURN_MS,
    );
    return () => window.clearTimeout(t);
  }, [leaf]);

  // Grab and drag: the page follows the pointer; let go past about a quarter
  // turn and it completes, otherwise it falls back. A click without moving
  // turns forward on the right half, back on the left.
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (leaf || closed || e.button !== 0 || !multi) return;
    drag.current = { x: e.clientX, w: e.currentTarget.getBoundingClientRect().width, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
    setGrabbing(true);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) < 6) return;
    d.moved = true;
    if (reduced()) return;
    const dir: Dir = dx < 0 ? "next" : "prev";
    if (!allowed(dir)) {
      if (leaf) setLeaf(null);
      return;
    }
    // How far through the turn the pointer has pulled it (0–1).
    const p = Math.min(1, Math.abs(dx) / (single ? d.w * 0.8 : d.w * 0.5));
    const s = startAngle(dir, single);
    setLeaf({ dir, from: aligned, to: target(dir), angle: s + (endAngle(dir, single) - s) * p, phase: "drag" });
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    setGrabbing(false);
    if (!d) return;
    if (!d.moved) {
      const r = e.currentTarget.getBoundingClientRect();
      go(e.clientX - r.left > r.width / 2 ? "next" : "prev");
      return;
    }
    if (reduced()) {
      const dx = e.clientX - d.x;
      if (Math.abs(dx) > 40) go(dx < 0 ? "next" : "prev");
      return;
    }
    if (!leaf || leaf.phase !== "drag") return;
    const s = startAngle(leaf.dir, single);
    const progress = Math.abs(leaf.angle - s) / 180;
    const shadeFrom = shadeAt(leaf.angle);
    setLeaf(
      progress > 0.22
        ? { ...leaf, angle: endAngle(leaf.dir, single), phase: "settle", shadeFrom, fading: progress >= 0.5 }
        : { ...leaf, angle: s, phase: "return", shadeFrom, fading: true },
    );
  };
  const onPointerCancel = () => {
    drag.current = null;
    setGrabbing(false);
    if (leaf?.phase === "drag") {
      setLeaf({ ...leaf, angle: startAngle(leaf.dir, single), phase: "return", shadeFrom: shadeAt(leaf.angle), fading: true });
    }
  };

  if (count === 0) {
    return (
      <div className="guestbook mx-auto mt-12 max-w-xl sm:mt-16">
        <div className="guestbook-cover p-2.5 sm:p-3">
          <div className="guestbook-page flex min-h-56 flex-col items-center justify-center bg-[#fffaf2] px-8 py-10 text-center">
            <p className="font-script text-3xl text-primary">Our guestbook</p>
            <p className="mt-4 max-w-sm font-display text-xl text-[#4a3b33] italic">{emptyText}</p>
          </div>
        </div>
      </div>
    );
  }

  const at = (i: number) => (i >= 0 && i < count ? reviews[i] : undefined);
  const page = (i: number, side: "left" | "right") => (
    <Page review={at(i)} number={at(i) ? i + 1 : undefined} side={side} invite={i === count} />
  );

  // Beneath the leaf: the half it leaves keeps the old page and the half it
  // lands on shows the new one. One page: the page it uncovers.
  const base = leaf
    ? leaf.dir === "next"
      ? { left: leaf.from, right: leaf.to + 1, one: leaf.to }
      : { left: leaf.to, right: leaf.from + 1, one: leaf.from }
    : { left: aligned, right: aligned + 1, one: aligned };

  // The leaf's two faces.
  const faces = !leaf
    ? null
    : single
      ? { front: page(leaf.dir === "next" ? leaf.from : leaf.to, "right"), back: <Page side="left" /> }
      : leaf.dir === "next"
        ? { front: page(leaf.from + 1, "right"), back: page(leaf.to, "left") }
        : { front: page(leaf.from, "left"), back: page(leaf.to + 1, "right") };
  // The curl shading follows the angle while dragged, then carries on from there.
  const shade = !leaf ? 0 : leaf.phase === "drag" ? shadeAt(leaf.angle) : (leaf.shadeFrom ?? 0);

  return (
    <div ref={book} className="guestbook mx-auto mt-12 max-w-5xl sm:mt-16">
      <div
        // Arrow keys turn the pages once the book has focus.
        tabIndex={multi ? 0 : undefined}
        role={multi ? "group" : undefined}
        aria-label={multi ? "Reviews guestbook: drag or click a page, or use the arrow keys, to turn" : undefined}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go("next");
          else if (e.key === "ArrowLeft") go("prev");
          else return;
          e.preventDefault();
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        className={cn(
          "guestbook-cover guestbook-book relative p-2.5 outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 sm:p-3",
          multi && (grabbing ? "cursor-grabbing" : "cursor-grab"),
        )}
        style={{ touchAction: "pan-y" }}
      >
        <div className={cn("guestbook-spread relative grid min-h-[24rem] [perspective:2200px]", !single && "grid-cols-2")}>
          {/* Every review, unseen: holds the book at its tallest page. */}
          <div aria-hidden="true" className="guestbook-sizer">
            {reviews.map((review) => (
              <Page key={review.id} review={review} number={1} side="right" />
            ))}
          </div>
          {single ? (
            page(base.one, "right")
          ) : (
            <>
              {page(base.left, "left")}
              {page(base.right, "right")}
            </>
          )}

          {/* The turning leaf: one page on its front, the other on its back. */}
          {leaf && faces && (
            <div
              aria-hidden="true"
              className={cn(
                "guestbook-leaf absolute inset-y-0",
                single ? "inset-x-0 guestbook-leaf-next" : leaf.dir === "next" ? "right-0 left-1/2 guestbook-leaf-next" : "right-1/2 left-0 guestbook-leaf-prev",
                leaf.phase !== "drag" && "guestbook-leaf-moving",
                leaf.fading && "guestbook-leaf-fading",
              )}
              style={
                {
                  transform: `rotateY(${leaf.angle}deg)`,
                  "--leaf-ms": `${leaf.phase === "settle" ? TURN_MS : RETURN_MS}ms`,
                  "--shade": shade.toFixed(3),
                } as React.CSSProperties
              }
            >
              <div className="guestbook-leaf-face absolute inset-0">{faces.front}</div>
              <div className="guestbook-leaf-face guestbook-leaf-back absolute inset-0">{faces.back}</div>
            </div>
          )}
        </div>

        {/* The front cover: closed when the book first scrolls into view,
            swinging open over the spine once it's in view (globals.css "The
            closed book"). Gone once open; open from the start with reduced
            motion. */}
        <div aria-hidden="true" className="book-cover">
          <div className="book-cover-face flex flex-col items-center justify-center rounded-[10px] bg-[linear-gradient(180deg,rgb(255_255_255/0.1),transparent_45%),linear-gradient(135deg,#b4566e,#8f2f49)] p-6 text-center shadow-[inset_0_0_0_1px_rgb(255_255_255/0.12),0_28px_50px_-24px_rgb(80_20_35/0.55)] lg:rounded-l-[3px]">
            {/* Gold tooling: a double rule inset from the edge. */}
            <span className="pointer-events-none absolute inset-3 rounded-[6px] border border-[#e9c98a]/70" />
            <span className="pointer-events-none absolute inset-[1.15rem] rounded-[4px] border border-[#e9c98a]/35" />
            <span className="block font-script text-5xl leading-tight text-[#f1d9a6] [text-shadow:0_1px_0_rgb(80_20_35/0.5)] sm:text-6xl">Guestbook</span>
            <span className="mt-4 block h-px w-16 bg-[#e9c98a]/70" />
            <span className="mt-4 block text-xs font-semibold tracking-[0.25em] text-[#f1d9a6]/90 uppercase">Canvas Creations and Events</span>
          </div>
          {/* The inside of the cover: on a spread, the left half of the open book. */}
          <div className="book-cover-face book-cover-back rounded-[10px] p-2.5 sm:p-3">
            <div className="book-cover-page h-full">{page(aligned, "left")}</div>
          </div>
        </div>
      </div>

      {/* The buttons (as well as dragging, clicking a page or the arrow keys); the status is announced. */}
      {multi && (
        <div className="mt-6 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => go("prev")}
            disabled={!canPrev || !!leaf}
            aria-label="Previous page"
            className="flex size-11 items-center justify-center rounded-full border border-foreground/25 transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-35"
          >
            <ChevronLeft className="size-5" />
          </button>
          <p aria-live="polite" className="min-w-28 text-center text-sm text-muted-foreground tabular-nums">
            {single ? `Review ${aligned + 1} of ${count}` : `Reviews ${aligned + 1}–${Math.min(aligned + 2, count)} of ${count}`}
          </p>
          <button
            type="button"
            onClick={() => go("next")}
            disabled={!canNext || !!leaf}
            aria-label="Next page"
            className="flex size-11 items-center justify-center rounded-full border border-foreground/25 transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-35"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      )}
    </div>
  );
}
