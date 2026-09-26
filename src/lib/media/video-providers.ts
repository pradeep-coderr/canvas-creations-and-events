import "server-only";
import type { VideoProvider } from "./types";

/*
 * Video provider adapters. The site never branches on a vendor outside this
 * file: the data layer asks the adapter for a player URL, and the page
 * renders one click-to-load player for any provider.
 *
 * YouTube and Vimeo are links (nothing is stored). "stream" is an uploaded-
 * video provider (e.g. Cloudflare Stream); it is only usable once configured
 * on the server — it is NOT configured in this project yet, so it reports
 * `configured: false` and returns no player instead of pretending to work.
 * Video files are never stored in Supabase.
 */

export interface VideoProviderAdapter {
  provider: VideoProvider;
  /** Ready to use on this deployment? */
  configured: boolean;
  /** Embeddable player, loaded only after the visitor presses Play. */
  playerUrl(externalId: string): string | null;
}

const youtube: VideoProviderAdapter = {
  provider: "youtube",
  configured: true,
  // Privacy-enhanced domain: no YouTube cookies until the video is played.
  playerUrl: (id) => `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0&playsinline=1`,
};

const vimeo: VideoProviderAdapter = {
  provider: "vimeo",
  configured: true,
  playerUrl: (externalId) => {
    const [id, hash] = externalId.split(":");
    // dnt=1: Vimeo's "do not track" mode.
    return `https://player.vimeo.com/video/${encodeURIComponent(id)}?autoplay=1&dnt=1${hash ? `&h=${encodeURIComponent(hash)}` : ""}`;
  },
};

// Cloudflare Stream-style provider. Needs, server-side only:
//   VIDEO_STREAM_CUSTOMER_CODE  (player subdomain; also allowed in the CSP)
//   and, for uploads, the provider's account id + API token (not implemented
//   until a provider is chosen and credentials exist).
const streamCustomer = process.env.VIDEO_STREAM_CUSTOMER_CODE;
const stream: VideoProviderAdapter = {
  provider: "stream",
  configured: Boolean(streamCustomer && /^[a-z0-9]+$/.test(streamCustomer)),
  playerUrl: (id) =>
    stream.configured
      ? `https://customer-${streamCustomer}.cloudflarestream.com/${encodeURIComponent(id)}/iframe?autoplay=true`
      : null,
};

export const videoAdapters: Record<VideoProvider, VideoProviderAdapter> = { youtube, vimeo, stream };

/** Whether uploaded video can be offered in the admin. */
export function uploadedVideoConfigured() {
  return stream.configured;
}
