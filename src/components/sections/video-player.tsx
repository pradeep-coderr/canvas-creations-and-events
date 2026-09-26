"use client";

import { useState } from "react";
import { Play } from "lucide-react";

/*
 * Click-to-load player for any provider (YouTube, Vimeo, uploaded-video
 * provider). Before the visitor presses Play there is no iframe: no player
 * scripts, no third-party requests, no cookies. The cover (poster or the
 * Canvas cover) is server-rendered and passed in as children.
 */
export function VideoPlayer({
  playerUrl,
  title,
  providerLabel,
  children,
}: {
  playerUrl: string;
  title: string;
  providerLabel: string;
  /** The cover shown before playback. */
  children: React.ReactNode;
}) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        src={playerUrl}
        title={title}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className="absolute inset-0 size-full border-0"
      />
    );
  }

  return (
    <>
      {children}
      <button
        type="button"
        onClick={() => setPlaying(true)}
        className="group/play absolute inset-0 flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        <span className="inline-flex min-h-11 items-center gap-3 rounded-full bg-background/95 px-5 py-3 text-sm font-semibold text-foreground shadow-soft transition-colors group-hover/play:bg-background">
          <Play aria-hidden="true" className="size-4 fill-current text-primary" />
          Play video<span className="sr-only">: {title}</span>
        </span>
        <span className="sr-only"> (loads the {providerLabel} player)</span>
      </button>
    </>
  );
}
