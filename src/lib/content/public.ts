import "server-only";
import { cache } from "react";
import { sortedCategories, type Category } from "@/data/categories";
import { sortedFaqs, type FaqItem } from "@/data/faq";
import { galleryPreview, type GalleryItem } from "@/data/gallery";
import { processSection, whyCanvas, type Principle, type ProcessStep } from "@/data/home";
import { featuredServices, type Service } from "@/data/services";
import { featuredTestimonials, type Testimonial } from "@/data/testimonials";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";
import { cmsMediaUrl } from "./media";

/*
 * Public website content from the CMS (Supabase), mapped to the application
 * types the sections already use (src/data/*). Components never see rows,
 * column names or Supabase.
 *
 * Source of truth is the database. The local src/data copy is used only when
 * this deployment has no database configured, or a query fails — so the page
 * always renders. An EMPTY result is a real answer (e.g. every testimonial
 * unpublished) and is never replaced by local data.
 */

type Db = ReturnType<typeof createPublicClient>;

interface MediaRow {
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

// Every public query filters on is_published explicitly as well as through
// RLS, and orders by sort_order then creation for a stable order.

export function getFeaturedServices(): Promise<Service[]> {
  return fromCms(
    "services",
    async (db) => {
      const { data, error } = await db
        .from("services")
        .select("slug, title, summary, sort_order, image:media_assets!services_image_fkey(storage_path, alt)")
        .eq("is_published", true)
        .eq("is_featured", true)
        .order("sort_order")
        .order("created_at")
        .overrideTypes<
          { slug: string; title: string; summary: string; sort_order: number; image: MediaRow | null }[],
          { merge: false }
        >();
      if (error) throw error;
      return data.map((row) => ({
        id: row.slug,
        title: row.title,
        summary: row.summary,
        image: row.image ? { src: cmsMediaUrl(row.image.storage_path), alt: row.image.alt ?? "" } : undefined,
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
          "id, title, sort_order, media:media_assets!gallery_items_media_fkey(storage_path, alt), category:categories(slug)",
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
      return data.flatMap((row) =>
        row.media
          ? [
              {
                id: row.id,
                src: cmsMediaUrl(row.media.storage_path),
                alt: row.media.alt ?? "",
                title: row.title ?? undefined,
                categoryId: row.category?.slug,
                featured: true,
                order: row.sort_order,
              },
            ]
          : [],
      );
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

/** Every CMS collection the homepage shows, fetched in parallel. */
export const getHomepageCollections = cache(async () => {
  const [services, categories, gallery, testimonials, faqs, processSteps, principles] =
    await Promise.all([
      getFeaturedServices(),
      getCategories(),
      getGalleryPreview(),
      getFeaturedTestimonials(),
      getFaqs(),
      getProcessSteps(),
      getPrinciples(),
    ]);
  return { services, categories, gallery, testimonials, faqs, processSteps, principles };
});
