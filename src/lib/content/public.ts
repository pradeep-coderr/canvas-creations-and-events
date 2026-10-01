import "server-only";
import { cache } from "react";
import { sortedCategories, type Category } from "@/data/categories";
import { sortedFaqs, type FaqItem } from "@/data/faq";
import { films as localFilms, type Film } from "@/data/films";
import { galleryPreview, type GalleryItem } from "@/data/gallery";
import { pricingPackages, type PricingPackage } from "@/data/pricing";
import { eventStories, type EventStory, type StoryImage } from "@/data/stories";
import type { PublicReview } from "@/lib/review";
import {
  about,
  categoriesSection,
  contactSection,
  enquirySection,
  faqSection,
  gallerySection,
  hero,
  intro,
  pricingSection,
  processSection,
  reviewsSection,
  storiesSection,
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
  type PricingCopy,
  type Principle,
  type StoriesCopy,
  type ProcessCopy,
  type ProcessStep,
  type ReviewsCopy,
  type ServicesCopy,
  type TestimonialsCopy,
  type VideoStoryCopy,
  type WhyCanvasCopy,
} from "@/data/home";
import { featuredServices, type Service } from "@/data/services";
import { featuredTestimonials, type Testimonial } from "@/data/testimonials";
import {
  defaultSiteSettings,
  settingsFromValues,
  SITE_SETTINGS_SELECT,
  siteToValues,
  type SiteSettings,
} from "@/lib/cms/site-settings";
import { emptyPageStyles, rowToStyles, type PageStyles } from "@/lib/styles/schema";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";
import { PUBLIC_URL_TTL, signImagePaths } from "@/lib/media/server";
import { videoAdapters } from "@/lib/media/video-providers";
import type { PriceType } from "@/lib/cms/collections";

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
  credit?: string | null;
  credit_url?: string | null;
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

const MEDIA = "storage_path, alt, width, height, credit, credit_url";

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

/** A photo with its credit (stories and the portfolio show where sample photos came from). */
function toCreditedImage(media: MediaRow | null | undefined, urls: Map<string, string>): StoryImage | null {
  const image = toImage(media, urls);
  if (!image || !media) return null;
  return media.credit ? { ...image, credit: { text: media.credit, href: media.credit_url ?? undefined } } : image;
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

/** The most photos the homepage portfolio shows. */
export const PORTFOLIO_LIMIT = 24;

/** A category that has photos in the portfolio (for the optional filter). */
export interface PortfolioCategory {
  id: string;
  label: string;
}

export interface Portfolio {
  items: GalleryItem[];
  /** Published categories that have at least one photo shown, in their order. */
  categories: PortfolioCategory[];
}

/**
 * The homepage portfolio: published photos, featured ones first (the first
 * is the large lead image), then by the chosen order.
 */
export function getPortfolio(): Promise<Portfolio> {
  return fromCms<Portfolio>(
    "gallery",
    async (db) => {
      const { data, error } = await db
        .from("gallery_items")
        .select(
          `id, title, sort_order, is_featured, is_demo, media:media_assets!gallery_items_media_fkey(${MEDIA}), category:categories(slug, label, sort_order)`,
        )
        .eq("is_published", true)
        .order("is_featured", { ascending: false })
        .order("sort_order")
        .order("created_at")
        .limit(PORTFOLIO_LIMIT)
        .overrideTypes<
          {
            id: string;
            title: string | null;
            sort_order: number;
            is_featured: boolean;
            is_demo: boolean;
            media: MediaRow | null;
            // null when the category is unpublished (RLS) or unset.
            category: { slug: string; label: string; sort_order: number } | null;
          }[],
          { merge: false }
        >();
      if (error) throw error;
      const urls = await signed(db, data.map((row) => row.media));
      // An item whose photo can't be shown is left out rather than rendered broken.
      const shown = data.flatMap((row) => {
        const image = toCreditedImage(row.media, urls);
        return image ? [{ row, image }] : [];
      });
      const categories = new Map<string, { label: string; order: number }>();
      for (const { row } of shown) {
        if (row.category) categories.set(row.category.slug, { label: row.category.label, order: row.category.sort_order });
      }
      return {
        items: shown.map(({ row, image }) => ({
          id: row.id,
          ...image,
          title: row.title ?? undefined,
          categoryId: row.category?.slug,
          featured: row.is_featured,
          order: row.sort_order,
          isDemo: row.is_demo,
        })),
        categories: [...categories.entries()]
          .sort((a, b) => a[1].order - b[1].order)
          .map(([id, c]) => ({ id, label: c.label })),
      };
    },
    { items: galleryPreview, categories: [] },
  );
}

/** Published event stories: featured first, then by the chosen order. */
export function getEventStories(): Promise<EventStory[]> {
  return fromCms(
    "event stories",
    async (db) => {
      const { data, error } = await db
        .from("event_stories")
        .select(
          `id, title, description, location, styling, is_demo, is_featured, sort_order, category:categories(label), image:media_assets!event_stories_image_fkey(${MEDIA}), images:event_story_images(sort_order, media:media_assets!event_story_images_media_fkey(${MEDIA})), testimonial:testimonials(quote, author_name, event_type)`,
        )
        .eq("is_published", true)
        .order("is_featured", { ascending: false })
        .order("sort_order")
        .order("created_at")
        .overrideTypes<
          {
            id: string;
            title: string;
            description: string;
            location: string | null;
            styling: string[] | null;
            is_demo: boolean;
            is_featured: boolean;
            sort_order: number;
            // null when the category is unpublished (RLS) or unset.
            category: { label: string } | null;
            image: MediaRow | null;
            images: { sort_order: number; media: MediaRow | null }[];
            // null unless a PUBLISHED testimonial is attached (RLS).
            testimonial: { quote: string; author_name: string; event_type: string | null } | null;
          }[],
          { merge: false }
        >();
      if (error) throw error;
      const urls = await signed(db, data.flatMap((row) => [row.image, ...row.images.map((i) => i.media)]));
      return data.flatMap((row) => {
        const image = toCreditedImage(row.image, urls);
        // A story without its main photo isn't shown rather than rendered broken.
        if (!image) return [];
        return [
          {
            id: row.id,
            title: row.title,
            description: row.description,
            category: row.category?.label,
            image,
            gallery: row.images
              .toSorted((a, b) => a.sort_order - b.sort_order)
              .flatMap((i) => {
                const img = toCreditedImage(i.media, urls);
                return img ? [img] : [];
              }),
            location: row.location ?? undefined,
            styling: row.styling ?? [],
            testimonial: row.testimonial
              ? { quote: row.testimonial.quote, name: row.testimonial.author_name, eventType: row.testimonial.event_type ?? undefined }
              : undefined,
            isDemo: row.is_demo,
            featured: row.is_featured,
            order: row.sort_order,
          },
        ];
      });
    },
    eventStories,
  );
}

export function getPricingPackages(): Promise<PricingPackage[]> {
  return fromCms(
    "pricing",
    async (db) => {
      const { data, error } = await db
        .from("pricing_packages")
        .select("id, title, description, price_type, price, price_prefix, price_suffix, features, cta_label, is_featured, sort_order")
        .eq("is_published", true)
        .order("sort_order")
        .order("created_at")
        .overrideTypes<
          {
            id: string;
            title: string;
            description: string | null;
            price_type: PriceType;
            price: number | string | null;
            price_prefix: string | null;
            price_suffix: string | null;
            features: string[] | null;
            cta_label: string | null;
            is_featured: boolean;
            sort_order: number;
          }[],
          { merge: false }
        >();
      if (error) throw error;
      return data.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description ?? undefined,
        priceType: row.price_type,
        price: row.price === null ? null : Number(row.price),
        pricePrefix: row.price_prefix ?? undefined,
        priceSuffix: row.price_suffix ?? undefined,
        features: row.features ?? [],
        ctaLabel: row.cta_label ?? undefined,
        featured: row.is_featured,
        order: row.sort_order,
      }));
    },
    pricingPackages,
  );
}

export function getFilms(): Promise<Film[]> {
  return fromCms(
    "films",
    async (db) => {
      const { data, error } = await db
        .from("films")
        .select(
          "id, title, caption, is_featured, sort_order, video:media_assets!films_video_fkey(provider, external_id, poster_media_id)",
        )
        .eq("is_published", true)
        .order("is_featured", { ascending: false })
        .order("sort_order")
        .order("created_at")
        .overrideTypes<
          {
            id: string;
            title: string;
            caption: string | null;
            is_featured: boolean;
            sort_order: number;
            video: { provider: "youtube" | "vimeo"; external_id: string; poster_media_id: string | null } | null;
          }[],
          { merge: false }
        >();
      if (error) throw error;
      // Covers in a second query (PostgREST can't embed media_assets in itself).
      const posterIds = [...new Set(data.flatMap((row) => (row.video?.poster_media_id ? [row.video.poster_media_id] : [])))];
      const posters = new Map<string, MediaRow>();
      if (posterIds.length) {
        const res = await db
          .from("media_assets")
          .select(`id, ${MEDIA}`)
          .in("id", posterIds)
          .overrideTypes<(MediaRow & { id: string })[], { merge: false }>();
        if (res.error) throw res.error;
        for (const p of res.data) posters.set(p.id, p);
      }
      const posterOf = (id: string | null | undefined) => (id ? posters.get(id) : undefined);
      const urls = await signed(db, data.map((row) => posterOf(row.video?.poster_media_id)));
      return data.flatMap((row) => {
        const playerUrl = row.video ? videoAdapters[row.video.provider].playerUrl(row.video.external_id) : null;
        if (!row.video || !playerUrl) return [];
        const poster = toImage(posterOf(row.video.poster_media_id), urls);
        return [
          {
            id: row.id,
            provider: row.video.provider,
            title: row.title,
            caption: row.caption ?? undefined,
            playerUrl,
            poster: poster ? { src: poster.src, alt: poster.alt } : null,
            featured: row.is_featured,
            order: row.sort_order,
          },
        ];
      });
    },
    localFilms,
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

/** How many approved reviews the homepage shows (newest first). */
export const REVIEWS_LIMIT = 6;

/**
 * Approved reviews, newest first. Public columns only (the anon role can't
 * read emails, or anything not approved). Empty without a database.
 */
export function getApprovedReviews(): Promise<PublicReview[]> {
  return fromCms(
    "reviews",
    async (db) => {
      const { data, error } = await db
        .from("reviews")
        .select("id, name, event_type, rating, message")
        .eq("status", "approved")
        .order("approved_at", { ascending: false })
        .limit(REVIEWS_LIMIT)
        .overrideTypes<{ id: string; name: string; event_type: string | null; rating: number; message: string }[], { merge: false }>();
      if (error) throw error;
      return data.map((row) => ({
        id: row.id,
        name: row.name,
        eventType: row.event_type,
        rating: row.rating,
        message: row.message,
      }));
    },
    [],
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
  pricing: PricingCopy;
  stories: StoriesCopy;
  gallery: GalleryCopy;
  process: ProcessCopy;
  whyCanvas: WhyCanvasCopy;
  testimonials: TestimonialsCopy;
  reviews: ReviewsCopy;
  faq: FaqCopy;
  enquiry: EnquiryCopy;
  contact: ContactCopy;
}

const localHomeCopy: HomeCopy = {
  hero,
  intro,
  services: servicesSection,
  categories: categoriesSection,
  pricing: pricingSection,
  stories: storiesSection,
  gallery: gallerySection,
  process: processSection,
  whyCanvas,
  testimonials: testimonialsSection,
  reviews: reviewsSection,
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
  gallery_intro: string | null;
  gallery_filter_all: string;
  pricing_eyebrow: string;
  pricing_title: string;
  pricing_description: string | null;
  stories_eyebrow: string;
  stories_title: string;
  sample_notice: string;
  process_eyebrow: string;
  process_title: string;
  why_eyebrow: string;
  why_title_lines: string[];
  testimonials_eyebrow: string;
  testimonials_title: string;
  reviews_eyebrow: string;
  reviews_title: string;
  reviews_description: string;
  reviews_empty_text: string;
  reviews_cta_label: string;
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
        pricing: { eyebrow: r.pricing_eyebrow, title: r.pricing_title, description: r.pricing_description },
        stories: { eyebrow: r.stories_eyebrow, title: r.stories_title, sampleNotice: r.sample_notice },
        gallery: {
          eyebrow: r.gallery_eyebrow,
          title: r.gallery_title,
          emptyTitle: r.gallery_empty_title,
          emptyText: r.gallery_empty_text,
          instagramCta: r.gallery_instagram_cta,
          intro: r.gallery_intro,
          filterAll: r.gallery_filter_all,
        },
        process: { eyebrow: r.process_eyebrow, title: r.process_title },
        whyCanvas: { eyebrow: r.why_eyebrow, titleLines: r.why_title_lines },
        testimonials: { eyebrow: r.testimonials_eyebrow, title: r.testimonials_title },
        reviews: {
          eyebrow: r.reviews_eyebrow,
          title: r.reviews_title,
          description: r.reviews_description,
          emptyText: r.reviews_empty_text,
          ctaLabel: r.reviews_cta_label,
        },
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

/** The Films section's wording (the videos are the films list). */
export function getVideoCopy(): Promise<VideoStoryCopy> {
  return fromCms<VideoStoryCopy>(
    "video section",
    async (db) => {
      const { data, error } = await db.from("video_story").select("eyebrow, title, empty_text, tiktok_cta").eq("id", true).single();
      if (error) throw error;
      const r = data as { eyebrow: string; title: string; empty_text: string; tiktok_cta: string };
      return { eyebrow: r.eyebrow, title: r.title, emptyText: r.empty_text, tiktokCta: r.tiktok_cta };
    },
    { eyebrow: videoStory.eyebrow, title: videoStory.title, emptyText: videoStory.emptyText, tiktokCta: videoStory.tiktokCta },
  );
}

/** Everything the homepage shows from the CMS, fetched in parallel. */
export const getHomepageContent = cache(async () => {
  const [services, categories, portfolio, stories, pricing, films, testimonials, reviews, faqs, processSteps, principles, copy, aboutCopy, videoCopy, settings, styles] =
    await Promise.all([
      getFeaturedServices(),
      getCategories(),
      getPortfolio(),
      getEventStories(),
      getPricingPackages(),
      getFilms(),
      getFeaturedTestimonials(),
      getApprovedReviews(),
      getFaqs(),
      getProcessSteps(),
      getPrinciples(),
      getHomeCopy(),
      getAboutCopy(),
      getVideoCopy(),
      getSiteSettings(),
      getPageStyles(),
    ]);
  return {
    services,
    categories,
    gallery: portfolio.items,
    galleryCategories: portfolio.categories,
    stories,
    pricing,
    films,
    testimonials,
    reviews,
    faqs,
    processSteps,
    principles,
    copy,
    about: aboutCopy,
    video: { copy: videoCopy },
    settings,
    sectionStyles: styles.sections,
  };
});

/**
 * Site details (headline, navigation/button labels, contact details, social
 * links, footer tagline, enquiry form wording). Loaded once per render and
 * passed down as props; falls back to src/data/site.ts.
 */
export const getSiteSettings = cache(() =>
  fromCms<SiteSettings>(
    "site details",
    async (db) => {
      const { data, error } = await db.from("site_settings").select(SITE_SETTINGS_SELECT).eq("id", true).single();
      if (error) throw error;
      return settingsFromValues(siteToValues(data as unknown as Record<string, unknown>));
    },
    defaultSiteSettings,
  ),
);

/**
 * Whether the optional sections have published content (menu links to
 * Pricing and Films appear only then). Counts only: no rows are read.
 */
export const getSectionAvailability = cache(async () => {
  const count = (table: "pricing_packages" | "films") =>
    fromCms(
      table,
      async (db) => {
        const { count, error } = await db.from(table).select("id", { count: "exact", head: true }).eq("is_published", true);
        if (error) throw error;
        return (count ?? 0) > 0;
      },
      false,
    );
  const [pricing, films] = await Promise.all([count("pricing_packages"), count("films")]);
  return { pricing, films };
});

/** Style presets (text and section styles) set in the visual editor. */
export const getPageStyles = cache(() =>
  fromCms<PageStyles>(
    "page styles",
    async (db) => {
      const { data, error } = await db.from("page_styles").select("text_styles, section_styles").eq("id", true).single();
      if (error) throw error;
      return rowToStyles(data);
    },
    emptyPageStyles,
  ),
);
