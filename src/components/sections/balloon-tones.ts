/*
 * Shared by the Categories balloons (server and client): their colour tones
 * and the event a balloon sends to ask the gallery for one category. Kept
 * out of balloon.tsx ("use client") so server components can read them.
 */

export const GALLERY_FILTER_EVENT = "cc:gallery-filter";

/** Light, mid and deep stops of each balloon tone. */
export const TONES = {
  blush: ["#fdeef1", "#f3bccb", "#d98ea0"],
  champagne: ["#fdf6e9", "#ebd2ad", "#c9a56e"],
  gold: ["#f8e2b3", "#d29a49", "#9f6b2b"],
  rose: ["#f6c6d1", "#cc7e91", "#a3546a"],
  pearl: ["#ffffff", "#f3ece4", "#d6c8b9"],
} as const;
export type BalloonTone = keyof typeof TONES;
export const BALLOON_TONES = Object.keys(TONES) as BalloonTone[];
