import "server-only";
import {
  collectionKeys,
  collections,
  type CategoryOption,
  type CollectionKey,
} from "@/lib/cms/collections";
import { VIDEO_STORY_SELECT } from "@/lib/cms/singletons";
import { listImages, listVideos } from "@/lib/media/server";
import type { MediaImage, MediaVideo } from "@/lib/media/types";
import { createClient } from "@/lib/supabase/server";

/*
 * CMS reads for the admin area. Uses the signed-in user's session, so RLS
 * applies: admins see drafts, anyone else sees only published content.
 * Callers must have run requireAdmin() already. Returns null on failure
 * (logged) so pages can show an honest "couldn't load" message.
 */

type Row = Record<string, unknown>;

export type SingletonTable = "home_content" | "about_content" | "video_story" | "site_settings";

/** Every row of a collection, drafts included, in display order. */
export async function listCollection(key: CollectionKey): Promise<Row[] | null> {
  const { table, listSelect } = collections[key];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(table)
    .select(listSelect)
    .order("sort_order")
    .order("created_at");
  if (error) {
    console.error("[cms] list failed", { table, code: error.code });
    return null;
  }
  return data as unknown as Row[];
}

export async function getCollectionItem(key: CollectionKey, id: string): Promise<Row | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from(collections[key].table).select("*").eq("id", id).maybeSingle();
  if (error) console.error("[cms] item read failed", { table: collections[key].table, code: error.code });
  return (data as Row | null) ?? null;
}

/** The next free position at the end of a collection. */
export async function nextSortOrder(key: CollectionKey): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase
    .from(collections[key].table)
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  return typeof data?.sort_order === "number" ? data.sort_order + 1 : 1;
}

export interface CollectionCount {
  published: number;
  draft: number;
}

export async function getCollectionCounts(): Promise<Record<CollectionKey, CollectionCount | null>> {
  const supabase = await createClient();
  const results = await Promise.all(
    collectionKeys.map(async (key) => {
      const { data, error } = await supabase.from(collections[key].table).select("is_published");
      if (error) {
        console.error("[cms] count failed", { table: collections[key].table, code: error.code });
        return [key, null] as const;
      }
      const published = data.filter((r) => r.is_published).length;
      return [key, { published, draft: data.length - published }] as const;
    }),
  );
  return Object.fromEntries(results) as Record<CollectionKey, CollectionCount | null>;
}

export async function getSingleton(table: SingletonTable): Promise<Row | null> {
  const supabase = await createClient();
  // The video section also needs its linked library entry (for the link).
  const select = table === "video_story" ? VIDEO_STORY_SELECT : "*";
  const { data, error } = await supabase.from(table).select(select).eq("id", true).maybeSingle();
  if (error) console.error("[cms] singleton read failed", { table, code: error.code });
  return (data as Row | null) ?? null;
}

/** Every photo in the media library (signed URLs, usage), newest first. */
export async function getImageLibrary(): Promise<MediaImage[]> {
  return listImages(await createClient());
}

export async function getVideoLibrary(): Promise<MediaVideo[]> {
  return listVideos(await createClient());
}

export async function getCategoryOptions(): Promise<CategoryOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, label, is_published")
    .order("sort_order")
    .order("created_at");
  if (error) {
    console.error("[cms] category read failed", { code: error.code });
    return [];
  }
  return data.map((c) => ({ id: c.id, label: c.label, isPublished: c.is_published }));
}
