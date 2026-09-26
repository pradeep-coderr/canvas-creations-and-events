/*
 * YouTube / Vimeo link parsing. One implementation for the admin (instant
 * feedback) and the server (authoritative, before anything is stored). The
 * database checks the normalized id and the host again.
 */

export type LinkProvider = "youtube" | "vimeo";

export interface ParsedVideoLink {
  provider: LinkProvider;
  /** YouTube: 11-char id. Vimeo: numeric id, or "id:hash" for unlisted videos. */
  externalId: string;
  /** The link as entered (trimmed), kept for the admin. */
  sourceUrl: string;
}

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const VIMEO_ID = /^[0-9]{6,12}$/;
const VIMEO_HASH = /^[0-9a-f]{6,32}$/;

const youtubeHosts = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com", "youtu.be"]);
const vimeoHosts = new Set(["vimeo.com", "www.vimeo.com", "player.vimeo.com"]);

/** Parse a YouTube or Vimeo link; `expect` restricts it to one provider. */
export function parseVideoLink(
  input: string,
  expect?: LinkProvider,
): { ok: true; link: ParsedVideoLink } | { ok: false; error: string } {
  const raw = input.trim();
  const fail = (error: string) => ({ ok: false as const, error });
  const hint =
    expect === "vimeo"
      ? "Paste a Vimeo link, e.g. https://vimeo.com/123456789"
      : expect === "youtube"
        ? "Paste a YouTube link, e.g. https://www.youtube.com/watch?v=…"
        : "Paste a YouTube or Vimeo link.";
  if (!raw || raw.length > 500 || /\s/.test(raw)) return fail(hint);

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return fail(hint);
  }
  if (url.protocol !== "https:" || url.username || url.password || url.port) return fail(hint);
  const host = url.hostname.toLowerCase();
  const parts = url.pathname.split("/").filter(Boolean);

  if (youtubeHosts.has(host) && expect !== "vimeo") {
    let id: string | null = null;
    if (host === "youtu.be") id = parts[0] ?? null;
    else if (parts[0] === "watch") id = url.searchParams.get("v");
    else if (["embed", "shorts", "live", "v"].includes(parts[0] ?? "")) id = parts[1] ?? null;
    if (!id || !YOUTUBE_ID.test(id)) return fail("That YouTube link doesn't point to a video. Copy the link from the video's Share button.");
    return { ok: true, link: { provider: "youtube", externalId: id, sourceUrl: raw } };
  }

  if (vimeoHosts.has(host) && expect !== "youtube") {
    // vimeo.com/123 · vimeo.com/123/abc (unlisted) · vimeo.com/channels/x/123
    // · vimeo.com/groups/x/videos/123 · player.vimeo.com/video/123?h=abc
    const idIndex = parts.findIndex((p) => VIMEO_ID.test(p));
    if (idIndex < 0) return fail("That Vimeo link doesn't point to a video. Copy the link from the video's Share button.");
    const id = parts[idIndex];
    const hash = url.searchParams.get("h") ?? (host !== "player.vimeo.com" ? parts[idIndex + 1] : undefined);
    const externalId = hash && VIMEO_HASH.test(hash) ? `${id}:${hash}` : id;
    return { ok: true, link: { provider: "vimeo", externalId, sourceUrl: raw } };
  }

  return fail(hint);
}
