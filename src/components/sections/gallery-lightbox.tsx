"use client";

import { createContext, useContext, useId, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Button } from "@/components/ui/button";

/*
 * Gallery lightbox. The grid stays server-rendered; this only adds an open
 * button over each photo and one accessible dialog (Radix: focus trap,
 * Escape, background made inert, scroll lock). Arrow keys move between
 * photos; focus returns to the photo that opened it. Animations only when
 * the visitor hasn't asked for reduced motion.
 */

export interface LightboxPhoto {
  src: string;
  alt: string;
  title?: string;
}

const LightboxContext = createContext<((index: number, trigger: HTMLElement) => void) | null>(null);

export function GalleryLightbox({ photos, children }: { photos: LightboxPhoto[]; children: React.ReactNode }) {
  const [index, setIndex] = useState<number | null>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const captionId = useId();
  const count = photos.length;
  const photo = index === null ? null : photos[index];
  const go = (step: number) => setIndex((i) => (i === null ? i : (i + step + count) % count));

  return (
    <LightboxContext.Provider
      value={(i, el) => {
        trigger.current = el;
        setIndex(i);
      }}
    >
      {children}
      <DialogPrimitive.Root open={photo !== null} onOpenChange={(open) => !open && setIndex(null)}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[#1c1817]/95 motion-safe:data-open:animate-in motion-safe:data-open:fade-in-0" />
          <DialogPrimitive.Content
            data-tone="dark"
            aria-describedby={photo?.title ? captionId : undefined}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              trigger.current?.focus();
            }}
            onKeyDown={(event) => {
              if (count < 2) return;
              if (event.key === "ArrowRight") go(1);
              if (event.key === "ArrowLeft") go(-1);
            }}
            className="fixed inset-0 z-50 flex flex-col text-foreground outline-none motion-safe:data-open:animate-in motion-safe:data-open:fade-in-0"
          >
            <div className="flex items-center justify-between gap-4 px-4 pt-4 sm:px-6">
              <DialogPrimitive.Title className="text-sm font-medium tabular-nums">
                Photo {(index ?? 0) + 1} of {count}
              </DialogPrimitive.Title>
              <DialogPrimitive.Close asChild>
                <Button variant="secondary">
                  <X data-icon="inline-start" aria-hidden="true" />
                  Close
                </Button>
              </DialogPrimitive.Close>
            </div>

            {photo && (
              <div className="relative mx-4 my-4 min-h-0 flex-1 sm:mx-6">
                <Image src={photo.src} alt={photo.alt} fill sizes="100vw" className="object-contain" />
              </div>
            )}

            <div className="flex items-center justify-between gap-3 px-4 pb-4 sm:px-6">
              {count > 1 ? (
                <Button variant="secondary" onClick={() => go(-1)}>
                  <ChevronLeft data-icon="inline-start" aria-hidden="true" />
                  Previous
                </Button>
              ) : (
                <span />
              )}
              <p id={captionId} className="min-w-0 text-center font-display text-lg italic">
                {photo?.title}
              </p>
              {count > 1 ? (
                <Button variant="secondary" onClick={() => go(1)}>
                  Next
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
