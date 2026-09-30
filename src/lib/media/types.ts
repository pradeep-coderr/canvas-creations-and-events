/*
 * The media model (Phase 16), shared by the admin, the editor, the server
 * actions and the public data layer. Mirrors the media_assets constraints in
 * supabase/migrations/…_media_library.sql.
 *
 *   image → provider "supabase": a file in the private cms-media bucket
 *   video → provider "youtube" | "vimeo": a link (nothing stored)
 *           provider "stream": an uploaded-video provider (never Supabase)
 */

export const mediaKinds = ["image", "video"] as const;
export type MediaKind = (typeof mediaKinds)[number];

export const mediaProviders = ["supabase", "youtube", "vimeo", "stream"] as const;
export type MediaProvider = (typeof mediaProviders)[number];

export const videoProviders = ["youtube", "vimeo", "stream"] as const;
export type VideoProvider = (typeof videoProviders)[number];

export const videoProviderLabels: Record<VideoProvider, string> = {
  youtube: "YouTube",
  vimeo: "Vimeo",
  stream: "Uploaded video",
};

/** Storage bucket for CMS images (private; read through signed URLs). */
export const CMS_MEDIA_BUCKET = "cms-media";

/** Folders under images/ (organisation only — usage lives in the database). */
export const imageUses = ["library", "hero", "founder", "services", "gallery", "posters"] as const;
export type ImageUse = (typeof imageUses)[number];

export const IMAGE_MAX_BYTES = 10 * 1024 * 1024;
/** Longest side after processing; larger photos are scaled down (never up). */
export const IMAGE_MAX_EDGE = 3000;
export const IMAGE_MIN_EDGE = 16;

export const imageTypes = {
  "image/jpeg": { ext: "jpg", label: "JPEG" },
  "image/png": { ext: "png", label: "PNG" },
  "image/webp": { ext: "webp", label: "WebP" },
} as const;
export type ImageMime = keyof typeof imageTypes;

export const ALT_MAX = 300;
export const TITLE_MAX = 200;

/** An image as the admin sees it (library, pickers, editor). */
export interface MediaImage {
  id: string;
  /** Signed URL, short-lived (admin views only). */
  url: string;
  alt: string;
  width: number;
  height: number;
  originalFilename: string | null;
  fileSize: number | null;
  mimeType: string | null;
  createdAt: string;
  /** Where it is used (drafts included), in client-friendly words. */
  usage: string[];
  /** Where the photo came from (e.g. a stock-photo page), if recorded. */
  credit?: { text: string; href?: string };
}

/** A video in the library (links and uploaded-provider videos). */
export interface MediaVideo {
  id: string;
  provider: VideoProvider;
  externalId: string;
  title: string;
  sourceUrl: string | null;
  createdAt: string;
  usage: string[];
  /** The video's cover photo (library image), if chosen. */
  posterId: string | null;
  /** Signed URL of the cover (admin views only). */
  posterUrl: string | null;
}
