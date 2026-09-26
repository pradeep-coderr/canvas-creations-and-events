import "server-only";
import { cache } from "react";
import { sortedCategories, type Category } from "@/data/categories";
import { sortedFaqs, type FaqItem } from "@/data/faq";
import { galleryPreview, type GalleryItem } from "@/data/gallery";
import {
  about,
  categoriesSection,
  contactSection,
  enquirySection,
  faqSection,
  gallerySection,
  hero,
  intro,
  processSection,
  servicesSection,
  testimonialsSection,
  videoStory,
  whyCanvas,
  type AboutCopy,
  type CategoriesCopy,
  type ContactCopy,
  type EnquiryCopy,
  type FaqCopy,
  type GalleryCopy,
  type HeroCopy,
  type IntroCopy,
  type Principle,
  type ProcessCopy,
  type ProcessStep,
  type ServicesCopy,
  type TestimonialsCopy,
  type VideoContent,
  type VideoStoryCopy,
  type WhyCanvasCopy,
} from "@/data/home";
import { featuredServices, type Service } from "@/data/services";
import { featuredTestimonials, type Testimonial } from "@/data/testimonials";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";
import { PUBLIC_URL_TTL, signImagePaths } from "@/lib/media/server";
import { videoAdapters } from "@/lib/media/video-providers";
import type { VideoProvider } from "@/lib/media/types";

/*
 * Public website content from the CMS (Supabase), mapped to the application
 * types the sections already use (src/data/*). Components never see rows,
 * column names or Supabase.
 *
 * Source of truth is the database. The local src/data copy is used only when
 * this deployment has no database configured, or a query fails — so the page
 * always renders. An EMPTY result is a real answer (e.g. every testimonial
 * unpublished) and is never replaced by local data.
 *
 * Images come from the private cms-media bucket as signed URLs. They are
 * signed with this anonymous client, and Storage RLS lets it sign only
 * images used by published content — a draft's photo can't leak here.
 */

type Db = ReturnType<typeof createPublicClient>;

interface MediaRow {
  width: number | null;
  height: number | null;
  storage_path: string;
  alt: string | null;
}

async function fromCms<T>(label: string, query: (db: Db) => Promise<T>, fallback: T): Promise<T> {
  if (!isSupabaseConfigured()) return fallback;
  try {
    return await query(createPublicClient());
  } catch (error) {
    // Server log only. PostgREST errors carry a code; network failures only a message.
    const { code, message } = (error ?? {}) as { code?: string; message?: string };
    console.error(`[content] ${label} could not be loaded; using the built-in copy`, {
      code: code || undefined,
      message: message?.slice(0, 200),
    });
    return fallback;
  }
}

const MEDIA = "storage_path, alt, width, height";

/** Signed URLs for these media rows (public pages: long-lived, see PUBLIC_URL_TTL). */
async function signed(db: Db, media: (MediaRow | null | undefined)[]) {
  return signImagePaths(db, media.map((m) => m?.storage_path), PUBLIC_URL_TTL);
}

/** A CMS image ready for next/image, or null if it can't be shown. */
function toImage(media: MediaRow | null | undefined, urls: Map<string, string>) {
  const src = media && urls.get(media.storage_path);
  if (!media || !src) return null;
  return { src, alt: media.alt ?? "", width: media.width ?? undefined, height: media.height ?? undefined };
}

// Every public query filters on is_published explicitly as well as through
// RLS, and orders by sort_order then creation for a stable order.

export function getFeaturedServices(): Promise<Service[]> {
  return fromCms(
    "services",
    async (db) => {
      const { data, error } = await db
        .from("services")
        .select(`slug, title, summary, sort_order, image:media_assets!services_image_fkey(${MEDIA})`)
        .eq("is_published", true)
        .eq("is_featured", true)
        .order("sort_order")
        .order("created_at")
        .overrideTypes<
          { slug: string; title: string; summary: string; sort_order: number; image: MediaRow | null }[],
          { merge: false }
        >();
      if (error) throw error;
      const urls = await signed(db, data.map((row) => row.image));
      return data.map((row) => ({
        id: row.slug,
        title: row.title,
        summary: row.summary,
        image: toImage(row.image, urls) ?? undefined,
        order: row.sort_order,
        featured: true,
      }));
    },
    featuredServices,
  );
}

export function getCategories(): Promise<Category[]> {
  return fromCms(
    "categories",
    async (db) => {
      const { data, error } = await db
        .from("categories")
        .select("slug, label, sort_order")
        .eq("is_published", true)
        .order("sort_order")
        .order("created_at")
        .overrideTypes<{ slug: string; label: string; sort_order: number }[], { merge: false }>();
      if (error) throw error;
      return data.map((row) => ({ id: row.slug, label: row.label, order: row.sort_order }));
    },
    sortedCategories,
  );
}

/** Up to five featured images for the homepage preview. */
export function getGalleryPreview(): Promise<GalleryItem[]> {
  return fromCms(
    "gallery",
    async (db) => {
      const { data, error } = await db
        .from("gallery_items")
        .select(
          `id, title, sort_order, media:media_assets!gallery_items_media_fkey(${MEDIA}), category:categories(slug)`,
        )
        .eq("is_published", true)
        .eq("is_featured", true)
        .order("sort_order")
        .order("created_at")
        .limit(5)
        .overrideTypes<
          {
            id: string;
            title: string | null;
            sort_order: number;
            media: MediaRow | null;
            // null when the category is unpublished (RLS) or unset.
            category: { slug: string } | null;
          }[],
          { merge: false }
        >();
      if (error) throw error;
      const urls = await signed(db, data.map((row) => row.media));
      // An item whose photo can't be shown is left out rather than rendered broken.
      return data.flatMap((row) => {
        const image = toImage(row.media, urls);
        return image
          ? [
              {
                id: row.id,
                ...image,
                title: row.title ?? undefined,
                categoryId: row.category?.slug,
                featured: true,
                order: row.sort_order,
              },
            ]
          : [];
      });
    },
    galleryPreview,
  );
}

/** Up to three featured testimonials. */
export function getFeaturedTestimonials(): Promise<Testimonial[]> {
  return fromCms(
    "testimonials",
    async (db) => {
      const { data, error } = await db
        .from("testimonials")
        .select("id, quote, author_name, event_type, sort_order")
        .eq("is_published", true)
        .eq("is_featured", true)
        .order("sort_order")
        .order("created_at")
        .limit(3)
        .overrideTypes<
          { id: string; quote: string; author_name: string; event_type: string | null; sort_order: number }[],
          { merge: false }
        >();
      if (error) throw error;
      return data.map((row) => ({
        id: row.id,
        quote: row.quote,
        name: row.author_name,
        eventType: row.event_type ?? undefined,
        featured: true,
        order: row.sort_order,
      }));
    },
    featuredTestimonials,
  );
}

export function getFaqs(): Promise<FaqItem[]> {
  return fromCms(
    "faqs",
    async (db) => {
      const { data, error } = await db
        .from("faqs")
        .select("id, question, answer, action_label, action_href, sort_order")
        .eq("is_published", true)
        .order("sort_order")
        .order("created_at")
        .overrideTypes<
          {
            id: string;
            question: string;
            answer: string;
            action_label: string | null;
            action_href: string | null;
            sort_order: number;
          }[],
          { merge: false }
        >();
      if (error) throw error;
      return data.map((row) => ({
        id: row.id,
        question: row.question,
        answer: row.answer,
        action:
          row.action_label && row.action_href
            ? { label: row.action_label, href: row.action_href }
            : undefined,
        order: row.sort_order,
      }));
    },
    sortedFaqs,
  );
}

type StepRow = { id: string; title: string; description: string };

function getSteps(table: "process_steps" | "principles", fallback: StepRow[]) {
  return fromCms(
    table,
    async (db) => {
      const { data, error } = await db
        .from(table)
        .select("id, title, description")
        .eq("is_published", true)
        .order("sort_order")
        .order("created_at")
        .overrideTypes<StepRow[], { merge: false }>();
      if (error) throw error;
      return data;
    },
    fallback,
  );
}

export function getProcessSteps(): Promise<ProcessStep[]> {
  return getSteps("process_steps", processSection.steps);
}

export function getPrinciples(): Promise<Principle[]> {
  return getSteps("principles", whyCanvas.principles);
}

// ---------------------------------------------------------------------------
// Section copy (one-row tables). Links, behaviour and system messages stay
// in code: the hero and About link targets, and the enquiry form's
// "not set up yet" notice.
// ---------------------------------------------------------------------------

export interface HomeCopy {
  hero: HeroCopy;
  intro: IntroCopy;
  services: ServicesCopy;
  categories: CategoriesCopy;
  gallery: GalleryCopy;
  process: ProcessCopy;
  whyCanvas: WhyCanvasCopy;
  testimonials: TestimonialsCopy;
  faq: FaqCopy;
  enquiry: EnquiryCopy;
  contact: ContactCopy;
}

const localHomeCopy: HomeCopy = {
  hero,
  intro,
  services: servicesSection,
  categories: categoriesSection,
  gallery: gallerySection,
  process: processSection,
  whyCanvas,
  testimonials: testimonialsSection,
  faq: faqSection,
  enquiry: enquirySection,
  contact: contactSection,
};

interface HomeRow {
  hero_eyebrow: string;
  hero_description: string;
  hero_secondary_cta_label: string;
  hero_image: MediaRow | null;
  intro_eyebrow: string;
  intro_title: string;
  intro_body: string;
  services_eyebrow: string;
  services_title: string;
  services_description: string;
  services_enquiry_title: string;
  services_enquiry_text: string;
  categories_eyebrow: string;
  categories_title: string;
  gallery_eyebrow: string;
  gallery_title: string;
  gallery_empty_title: string;
  gallery_empty_text: string;
  gallery_instagram_cta: string;
  process_eyebrow: string;
  process_title: string;
  why_eyebrow: string;
  why_title_lines: string[];
  testimonials_eyebrow: string;
  testimonials_title: string;
  faq_eyebrow: string;
  faq_title: string;
  enquiry_eyebrow: string;
  enquiry_title: string;
  enquiry_description: string;
  contact_eyebrow: string;
  contact_title: string;
  contact_description: string;
}


export function getHomeCopy(): Promise<HomeCopy> {
  return fromCms(
    "home content",
    async (db) => {
      const { data, error } = await db
        .from("home_content")
        .select(`*, hero_image:media_assets!home_content_hero_image_fkey(${MEDIA})`)
        .eq("id", true)
        .single();
      if (error) throw error;
      const r = data as unknown as HomeRow;
      const urls = await signed(db, [r.hero_image]);
      return {
        hero: {
          eyebrow: r.hero_eyebrow,
          description: r.hero_description,
          secondaryCta: { label: r.hero_secondary_cta_label, href: hero.secondaryCta.href },
          image: toImage(r.hero_image, urls),
        },
        intro: { eyebrow: r.intro_eyebrow, title: r.intro_title, body: r.intro_body },
        services: {
          eyebrow: r.services_eyebrow,
          title: r.services_title,
          description: r.services_description,
          enquiry: { title: r.services_enquiry_title, text: r.services_enquiry_text },
        },
        categories: { eyebrow: r.categories_eyebrow, title: r.categories_title },
        gallery: {
          eyebrow: r.gallery_eyebrow,
          title: r.gallery_title,
          emptyTitle: r.gallery_empty_title,
          emptyText: r.gallery_empty_text,
          instagramCta: r.gallery_instagram_cta,
        },
        process: { eyebrow: r.process_eyebrow, title: r.process_title },
        whyCanvas: { eyebrow: r.why_eyebrow, titleLines: r.why_title_lines },
        testimonials: { eyebrow: r.testimonials_eyebrow, title: r.testimonials_title },
        faq: { eyebrow: r.faq_eyebrow, title: r.faq_title },
        enquiry: {
          eyebrow: r.enquiry_eyebrow,
          title: r.enquiry_title,
          description: r.enquiry_description,
          offlineNotice: enquirySection.offlineNotice,
        },
        contact: { eyebrow: r.contact_eyebrow, title: r.contact_title, description: r.contact_description },
      };
    },
    localHomeCopy,
  );
}

export function getAboutCopy(): Promise<AboutCopy> {
  return fromCms(
    "about content",
    async (db) => {
      const { data, error } = await db
        .from("about_content")
        .select(
          `eyebrow, title, body, founder_name, founder_role, cta_label, image:media_assets!about_content_image_fkey(${MEDIA})`,
        )
        .eq("id", true)
        .single();
      if (error) throw error;
      const r = data as unknown as {
        eyebrow: string;
        title: string;
        body: string[];
        founder_name: string | null;
        founder_role: string | null;
        cta_label: string;
        image: MediaRow | null;
      };
      return {
        eyebrow: r.eyebrow,
        title: r.title,
        body: r.body,
        image: toImage(r.image, await signed(db, [r.image])),
        cta: { label: r.cta_label, href: about.cta.href },
        founder: r.founder_name ? { name: r.founder_name, role: r.founder_role ?? undefined } : null,
      };
    },
    about,
  );
}

export interface VideoSection {
  copy: VideoStoryCopy;
  video: VideoContent | null;
}

export function getVideoSection(): Promise<VideoSection> {
  return fromCms<VideoSection>(
    "video section",
    async (db) => {
      const { data, error } = await db
        .from("video_story")
        .select(
          `eyebrow, title, empty_text, tiktok_cta, provider, video_title, caption, media:media_assets!video_story_video_provider_fkey(provider, external_id), poster:media_assets!video_story_poster_fkey(${MEDIA})`,
        )
        .eq("id", true)
        .single();
      if (error) throw error;
      const r = data as unknown as {
        eyebrow: string;
        title: string;
        empty_text: string;
        tiktok_cta: string;
        video_title: string | null;
        caption: string | null;
        media: { provider: VideoProvider; external_id: string } | null;
        poster: MediaRow | null;
      };
      // The provider adapter decides how the video plays; an unconfigured
      // provider (e.g. uploaded video) gives no player and the section keeps
      // its honest empty state.
      const playerUrl = r.media ? videoAdapters[r.media.provider].playerUrl(r.media.external_id) : null;
      const poster = toImage(r.poster, await signed(db, [r.poster]));
      const video: VideoContent | null =
        r.media && playerUrl && r.video_title
          ? {
              provider: r.media.provider,
              title: r.video_title,
              caption: r.caption ?? undefined,
              playerUrl,
              poster: poster ? { src: poster.src, alt: poster.alt } : null,
            }
          : null;
      return {
        copy: { eyebrow: r.eyebrow, title: r.title, emptyText: r.empty_text, tiktokCta: r.tiktok_cta },
        video,
      };
    },
    { copy: videoStory, video: videoStory.video },
  );
}

/** Everything the homepage shows from the CMS, fetched in parallel. */
export const getHomepageContent = cache(async () => {
  const [services, categories, gallery, testimonials, faqs, processSteps, principles, copy, aboutCopy, video] =
    await Promise.all([
      getFeaturedServices(),
      getCategories(),
      getGalleryPreview(),
      getFeaturedTestimonials(),
      getFaqs(),
      getProcessSteps(),
      getPrinciples(),
      getHomeCopy(),
      getAboutCopy(),
      getVideoSection(),
    ]);
  return { services, categories, gallery, testimonials, faqs, processSteps, principles, copy, about: aboutCopy, video };
});
