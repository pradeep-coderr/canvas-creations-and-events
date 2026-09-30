"use client";

import { createContext, useContext, useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/*
 * Portfolio interactivity. The photo grid stays server-rendered; this adds:
 *   - an optional category filter (only with three or more categories): the
 *     grid is filtered in place, without a reload, and the photos that stay
 *     fade in lightly (not with reduced motion);
 *   - one accessible lightbox (Radix dialog: focus trap, Escape, background
 *     made inert, scroll lock). Arrow keys and swipes move between the
 *     photos currently shown; the position is announced; focus returns to
 *     the photo that opened it. Only the photo on screen is loaded.
 */

export interface LightboxPhoto {
  src: string;
  alt: string;
  title?: string;
  /** Category id (slug), for the filter. */
  category?: string;
  /** Temporary sample content (said in the caption). */
  sample?: boolean;
  /** Where the photo came from (e.g. a stock-photo page). */
  credit?: { text: string; href?: string };
}

export interface FilterCategory {
  id: string;
  label: string;
}

/** Fewer categories than this and a filter isn't worth showing. */
const MIN_FILTER_CATEGORIES = 3;
const SWIPE_PX = 50;

const LightboxContext = createContext<((index: number, trigger: HTMLElement) => void) | null>(null);

export function GalleryLightbox({
  photos,
  categories = [],
  allLabel = "All",
  children,
}: {
  photos: LightboxPhoto[];
  categories?: FilterCategory[];
  /** The first filter button (editable wording). */
  allLabel?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [index, setIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState("all");
  const trigger = useRef<HTMLElement | null>(null);
  const grid = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const captionId = useId();

  const showFilter = categories.length >= MIN_FILTER_CATEGORIES;
  // The photos the visitor can currently see (and step through), in order.
  const visible = photos.map((p, i) => ({ p, i })).filter(({ p }) => filter === "all" || p.category === filter);
  const position = index === null ? -1 : visible.findIndex((v) => v.i === index);
  const photo = index === null ? null : photos[index];
  const count = visible.length;
  const go = (step: number) => {
    if (position < 0 || count < 2) return;
    setIndex(visible[(position + step + count) % count].i);
  };

  // Photos that stay after a filter change fade in (motion allowed only).
  useEffect(() => {
    if (filter === "all" && !grid.current?.dataset.touched) return;
    if (grid.current) grid.current.dataset.touched = "1";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    grid.current?.querySelectorAll<HTMLElement>("[data-gallery-index]").forEach((el) => {
      if (el.offsetParent === null) return;
      el.animate(
        [
          { opacity: 0, transform: "translateY(8px)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 450, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
      );
    });
  }, [filter]);

  const activeLabel = filter === "all" ? null : categories.find((c) => c.id === filter)?.label;

  return (
    <LightboxContext.Provider
      value={(i, el) => {
        trigger.current = el;
        setIndex(i);
      }}
    >
      {showFilter && (
        <div className="mt-10 lg:mt-12">
          <div role="group" aria-label="Show photos by category" className="flex flex-wrap gap-2">
            {[{ id: "all", label: allLabel }, ...categories].map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={filter === c.id}
                onClick={() => setFilter(c.id)}
                data-sk="gallery.filter"
                className={cn(
                  "inline-flex min-h-11 items-center rounded-full border px-5 text-sm font-semibold transition-colors duration-300 ease-elegant",
                  filter === c.id
                    ? "border-foreground bg-foreground text-background"
                    : "border-foreground/30 text-foreground hover:border-foreground",
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
          <p role="status" className="sr-only">
            {filter === "all" ? `Showing all ${photos.length} photos` : `Showing ${count} ${count === 1 ? "photo" : "photos"}: ${activeLabel ?? ""}`}
          </p>
        </div>
      )}

      {/* Hides the photos outside the chosen category (ids are slugs: [a-z0-9-]). */}
      {filter !== "all" && /^[a-z0-9-]+$/.test(filter) && (
        <style>{`[data-portfolio-filter="${filter}"] .cc-portfolio > li:not([data-category="${filter}"]){display:none}`}</style>
      )}
      <div ref={grid} className="contents" data-portfolio-filter={filter}>
        {children}
      </div>

      <DialogPrimitive.Root open={photo !== null} onOpenChange={(open) => !open && setIndex(null)}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[#1c1817] motion-safe:data-open:animate-in motion-safe:data-open:fade-in-0" />
          <DialogPrimitive.Content
            data-tone="dark"
            aria-describedby={photo?.title || photo?.sample || photo?.credit ? captionId : undefined}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              trigger.current?.focus();
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") go(1);
              if (event.key === "ArrowLeft") go(-1);
            }}
            className="fixed inset-0 z-50 flex flex-col text-foreground outline-none motion-safe:data-open:animate-in motion-safe:data-open:fade-in-0"
          >
            <div className="flex items-center justify-between gap-4 px-4 pt-4 sm:px-6">
              <DialogPrimitive.Title className="text-sm font-medium tabular-nums">
                Photo {position + 1} of {count}
              </DialogPrimitive.Title>
              <DialogPrimitive.Close asChild>
                <Button variant="secondary">
                  <X data-icon="inline-start" aria-hidden="true" />
                  Close
                </Button>
              </DialogPrimitive.Close>
            </div>
            {/* Announces each new photo (the title above isn't re-read on change). */}
            <p aria-live="polite" className="sr-only">
              {photo ? `Photo ${position + 1} of ${count}${photo.title ? `: ${photo.title}` : ""}` : ""}
            </p>

            {photo && (
              <div
                className="relative mx-4 my-4 min-h-0 flex-1 touch-pan-y sm:mx-6"
                onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
                onTouchEnd={(e) => {
                  const start = touch.current;
                  touch.current = null;
                  if (!start) return;
                  const dx = e.changedTouches[0].clientX - start.x;
                  const dy = e.changedTouches[0].clientY - start.y;
                  if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
                }}
                // A click on the dim area beside the photo closes it.
                onClick={(e) => e.target === e.currentTarget && setIndex(null)}
              >
                <Image src={photo.src} alt={photo.alt} fill sizes="100vw" className="object-contain" />
              </div>
            )}

            <div className="flex items-center justify-between gap-3 px-4 pb-4 sm:px-6">
              {count > 1 ? (
                <Button variant="secondary" onClick={() => go(-1)}>
                  <ChevronLeft data-icon="inline-start" aria-hidden="true" />
                  <span className="max-sm:sr-only">Previous</span>
                  <span className="sr-only"> photo</span>
                </Button>
              ) : (
                <span />
              )}
              <div id={captionId} className="min-w-0 text-center">
                {photo?.title && <p className="font-display text-lg italic">{photo.title}</p>}
                {(photo?.sample || photo?.credit) && (
                  <p className="text-xs text-muted-foreground">
                    {photo.sample && "Sample image"}
                    {photo.sample && photo.credit && " · "}
                    {photo.credit &&
                      (photo.credit.href ? (
                        <a href={photo.credit.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                          {photo.credit.text}
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      ) : (
                        photo.credit.text
                      ))}
                  </p>
                )}
              </div>
              {count > 1 ? (
                <Button variant="secondary" onClick={() => go(1)}>
                  <span className="max-sm:sr-only">Next</span>
                  <span className="sr-only"> photo</span>
                  <ChevronRight data-icon="inline-end" aria-hidden="true" />
                </Button>
              ) : (
                <span />
              )}
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </LightboxContext.Provider>
  );
}

/** Invisible full-size button over a gallery photo that opens the lightbox. */
export function LightboxTrigger({ index, label }: { index: number; label: string }) {
  const open = useContext(LightboxContext);
  return (
    <button
      type="button"
      aria-label={`Open photo: ${label}`}
      aria-haspopup="dialog"
      onClick={(event) => open?.(index, event.currentTarget)}
      className="absolute inset-0 z-[1] cursor-zoom-in outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
    />
  );
}
