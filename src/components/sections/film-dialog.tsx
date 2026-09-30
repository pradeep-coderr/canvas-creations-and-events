"use client";

import { useRef, useState } from "react";
import { Play, X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Button } from "@/components/ui/button";

/*
 * A film card's Play button and its player dialog. Before Play there is no
 * iframe (no player scripts, no third-party requests). The dialog mounts
 * the provider's player; closing it (button, Escape, backdrop) unmounts the
 * player, so nothing keeps playing or stays loaded, and focus returns to the
 * card's button.
 */
export function FilmDialog({
  playerUrl,
  title,
  providerLabel,
  children,
}: {
  playerUrl: string;
  title: string;
  providerLabel: string;
  /** The card's cover (server-rendered). */
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      {children}
      <DialogPrimitive.Trigger asChild>
        <button
          ref={trigger}
          type="button"
          className="group/play absolute inset-0 flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        >
          <span className="inline-flex size-14 items-center justify-center rounded-full bg-background/95 text-foreground shadow-soft transition-transform duration-500 ease-elegant motion-safe:group-hover/play:scale-105">
            <Play aria-hidden="true" className="ml-0.5 size-5 fill-current text-primary" />
          </span>
          <span className="sr-only">
            Play film: {title} (opens the {providerLabel} player)
          </span>
        </button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[#1c1817] motion-safe:data-open:animate-in motion-safe:data-open:fade-in-0" />
        <DialogPrimitive.Content
          data-tone="dark"
          aria-describedby={undefined}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            trigger.current?.focus();
          }}
          className="fixed inset-0 z-50 flex flex-col text-foreground outline-none motion-safe:data-open:animate-in motion-safe:data-open:fade-in-0"
        >
          <div className="flex items-center justify-between gap-4 px-4 pt-4 sm:px-6">
            <DialogPrimitive.Title className="min-w-0 truncate font-display text-lg italic">{title}</DialogPrimitive.Title>
            <DialogPrimitive.Close asChild>
              <Button variant="secondary">
                <X data-icon="inline-start" aria-hidden="true" />
                Close
              </Button>
            </DialogPrimitive.Close>
          </div>
          {/* Close on a click outside the player (the dim area). */}
          <div
            className="flex min-h-0 flex-1 items-center justify-center p-4 sm:p-6"
            onClick={(event) => event.target === event.currentTarget && setOpen(false)}
          >
            {/* 16:9 that fits both ways: full width, or the height of a landscape phone. */}
            <div
              className="relative aspect-video bg-black"
              style={{ width: "min(100%, 72rem, calc((100dvh - 7rem) * 16 / 9))" }}
            >
              <iframe
                src={playerUrl}
                title={title}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                className="absolute inset-0 size-full border-0"
              />
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
