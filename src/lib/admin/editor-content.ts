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
import { aboutToValues, homeToValues, videoToValues } from "@/lib/cms/singletons";
import { cmsMediaUrl } from "@/lib/content/media";
import { createClient } from "@/lib/supabase/server";
import { getCategoryOptions, getMediaOptions } from "./cms";

/*
 * Data for the visual editor (/admin/editor). Read with the signed-in
 * admin's session, so drafts are included (RLS). Rows are mapped to the
 * same types the public sections render; collection items use their row id
 * so the editor can act on them. Callers must have run requireAdmin().
 */

type Row = Record<string, unknown>;
type Media = { storage_path: string; alt: string | null } | null;

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
const image = (m: Media): EditorialImage | null => (m ? { src: cmsMediaUrl(m.storage_path), alt: m.alt ?? "" } : null);

const selects: Record<CollectionKey, string> = {
  services: "*, image:media_assets!services_image_fkey(storage_path, alt)",
  categories: "*",
  gallery: "*, media:media_assets!gallery_items_media_fkey(storage_path, alt), category:categories(slug, label)",
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

function toDomain(key: CollectionKey, row: Row) {
  const id = String(row.id);
  switch (key) {
    case "services": {
      const m = row.image as Media;
      const img = m ? { src: cmsMediaUrl(m.storage_path), alt: m.alt ?? "" } : undefined;
      return { id, title: str(row.title), summary: str(row.summary), image: img, order: Number(row.sort_order), featured: row.is_featured === true } satisfies Service;
    }
    case "categories":
      return { id, label: str(row.label), order: Number(row.sort_order) } satisfies Category;
    case "gallery": {
      const media = row.media as Media;
      const category = row.category as { slug: string } | null;
      return {
        id,
        src: media ? cmsMediaUrl(media.storage_path) : "",
        alt: media?.alt ?? "",
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
    supabase.from("home_content").select("*, hero_image:media_assets!home_content_hero_image_fkey(storage_path, alt)").eq("id", true).single(),
    supabase.from("about_content").select("*, image:media_assets!about_content_image_fkey(storage_path, alt)").eq("id", true).single(),
    supabase
      .from("video_story")
      .select("*, file:media_assets!video_story_video_fkey(storage_path), poster:media_assets!video_story_poster_fkey(storage_path)")
      .eq("id", true)
      .single(),
    getMediaOptions("image"),
    getMediaOptions("video"),
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
    const rows = (lists[i].data ?? []) as unknown as Row[];
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
    domain[key] = rows.map((row) => toDomain(key, row));
    // Sections that disappear for visitors when nothing in them is shown.
    const section = sectionOf[key];
    if (section && !vis.some((v) => v.visible)) hidden.push(section);
  });

  const file = video.file as { storage_path: string } | null;
  const poster = video.poster as { storage_path: string } | null;

  return {
    data: {
      saved: { home: homeToValues(home), about: aboutToValues(about), video: videoToValues(video) },
      items,
      imageOptions,
      videoOptions,
      categoryOptions,
      hiddenInPreview: hidden,
    },
    collections: domain as unknown as EditorCollections,
    heroImage: image(home.hero_image as Media),
    aboutImage: image(about.image as Media),
    video:
      video.provider === "upload" && file && poster && video.video_title
        ? {
            src: cmsMediaUrl(file.storage_path),
            poster: cmsMediaUrl(poster.storage_path),
            title: str(video.video_title),
            caption: str(video.caption) || undefined,
          }
        : null,
    hasFounder: Boolean(about.founder_name),
    hasFounderRole: Boolean(about.founder_role),
  };
}
