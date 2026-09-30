import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { CMS_MEDIA_BUCKET, type MediaImage, type MediaVideo, type VideoProvider } from "./types";

/*
 * Server-side media helpers. Images live in the PRIVATE cms-media bucket and
 * are delivered through signed URLs:
 *   - public pages sign with the anonymous client, and Storage RLS lets it
 *     sign only images used by published content (drafts stay private);
 *   - admin screens sign with the admin's session (everything, short-lived).
 * next/image then optimizes the signed URL (one delivery strategy: no
 * Supabase transformations, no stored size variants).
 */

/** Public pages are cached (ISR), so their image links must outlive the cache. */
export const PUBLIC_URL_TTL = 60 * 60 * 24 * 365;
/** Admin screens are rendered per request. */
export const ADMIN_URL_TTL = 60 * 60;

type Client = SupabaseClient;

/** Signed URLs for storage paths, keyed by path. Unsignable paths are left out. */
export async function signImagePaths(client: Client, paths: (string | null | undefined)[], ttl: number) {
  const unique = [...new Set(paths.filter((p): p is string => Boolean(p)))];
  const urls = new Map<string, string>();
  if (unique.length === 0) return urls;
  const { data, error } = await client.storage.from(CMS_MEDIA_BUCKET).createSignedUrls(unique, ttl);
  if (error || !data) {
    console.error("[media] signing failed", { message: error?.message });
    return urls;
  }
  for (const item of data) if (item.path && item.signedUrl && !item.error) urls.set(item.path, item.signedUrl);
  return urls;
}

/**
 * Where each media item is used, drafts included, in the admin's words.
 * The database's foreign keys stay the authority; this is for explaining.
 */
export async function getMediaUsage(client: Client): Promise<Map<string, string[]>> {
  const [services, gallery, home, about, video, films, stories, posters] = await Promise.all([
    client.from("services").select("title, image_id, is_published").not("image_id", "is", null),
    client.from("gallery_items").select("title, media_id, is_published"),
    client.from("home_content").select("hero_image_id").eq("id", true).maybeSingle(),
    client.from("about_content").select("image_id").eq("id", true).maybeSingle(),
    client.from("video_story").select("video_media_id, poster_id").eq("id", true).maybeSingle(),
    client.from("films").select("title, video_media_id, is_published"),
    client.from("event_stories").select("title, image_id, is_published, images:event_story_images(media_id)"),
    client.from("media_assets").select("title, poster_media_id").eq("kind", "video").not("poster_media_id", "is", null),
  ]);
  const usage = new Map<string, string[]>();
  const add = (id: unknown, label: string) => {
    if (typeof id !== "string") return;
    usage.set(id, [...(usage.get(id) ?? []), label]);
  };
  const draft = (published: unknown) => (published ? "" : " (draft)");
  for (const s of services.data ?? []) add(s.image_id, `Service: ${s.title}${draft(s.is_published)}`);
  for (const g of gallery.data ?? []) add(g.media_id, `Gallery: ${g.title || "untitled photo"}${draft(g.is_published)}`);
  add(home.data?.hero_image_id, "Hero");
  add(about.data?.image_id, "About (founder photo)");
  add(video.data?.video_media_id, "Video section");
  add(video.data?.poster_id, "Video poster");
  for (const f of films.data ?? []) add(f.video_media_id, `Homepage Films: ${f.title}${draft(f.is_published)}`);
  for (const p of posters.data ?? []) add(p.poster_media_id, `Cover of the video “${p.title}”`);
  for (const st of (stories.data ?? []) as { title: string; image_id: string; is_published: boolean; images: { media_id: string }[] }[]) {
    add(st.image_id, `Event story: ${st.title}${draft(st.is_published)}`);
    for (const i of st.images ?? []) add(i.media_id, `Event story (more photos): ${st.title}${draft(st.is_published)}`);
  }
  return usage;
}

/** Every image, newest first, with short-lived signed URLs and usage. */
export async function listImages(client: Client): Promise<MediaImage[]> {
  const { data, error } = await client
    .from("media_assets")
    .select("id, storage_path, alt, width, height, original_filename, file_size, mime_type, created_at, credit, credit_url")
    .eq("kind", "image")
    .order("created_at", { ascending: false });
  if (error || !data) {
    console.error("[media] image list failed", { code: error?.code });
    return [];
  }
  const [urls, usage] = await Promise.all([
    signImagePaths(client, data.map((m) => m.storage_path), ADMIN_URL_TTL),
    getMediaUsage(client),
  ]);
  return data.map((m) => ({
    id: m.id,
    url: urls.get(m.storage_path) ?? "",
    alt: m.alt ?? "",
    width: m.width ?? 0,
    height: m.height ?? 0,
    originalFilename: m.original_filename,
    fileSize: m.file_size,
    mimeType: m.mime_type,
    createdAt: m.created_at,
    usage: usage.get(m.id) ?? [],
    credit: m.credit ? { text: m.credit, href: m.credit_url ?? undefined } : undefined,
  }));
}

export async function listVideos(client: Client): Promise<MediaVideo[]> {
  const { data, error } = await client
    .from("media_assets")
    .select("id, provider, external_id, title, source_url, created_at, poster_media_id")
    .eq("kind", "video")
    .order("created_at", { ascending: false })
    .overrideTypes<
      {
        id: string;
        provider: string;
        external_id: string | null;
        title: string | null;
        source_url: string | null;
        created_at: string;
        poster_media_id: string | null;
      }[],
      { merge: false }
    >();
  if (error || !data) {
    console.error("[media] video list failed", { code: error?.code });
    return [];
  }
  // Covers in a second query (PostgREST can't embed media_assets in itself).
  const posterIds = [...new Set(data.flatMap((m) => (m.poster_media_id ? [m.poster_media_id] : [])))];
  const posters = posterIds.length
    ? ((await client.from("media_assets").select("id, storage_path").in("id", posterIds)).data ?? [])
    : [];
  const posterPath = new Map(posters.map((p) => [p.id as string, p.storage_path as string]));
  const [usage, urls] = await Promise.all([
    getMediaUsage(client),
    signImagePaths(client, [...posterPath.values()], ADMIN_URL_TTL),
  ]);
  return data.map((m) => ({
    posterId: m.poster_media_id,
    posterUrl: (m.poster_media_id && urls.get(posterPath.get(m.poster_media_id) ?? "")) || null,
    id: m.id,
    provider: m.provider as VideoProvider,
    externalId: m.external_id ?? "",
    title: m.title ?? "Video",
    sourceUrl: m.source_url,
    createdAt: m.created_at,
    usage: usage.get(m.id) ?? [],
  }));
}

/**
 * The library entry for a YouTube/Vimeo link, created if needed (one entry
 * per video). Returns its id, or an error message.
 */
export async function upsertVideoLink(
  client: Client,
  link: { provider: "youtube" | "vimeo"; externalId: string; sourceUrl: string },
  title: string,
): Promise<{ id: string } | { error: string }> {
  const existing = await client
    .from("media_assets")
    .select("id")
    .eq("kind", "video")
    .eq("provider", link.provider)
    .eq("external_id", link.externalId)
    .maybeSingle();
  if (existing.data) return { id: existing.data.id };
  const { data, error } = await client
    .from("media_assets")
    .insert({ kind: "video", provider: link.provider, external_id: link.externalId, source_url: link.sourceUrl, title })
    .select("id")
    .single();
  if (error || !data) {
    console.error("[media] video link insert failed", { code: error?.code });
    return { error: "The video link couldn't be saved. Please try again." };
  }
  return { id: data.id };
}
