"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/session";
import { processUpload } from "@/lib/media/image-processing";
import { listImages, listVideos, upsertVideoLink } from "@/lib/media/server";
import {
  ALT_MAX,
  CMS_MEDIA_BUCKET,
  TITLE_MAX,
  imageUses,
  type MediaImage,
  type MediaVideo,
} from "@/lib/media/types";
import { parseVideoLink } from "@/lib/media/video-url";
import { createClient } from "@/lib/supabase/server";
import { CMS_CONTENT_TAG } from "@/lib/supabase/public";

/*
 * Media library actions. Same rules as every CMS action: requireAdmin(),
 * validate everything again, write with the admin's own session so RLS
 * (database and Storage) applies, report a clear result, never leave a
 * record without its file or a file without its record.
 *
 * Upload flow: the browser puts the raw file at incoming/<uuid> (Storage RLS:
 * admins only). finalizeImageUpload then checks and prepares it here, stores
 * the result at images/<use>/<uuid>.<ext>, creates the media_assets row, and
 * removes the raw upload — whatever happens.
 */

export type MediaResult<T = undefined> =
  | ({ ok: true; message: string } & (T extends undefined ? object : { item: T }))
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

const alt = z
  .string()
  .trim()
  .min(1, "Describe the photo for people who can't see it.")
  .max(ALT_MAX, `Keep this to ${ALT_MAX} characters or fewer.`)
  .regex(/^[^\r\n]*$/, "Keep this on one line.");

function mediaChanged(publicContent: boolean) {
  // Alt text and deletions can change the public site; new uploads can't.
  if (publicContent) updateTag(CMS_CONTENT_TAG);
  revalidatePath("/admin/content", "layout");
  revalidatePath("/admin/editor");
}

/** Remove raw uploads that were never finished (closed tab, lost connection). */
async function sweepIncoming(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data } = await supabase.storage.from(CMS_MEDIA_BUCKET).list("incoming", { limit: 100 });
  const stale = (data ?? [])
    .filter((f) => f.created_at && Date.now() - new Date(f.created_at).getTime() > 24 * 60 * 60 * 1000)
    .map((f) => `incoming/${f.name}`);
  if (stale.length) await supabase.storage.from(CMS_MEDIA_BUCKET).remove(stale);
}

const finalizeSchema = z.object({
  incomingPath: z.string().regex(/^incoming\/[0-9a-f-]{36}$/),
  alt,
  use: z.enum(imageUses),
  originalFilename: z
    .string()
    .transform((v) => v.replace(/[\u0000-\u001f\u007f]/g, "").split(/[\\/]/).pop()!.trim().slice(0, 200))
    .transform((v) => v || null),
  /** Replace this library photo's file (it keeps its id, so every use shows the new file). */
  replaceId: z.uuid().optional(),
});

export async function finalizeImageUpload(input: unknown): Promise<MediaResult<MediaImage>> {
  await requireAdmin();
  const parsed = finalizeSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { ok: false, error: fieldErrors.alt ?? "This upload couldn't be finished. Please try again.", fieldErrors };
  }
  const { incomingPath, use, originalFilename } = parsed.data;
  const supabase = await createClient();
  const bucket = supabase.storage.from(CMS_MEDIA_BUCKET);
  const removeIncoming = () => bucket.remove([incomingPath]).catch(() => undefined);

  try {
    const download = await bucket.download(incomingPath);
    if (download.error || !download.data) {
      console.error("[media] incoming download failed", { message: download.error?.message });
      return { ok: false, error: "This image could not be uploaded. Please try again." };
    }
    const processed = await processUpload(Buffer.from(await download.data.arrayBuffer()));
    if (!processed.ok) return { ok: false, error: processed.error };

    const storagePath = `images/${use}/${randomUUID()}.${processed.ext}`;
    const stored = await bucket.upload(storagePath, processed.data, { contentType: processed.mime, upsert: false });
    if (stored.error) {
      console.error("[media] final upload failed", { message: stored.error.message });
      return { ok: false, error: "This image could not be uploaded. Please try again." };
    }

    if (parsed.data.replaceId) {
      // Same record, new file: everything using the photo shows the new one.
      const before = await supabase
        .from("media_assets")
        .select("storage_path")
        .eq("id", parsed.data.replaceId)
        .eq("kind", "image")
        .maybeSingle();
      const { data: replaced, error: replaceError } = await supabase
        .from("media_assets")
        .update({
          storage_path: storagePath,
          alt: parsed.data.alt,
          width: processed.width,
          height: processed.height,
          original_filename: originalFilename,
          mime_type: processed.mime,
          file_size: processed.size,
        })
        .eq("id", parsed.data.replaceId)
        .eq("kind", "image")
        .select("id, created_at, storage_path")
        .maybeSingle();
      if (replaceError || !replaced || !before.data) {
        console.error("[media] replace failed", { code: replaceError?.code });
        await bucket.remove([storagePath]);
        return { ok: false, error: "The photo couldn't be replaced. Nothing was changed. Please try again." };
      }
      if (before.data.storage_path) {
        const removed = await bucket.remove([before.data.storage_path]);
        if (removed.error) console.error("[media] old file removal failed after replace", { message: removed.error.message });
      }
      mediaChanged(true);
      const { data: signedNew } = await bucket.createSignedUrl(storagePath, 60 * 60);
      return {
        ok: true,
        message: "Photo replaced. Everywhere it's used now shows the new photo.",
        item: {
          id: replaced.id,
          url: signedNew?.signedUrl ?? "",
          alt: parsed.data.alt,
          width: processed.width,
          height: processed.height,
          originalFilename,
          fileSize: processed.size,
          mimeType: processed.mime,
          createdAt: replaced.created_at,
          usage: [],
        },
      };
    }

    const { data: row, error } = await supabase
      .from("media_assets")
      .insert({
        kind: "image",
        provider: "supabase",
        storage_path: storagePath,
        alt: parsed.data.alt,
        width: processed.width,
        height: processed.height,
        original_filename: originalFilename,
        mime_type: processed.mime,
        file_size: processed.size,
      })
      .select("id, created_at")
      .single();
    if (error || !row) {
      console.error("[media] media row insert failed", { code: error?.code });
      await bucket.remove([storagePath]);
      return {
        ok: false,
        error: "The image was uploaded, but the media record could not be created. The uploaded file was cleaned up.",
      };
    }

    mediaChanged(false);
    const { data: signed } = await bucket.createSignedUrl(storagePath, 60 * 60);
    return {
      ok: true,
      message: "Photo added to the library.",
      item: {
        id: row.id,
        url: signed?.signedUrl ?? "",
        alt: parsed.data.alt,
        width: processed.width,
        height: processed.height,
        originalFilename,
        fileSize: processed.size,
        mimeType: processed.mime,
        createdAt: row.created_at,
        usage: [],
      },
    };
  } finally {
    await removeIncoming();
    await sweepIncoming(supabase).catch(() => undefined);
  }
}

export async function updateImageAlt(id: string, value: string): Promise<MediaResult> {
  await requireAdmin();
  const parsedId = z.uuid().safeParse(id);
  const parsedAlt = alt.safeParse(value);
  if (!parsedId.success) return { ok: false, error: "That photo couldn't be found." };
  if (!parsedAlt.success) {
    return { ok: false, error: parsedAlt.error.issues[0].message, fieldErrors: { alt: parsedAlt.error.issues[0].message } };
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("media_assets")
    .update({ alt: parsedAlt.data })
    .eq("id", parsedId.data)
    .eq("kind", "image")
    .select("id")
    .maybeSingle();
  if (error || !data) {
    console.error("[media] alt update failed", { code: error?.code });
    return { ok: false, error: "The description couldn't be saved. Please try again." };
  }
  mediaChanged(true);
  return { ok: true, message: "Photo description saved." };
}

/** Delete an unused photo or video. The database refuses if anything uses it. */
export async function deleteMedia(id: string): Promise<MediaResult> {
  await requireAdmin();
  if (!z.uuid().safeParse(id).success) return { ok: false, error: "That item couldn't be found." };
  const supabase = await createClient();
  const { data: rows, error } = await supabase.from("media_assets").delete().eq("id", id).select("kind, storage_path");
  if (error) {
    if (error.code === "23503") {
      return {
        ok: false,
        error: "This is still used on the website (published or draft content) and can't be deleted. Replace or remove it there first.",
      };
    }
    console.error("[media] delete failed", { code: error.code });
    return { ok: false, error: "This couldn't be deleted. Please try again." };
  }
  const row = rows?.[0];
  if (!row) return { ok: false, error: "That item couldn't be found. It may already be deleted." };
  if (row.storage_path) {
    const removed = await supabase.storage.from(CMS_MEDIA_BUCKET).remove([row.storage_path]);
    // The record is gone; a leftover private file is harmless but worth knowing.
    if (removed.error) console.error("[media] file removal failed after delete", { message: removed.error.message });
  }
  mediaChanged(true);
  return { ok: true, message: row.kind === "image" ? "Photo deleted." : "Video removed from the library." };
}

const linkSchema = z.object({
  url: z.string(),
  title: z.string().trim().min(1, "Give the video a short title.").max(TITLE_MAX).regex(/^[^\r\n]*$/),
});

export async function addVideoLink(input: unknown): Promise<MediaResult<{ id: string }>> {
  await requireAdmin();
  const parsed = linkSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues[0].message;
    return { ok: false, error: message, fieldErrors: { [String(parsed.error.issues[0].path[0])]: message } };
  }
  const link = parseVideoLink(parsed.data.url);
  if (!link.ok) return { ok: false, error: link.error, fieldErrors: { url: link.error } };
  const supabase = await createClient();
  const result = await upsertVideoLink(supabase, link.link, parsed.data.title);
  if ("error" in result) return { ok: false, error: result.error };
  mediaChanged(false);
  return { ok: true, message: "Video added to the library.", item: { id: result.id } };
}

const videoTitle = z.string().trim().min(1, "Give the video a short title.").max(TITLE_MAX).regex(/^[^\r\n]*$/, "Keep this on one line.");

/** A library video's title (shown in the admin; films have their own titles). */
export async function updateVideoTitle(id: string, value: string): Promise<MediaResult> {
  await requireAdmin();
  const parsedId = z.uuid().safeParse(id);
  const parsedTitle = videoTitle.safeParse(value);
  if (!parsedId.success) return { ok: false, error: "That video couldn't be found." };
  if (!parsedTitle.success) return { ok: false, error: parsedTitle.error.issues[0].message, fieldErrors: { title: parsedTitle.error.issues[0].message } };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("media_assets")
    .update({ title: parsedTitle.data })
    .eq("id", parsedId.data)
    .eq("kind", "video")
    .select("id")
    .maybeSingle();
  if (error || !data) {
    console.error("[media] video title update failed", { code: error?.code });
    return { ok: false, error: "The title couldn't be saved. Please try again." };
  }
  mediaChanged(false);
  return { ok: true, message: "Video title saved." };
}

/** A video's cover photo (poster), from the library; null removes it. */
export async function setVideoPoster(videoId: string, posterId: string | null): Promise<MediaResult> {
  await requireAdmin();
  if (!z.uuid().safeParse(videoId).success || (posterId !== null && !z.uuid().safeParse(posterId).success)) {
    return { ok: false, error: "That video or photo couldn't be found." };
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("media_assets")
    .update({ poster_media_id: posterId })
    .eq("id", videoId)
    .eq("kind", "video")
    .select("poster_media_id")
    .maybeSingle();
  if (error || !data || data.poster_media_id !== posterId) {
    console.error("[media] poster update failed", { code: error?.code });
    return { ok: false, error: "The cover photo couldn't be saved. Please try again." };
  }
  mediaChanged(true);
  return { ok: true, message: posterId ? "Cover photo saved." : "Cover photo removed." };
}

/** For pickers opened from forms and the visual editor. */
export async function getLibraryImages(): Promise<MediaImage[]> {
  await requireAdmin();
  return listImages(await createClient());
}

export async function getLibraryVideos(): Promise<MediaVideo[]> {
  await requireAdmin();
  return listVideos(await createClient());
}
