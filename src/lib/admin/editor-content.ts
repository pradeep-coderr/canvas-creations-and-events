import "server-only";
import type { EditorData, EditorItemMeta } from "@/components/editor/editor-context";
import type { HomeSectionKey } from "@/components/home/home-sections";
import type { Category } from "@/data/categories";
import type { FaqItem } from "@/data/faq";
import type { Film } from "@/data/films";
import type { GalleryItem } from "@/data/gallery";
import type { EditorialImage, Principle, ProcessStep } from "@/data/home";
import type { PricingPackage } from "@/data/pricing";
import type { EventStory, StoryImage } from "@/data/stories";
import type { Service } from "@/data/services";
import type { Testimonial } from "@/data/testimonials";
import { collectionKeys, collections, type CollectionKey, type PriceType } from "@/lib/cms/collections";
import { SITE_SETTINGS_SELECT, siteToValues } from "@/lib/cms/site-settings";
import { rowToStyles } from "@/lib/styles/schema";
import { VIDEO_STORY_SELECT, aboutToValues, homeToValues, videoToValues } from "@/lib/cms/singletons";
import { PORTFOLIO_LIMIT } from "@/lib/content/public";
import { ADMIN_URL_TTL, signImagePaths } from "@/lib/media/server";
import { videoAdapters, uploadedVideoConfigured } from "@/lib/media/video-providers";
import { createClient } from "@/lib/supabase/server";
import { getCategoryOptions, getImageLibrary, getVideoLibrary } from "./cms";

/*
 * Data for the visual editor (/admin/editor). Read with the signed-in
 * admin's session, so drafts are included (RLS). Rows are mapped to the
 * same types the public sections render; collection items use their row id
 * so the editor can act on them. Callers must have run requireAdmin().
 */

type Row = Record<string, unknown>;
type Media = {
  storage_path: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  credit?: string | null;
  credit_url?: string | null;
} | null;
type Urls = Map<string, string>;
const MEDIA = "storage_path, alt, width, height, credit, credit_url";

export interface EditorCollections {
  services: Service[];
  pricing: PricingPackage[];
  categories: Category[];
  gallery: GalleryItem[];
  stories: EventStory[];
  films: Film[];
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
  /** Categories that have photos in the portfolio (drafts included). */
  galleryCategories: { id: string; label: string }[];
  /** Whether a founder name is saved (the credit line appears once saved). */
  hasFounder: boolean;
  hasFounderRole: boolean;
}

const str = (v: unknown) => (typeof v === "string" ? v : "");
/** A signed photo with its credit (stories, portfolio). */
const credited = (m: Media, urls: Map<string, string>): StoryImage | null => {
  const src = m && urls.get(m.storage_path);
  if (!m || !src) return null;
  const img: StoryImage = { src, alt: m.alt ?? "", width: m.width ?? undefined, height: m.height ?? undefined };
  return m.credit ? { ...img, credit: { text: m.credit, href: m.credit_url ?? undefined } } : img;
};
/** A signed image for the editor (drafts included), or null. */
const image = (m: Media, urls: Urls): EditorialImage | null => {
  const src = m && urls.get(m.storage_path);
  return m && src ? { src, alt: m.alt ?? "", width: m.width ?? undefined, height: m.height ?? undefined } : null;
};

const selects: Record<CollectionKey, string> = {
  services: `*, image:media_assets!services_image_fkey(${MEDIA})`,
  pricing: "*",
  categories: "*",
  gallery: `*, media:media_assets!gallery_items_media_fkey(${MEDIA}), category:categories(slug, label, sort_order)`,
  stories: `*, category:categories(label), image:media_assets!event_stories_image_fkey(${MEDIA}), images:event_story_images(sort_order, media_id, media:media_assets!event_story_images_media_fkey(${MEDIA})), testimonial:testimonials(quote, author_name, event_type, is_published)`,
  films: "*, video:media_assets!films_video_fkey(provider, external_id, poster_media_id)",
  testimonials: "*",
  faqs: "*",
  process: "*",
  principles: "*",
};

// On the homepage these lists show only their featured items; the others
// show every published item ("featured" there means first / larger).
const featuredOnlyKeys = new Set<CollectionKey>(["services", "testimonials"]);
// ...and at most this many.
const homepageLimit: Partial<Record<CollectionKey, number>> = { gallery: PORTFOLIO_LIMIT, testimonials: 3 };

function visibility(key: CollectionKey, rows: Row[]) {
  const featuredOnly = featuredOnlyKeys.has(key);
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
    case "pricing":
      return {
        id,
        title: str(row.title),
        description: str(row.description) || undefined,
        priceType: str(row.price_type) as PriceType,
        price: row.price === null || row.price === undefined ? null : Number(row.price),
        pricePrefix: str(row.price_prefix) || undefined,
        priceSuffix: str(row.price_suffix) || undefined,
        features: Array.isArray(row.features) ? (row.features as string[]) : [],
        ctaLabel: str(row.cta_label) || undefined,
        featured: row.is_featured === true,
        order: Number(row.sort_order),
      } satisfies PricingPackage;
    case "films": {
      const video = row.video as { provider: "youtube" | "vimeo"; external_id: string; poster: Media } | null;
      const poster = image(video?.poster ?? null, urls);
      return {
        id,
        provider: video?.provider ?? "youtube",
        title: str(row.title),
        caption: str(row.caption) || undefined,
        playerUrl: video ? (videoAdapters[video.provider].playerUrl(video.external_id) ?? "") : "",
        poster: poster ? { src: String(poster.src), alt: poster.alt } : null,
        featured: row.is_featured === true,
        order: Number(row.sort_order),
      } satisfies Film;
    }
    case "categories":
      return { id, label: str(row.label), order: Number(row.sort_order) } satisfies Category;
    case "gallery": {
      const img = credited(row.media as Media, urls);
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
        isDemo: row.is_demo === true,
        credit: img?.credit,
      } satisfies GalleryItem;
    }
    case "stories": {
      const main = credited(row.image as Media, urls);
      const testimonial = row.testimonial as { quote: string; author_name: string; event_type: string | null; is_published: boolean } | null;
      return {
        id,
        title: str(row.title),
        description: str(row.description),
        category: (row.category as { label: string } | null)?.label,
        image: main ?? { src: "", alt: "" },
        gallery: ((row.images as { sort_order: number; media: Media }[]) ?? [])
          .toSorted((a, b) => a.sort_order - b.sort_order)
          .flatMap((i) => {
            const img = credited(i.media, urls);
            return img ? [img] : [];
          }),
        location: str(row.location) || undefined,
        styling: Array.isArray(row.styling) ? (row.styling as string[]) : [],
        // As visitors would see it: only a published testimonial.
        testimonial:
          testimonial?.is_published
            ? { quote: testimonial.quote, name: testimonial.author_name, eventType: testimonial.event_type ?? undefined }
            : undefined,
        isDemo: row.is_demo === true,
        featured: row.is_featured === true,
        order: Number(row.sort_order),
      } satisfies EventStory;
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
  const [homeRes, aboutRes, videoRes, siteRes, stylesRes, imageOptions, videoOptions, categoryOptions, ...lists] = await Promise.all([
    supabase.from("home_content").select(`*, hero_image:media_assets!home_content_hero_image_fkey(${MEDIA})`).eq("id", true).single(),
    supabase.from("about_content").select(`*, image:media_assets!about_content_image_fkey(${MEDIA})`).eq("id", true).single(),
    supabase.from("video_story").select(VIDEO_STORY_SELECT).eq("id", true).single(),
    supabase.from("site_settings").select(SITE_SETTINGS_SELECT).eq("id", true).single(),
    supabase.from("page_styles").select("text_styles, section_styles").eq("id", true).single(),
    getImageLibrary(),
    getVideoLibrary(),
    getCategoryOptions(),
    ...collectionKeys.map((key) =>
      supabase.from(collections[key].table).select(selects[key]).order("sort_order").order("created_at"),
    ),
  ]);

  const failed = [homeRes, aboutRes, videoRes, siteRes, stylesRes, ...lists].find((r) => r.error);
  if (failed?.error) {
    console.error("[editor] load failed", { code: failed.error.code });
    return null;
  }

  // Film covers (PostgREST can't embed media_assets in itself): one query,
  // then attached to each film's video as `poster`.
  const filmRows = (lists[collectionKeys.indexOf("films")].data ?? []) as unknown as Row[];
  const posterIds = [
    ...new Set(
      filmRows.flatMap((row) => {
        const id = (row.video as { poster_media_id?: string | null } | null)?.poster_media_id;
        return id ? [id] : [];
      }),
    ),
  ];
  if (posterIds.length) {
    const { data: posterRows } = await supabase.from("media_assets").select(`id, ${MEDIA}`).in("id", posterIds);
    const byId = new Map((posterRows ?? []).map((p) => [p.id as string, p as unknown as Media]));
    for (const row of filmRows) {
      const video = row.video as { poster_media_id?: string | null; poster?: Media } | null;
      if (video?.poster_media_id) video.poster = byId.get(video.poster_media_id) ?? null;
    }
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
      ...collectionKeys.flatMap((key, i) =>
        rowsOf(i).flatMap((row) => [
          ((row.image ?? row.media ?? (row.video as { poster?: Media } | null)?.poster) as Media)?.storage_path,
          ...((row.images as { media: Media }[] | undefined) ?? []).map((i) => i.media?.storage_path),
        ]),
      ),
    ],
    ADMIN_URL_TTL,
  );

  const items = {} as Record<CollectionKey, EditorItemMeta[]>;
  const domain = {} as Record<CollectionKey, unknown[]>;
  const hidden: HomeSectionKey[] = [];
  const sectionOf: Partial<Record<CollectionKey, HomeSectionKey>> = {
    pricing: "pricing",
    films: "video",
    stories: "stories",
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
      demo: row.is_demo === true,
      visibleOnSite: vis[j].visible,
      note: vis[j].note,
      values: collections[key].toValues(row) as Record<string, unknown>,
    }));
    domain[key] = rows.map((row) => toDomain(key, row, urls));
    // Sections that disappear for visitors when nothing in them is shown.
    const section = sectionOf[key];
    if (section && !vis.some((v) => v.visible)) hidden.push(section);
  });

  // Portfolio (feature-first, like the public page) and its categories.
  const galleryRows = rowsOf(collectionKeys.indexOf("gallery"));
  const categoryMap = new Map<string, { label: string; order: number }>();
  for (const row of galleryRows) {
    const c = row.category as { slug: string; label: string; sort_order: number } | null;
    if (c) categoryMap.set(c.slug, { label: c.label, order: c.sort_order });
  }
  const featuredFirst = <T extends { featured: boolean }>(list: T[]) =>
    [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
  domain.gallery = featuredFirst(domain.gallery as GalleryItem[]);
  domain.films = featuredFirst(domain.films as Film[]);
  domain.stories = featuredFirst(domain.stories as EventStory[]);
  items.gallery = featuredFirst(items.gallery);
  items.films = featuredFirst(items.films);
  items.stories = featuredFirst(items.stories);

  return {
    data: {
      saved: {
        home: homeToValues(home),
        about: aboutToValues(about),
        video: videoToValues(video),
        site: siteToValues(siteRes.data as unknown as Row),
      },
      styles: rowToStyles(stylesRes.data),
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
    galleryCategories: [...categoryMap.entries()]
      .sort((a, b) => a[1].order - b[1].order)
      .map(([id, c]) => ({ id, label: c.label })),
    hasFounder: Boolean(about.founder_name),
    hasFounderRole: Boolean(about.founder_role),
  };
}
