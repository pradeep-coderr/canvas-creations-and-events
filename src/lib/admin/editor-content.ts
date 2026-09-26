import "server-only";
import type { EditorData, EditorItemMeta } from "@/components/editor/editor-context";
import type { HomeSectionKey } from "@/components/home/home-sections";
import type { Category } from "@/data/categories";
import type { FaqItem } from "@/data/faq";
import type { GalleryItem } from "@/data/gallery";
import type { EditorialImage, Principle, ProcessStep, VideoContent } from "@/data/home";
import type { Service } from "@/data/services";
import type { Testimonial } from "@/data/testimonials";
import { collectionKeys, collections, type CollectionKey } from "@/lib/cms/collections";
import { VIDEO_STORY_SELECT, aboutToValues, homeToValues, videoToValues } from "@/lib/cms/singletons";
import { ADMIN_URL_TTL, signImagePaths } from "@/lib/media/server";
import { videoAdapters, uploadedVideoConfigured } from "@/lib/media/video-providers";
import type { VideoProvider } from "@/lib/media/types";
import { createClient } from "@/lib/supabase/server";
import { getCategoryOptions, getImageLibrary, getVideoLibrary } from "./cms";

/*
 * Data for the visual editor (/admin/editor). Read with the signed-in
 * admin's session, so drafts are included (RLS). Rows are mapped to the
 * same types the public sections render; collection items use their row id
 * so the editor can act on them. Callers must have run requireAdmin().
 */

type Row = Record<string, unknown>;
type Media = { storage_path: string; alt: string | null; width: number | null; height: number | null } | null;
type Urls = Map<string, string>;
const MEDIA = "storage_path, alt, width, height";

export interface EditorCollections {
  services: Service[];
  categories: Category[];
  gallery: GalleryItem[];
  testimonials: Testimonial[];
  faqs: FaqItem[];
  process: ProcessStep[];
  principles: Principle[];
}

export interface EditorPageData {
  data: EditorData;
  collections: EditorCollections;
  heroImage: EditorialImage | null;
  aboutImage: EditorialImage | null;
  video: VideoContent | null;
  /** Whether a founder name is saved (the credit line appears once saved). */
  hasFounder: boolean;
  hasFounderRole: boolean;
}

const str = (v: unknown) => (typeof v === "string" ? v : "");
/** A signed image for the editor (drafts included), or null. */
const image = (m: Media, urls: Urls): EditorialImage | null => {
  const src = m && urls.get(m.storage_path);
  return m && src ? { src, alt: m.alt ?? "", width: m.width ?? undefined, height: m.height ?? undefined } : null;
};

const selects: Record<CollectionKey, string> = {
  services: `*, image:media_assets!services_image_fkey(${MEDIA})`,
  categories: "*",
  gallery: `*, media:media_assets!gallery_items_media_fkey(${MEDIA}), category:categories(slug, label)`,
  testimonials: "*",
  faqs: "*",
  process: "*",
  principles: "*",
};

// The homepage shows only featured items, and at most this many.
const homepageLimit: Partial<Record<CollectionKey, number>> = { gallery: 5, testimonials: 3 };

function visibility(key: CollectionKey, rows: Row[]) {
  const featuredOnly = collections[key].featured;
  let shown = 0;
  return rows.map((row) => {
    const published = row.is_published === true;
    const featured = row.is_featured === true;
    if (!published) return { visible: false };
    if (featuredOnly && !featured) return { visible: false, note: "Published, but not featured, so not on the homepage" };
    const limit = homepageLimit[key];
    if (limit && shown >= limit) return { visible: false, note: `The homepage shows up to ${limit}, so this one isn't shown` };
    shown++;
    return { visible: true };
  });
}

function toDomain(key: CollectionKey, row: Row, urls: Urls) {
  const id = String(row.id);
  switch (key) {
    case "services": {
      const img = image(row.image as Media, urls);
      return {
        id,
        title: str(row.title),
        summary: str(row.summary),
        image: img ? { src: String(img.src), alt: img.alt, width: img.width, height: img.height } : undefined, order: Number(row.sort_order), featured: row.is_featured === true } satisfies Service;
    }
    case "categories":
      return { id, label: str(row.label), order: Number(row.sort_order) } satisfies Category;
    case "gallery": {
      const img = image(row.media as Media, urls);
      const category = row.category as { slug: string } | null;
      return {
        id,
        src: img?.src ?? "",
        alt: img?.alt ?? "",
        width: img?.width,
        height: img?.height,
        title: str(row.title) || undefined,
        categoryId: category?.slug,
        featured: row.is_featured === true,
        order: Number(row.sort_order),
      } satisfies GalleryItem;
    }
    case "testimonials":
      return {
        id,
        quote: str(row.quote),
        name: str(row.author_name),
        eventType: str(row.event_type) || undefined,
        featured: row.is_featured === true,
        order: Number(row.sort_order),
      } satisfies Testimonial;
    case "faqs":
      return {
        id,
        question: str(row.question),
        answer: str(row.answer),
        action: row.action_label && row.action_href ? { label: str(row.action_label), href: str(row.action_href) } : undefined,
        order: Number(row.sort_order),
      } satisfies FaqItem;
    case "process":
    case "principles":
      return { id, title: str(row.title), description: str(row.description) } satisfies ProcessStep;
  }
}

export async function loadEditorPage(): Promise<EditorPageData | null> {
  const supabase = await createClient();
  const [homeRes, aboutRes, videoRes, imageOptions, videoOptions, categoryOptions, ...lists] = await Promise.all([
    supabase.from("home_content").select(`*, hero_image:media_assets!home_content_hero_image_fkey(${MEDIA})`).eq("id", true).single(),
    supabase.from("about_content").select(`*, image:media_assets!about_content_image_fkey(${MEDIA})`).eq("id", true).single(),
    supabase
      .from("video_story")
      .select(`${VIDEO_STORY_SELECT}, media:media_assets!video_story_video_provider_fkey(provider, external_id), poster:media_assets!video_story_poster_fkey(${MEDIA})`)
      .eq("id", true)
      .single(),
    getImageLibrary(),
    getVideoLibrary(),
    getCategoryOptions(),
    ...collectionKeys.map((key) =>
      supabase.from(collections[key].table).select(selects[key]).order("sort_order").order("created_at"),
    ),
  ]);

  const failed = [homeRes, aboutRes, videoRes, ...lists].find((r) => r.error);
  if (failed?.error) {
    console.error("[editor] load failed", { code: failed.error.code });
    return null;
  }

  const home = homeRes.data as Row;
  const about = aboutRes.data as Row;
  const video = videoRes.data as Row;
  const rowsOf = (i: number) => (lists[i].data ?? []) as unknown as Row[];

  // Every photo on the page, signed in one go with the admin's session.
  const urls = await signImagePaths(
    supabase,
    [
      (home.hero_image as Media)?.storage_path,
      (about.image as Media)?.storage_path,
      (video.poster as Media)?.storage_path,
      ...collectionKeys.flatMap((key, i) =>
        rowsOf(i).map((row) => ((row.image ?? row.media) as Media)?.storage_path),
      ),
    ],
    ADMIN_URL_TTL,
  );

  const items = {} as Record<CollectionKey, EditorItemMeta[]>;
  const domain = {} as Record<CollectionKey, unknown[]>;
  const hidden: HomeSectionKey[] = [];
  const sectionOf: Partial<Record<CollectionKey, HomeSectionKey>> = {
    categories: "categories",
    testimonials: "testimonials",
    process: "process",
    principles: "whyCanvas",
    faqs: "faq",
  };

  collectionKeys.forEach((key, i) => {
    const rows = rowsOf(i);
    const vis = visibility(key, rows);
    items[key] = rows.map((row, j) => ({
      id: String(row.id),
      label: collections[key].label(row),
      published: row.is_published === true,
      featured: row.is_featured === true,
      visibleOnSite: vis[j].visible,
      note: vis[j].note,
      values: collections[key].toValues(row) as Record<string, unknown>,
    }));
    domain[key] = rows.map((row) => toDomain(key, row, urls));
    // Sections that disappear for visitors when nothing in them is shown.
    const section = sectionOf[key];
    if (section && !vis.some((v) => v.visible)) hidden.push(section);
  });

  const media = video.media as { provider: VideoProvider; external_id: string } | null;
  const playerUrl = media ? videoAdapters[media.provider].playerUrl(media.external_id) : null;
  const poster = image(video.poster as Media, urls);

  return {
    data: {
      saved: { home: homeToValues(home), about: aboutToValues(about), video: videoToValues(video) },
      items,
      imageOptions,
      videoOptions,
      uploadedVideoConfigured: uploadedVideoConfigured(),
      categoryOptions,
      hiddenInPreview: hidden,
    },
    collections: domain as unknown as EditorCollections,
    heroImage: image(home.hero_image as Media, urls),
    aboutImage: image(about.image as Media, urls),
    video:
      media && playerUrl && video.video_title
        ? {
            provider: media.provider,
            title: str(video.video_title),
            caption: str(video.caption) || undefined,
            playerUrl,
            poster: poster ? { src: String(poster.src), alt: poster.alt } : null,
          }
        : null,
    hasFounder: Boolean(about.founder_name),
    hasFounderRole: Boolean(about.founder_role),
  };
}
