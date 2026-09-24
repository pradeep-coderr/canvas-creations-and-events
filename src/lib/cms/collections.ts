import { z } from "zod";
import {
  line,
  optionalHref,
  optionalId,
  optionalLine,
  requiredId,
  slug,
  sortOrder,
  text,
} from "./fields";

/*
 * The CMS collections: labels for the admin, one Zod schema per collection
 * (mirrors the table's columns and constraints) and the mapping between
 * form values (camelCase) and table rows (snake_case). Shared by the admin
 * pages, forms and server actions; no database access here.
 */

export const collectionKeys = [
  "services",
  "categories",
  "gallery",
  "testimonials",
  "faqs",
  "process",
  "principles",
] as const;

export type CollectionKey = (typeof collectionKeys)[number];

export function isCollectionKey(value: string): value is CollectionKey {
  return (collectionKeys as readonly string[]).includes(value);
}

type Row = Record<string, unknown>;

const str = (v: unknown) => (typeof v === "string" ? v : "");
const num = (v: unknown) => (typeof v === "number" ? v : 0);

// Columns every collection shares.
const visibility = { isPublished: z.boolean(), sortOrder: sortOrder() };
const visibilityRow = (v: { isPublished: boolean; sortOrder: number }) => ({
  is_published: v.isPublished,
  sort_order: v.sortOrder,
});
const visibilityValues = (row: Row) => ({
  isPublished: row.is_published === true,
  sortOrder: num(row.sort_order),
});

export const serviceSchema = z.object({
  title: line(),
  slug: slug(),
  summary: text(),
  imageId: optionalId(),
  isFeatured: z.boolean(),
  ...visibility,
});

export const categorySchema = z.object({
  label: line(),
  slug: slug(),
  ...visibility,
});

export const galleryItemSchema = z.object({
  mediaId: requiredId("Choose a photo."),
  title: optionalLine(),
  categoryId: optionalId(),
  isFeatured: z.boolean(),
  ...visibility,
});

export const testimonialSchema = z.object({
  quote: text(),
  authorName: line(),
  eventType: optionalLine(),
  isFeatured: z.boolean(),
  ...visibility,
});

export const faqSchema = z
  .object({
    question: line(),
    answer: text(),
    actionLabel: optionalLine(),
    actionHref: optionalHref(),
    ...visibility,
  })
  // Same rule as faqs_action_check: a link needs both parts.
  .superRefine((v, ctx) => {
    if (v.actionLabel && !v.actionHref)
      ctx.addIssue({ code: "custom", path: ["actionHref"], message: "Add the link, or clear the link text." });
    if (v.actionHref && !v.actionLabel)
      ctx.addIssue({ code: "custom", path: ["actionLabel"], message: "Add the link text, or clear the link." });
  });

/** Process steps and principles share one shape. */
export const stepSchema = z.object({
  title: line(),
  description: text(),
  ...visibility,
});

interface CollectionDef<S extends z.ZodType> {
  table: string;
  /** Plural, for headings: "Services". */
  title: string;
  /** Singular, lowercase, for buttons and messages: "service". */
  singular: string;
  /** Plural, lowercase, for sentences: "gallery items". */
  plural: string;
  description: string;
  /** Has a separate "featured on the homepage" flag. */
  featured: boolean;
  /** Columns for the admin list. */
  listSelect: string;
  schema: S;
  toRow: (values: z.output<S>) => Row;
  toValues: (row: Row) => z.input<S>;
  /** Human-readable name of a row (lists, dialogs, messages). */
  label: (row: Row) => string;
  /** Secondary line in the list, if any. */
  detail?: (row: Row) => string | null;
}

function define<S extends z.ZodType>(def: CollectionDef<S>) {
  return def;
}

const excerpt = (value: unknown, max = 90) => {
  const s = str(value).replace(/\s+/g, " ").trim();
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
};

export const collections = {
  services: define({
    table: "services",
    title: "Services",
    singular: "service",
    plural: "services",
    description: "What you offer. Featured services are listed on the homepage.",
    featured: true,
    listSelect: "id, title, summary, is_published, is_featured, sort_order, created_at",
    schema: serviceSchema,
    toRow: (v) => ({
      title: v.title,
      slug: v.slug,
      summary: v.summary,
      image_id: v.imageId,
      is_featured: v.isFeatured,
      ...visibilityRow(v),
    }),
    toValues: (row) => ({
      title: str(row.title),
      slug: str(row.slug),
      summary: str(row.summary),
      imageId: str(row.image_id),
      isFeatured: row.is_featured === true,
      ...visibilityValues(row),
    }),
    label: (row) => str(row.title),
    detail: (row) => excerpt(row.summary),
  }),
  categories: define({
    table: "categories",
    title: "Categories",
    singular: "category",
    plural: "categories",
    description: "Kinds of celebrations you style, shown as a list on the homepage and used to group gallery photos.",
    featured: false,
    listSelect: "id, label, slug, is_published, sort_order, created_at",
    schema: categorySchema,
    toRow: (v) => ({ label: v.label, slug: v.slug, ...visibilityRow(v) }),
    toValues: (row) => ({ label: str(row.label), slug: str(row.slug), ...visibilityValues(row) }),
    label: (row) => str(row.label),
  }),
  gallery: define({
    table: "gallery_items",
    title: "Gallery",
    singular: "gallery item",
    plural: "gallery items",
    description: "Photos of your work. Up to five featured photos appear on the homepage.",
    featured: true,
    listSelect:
      "id, title, is_published, is_featured, sort_order, created_at, media:media_assets!gallery_items_media_fkey(alt, storage_path), category:categories(label)",
    schema: galleryItemSchema,
    toRow: (v) => ({
      media_id: v.mediaId,
      title: v.title,
      category_id: v.categoryId,
      is_featured: v.isFeatured,
      ...visibilityRow(v),
    }),
    toValues: (row) => ({
      mediaId: str(row.media_id),
      title: str(row.title),
      categoryId: str(row.category_id),
      isFeatured: row.is_featured === true,
      ...visibilityValues(row),
    }),
    label: (row) => {
      const media = row.media as { alt?: string | null } | null | undefined;
      return str(row.title) || str(media?.alt) || "Untitled photo";
    },
    detail: (row) => {
      const category = row.category as { label?: string } | null | undefined;
      return category?.label ? `Category: ${category.label}` : null;
    },
  }),
  testimonials: define({
    table: "testimonials",
    title: "Testimonials",
    singular: "testimonial",
    plural: "testimonials",
    description: "Real, client-approved words only. Up to three featured testimonials appear on the homepage.",
    featured: true,
    listSelect: "id, author_name, event_type, quote, is_published, is_featured, sort_order, created_at",
    schema: testimonialSchema,
    toRow: (v) => ({
      quote: v.quote,
      author_name: v.authorName,
      event_type: v.eventType,
      is_featured: v.isFeatured,
      ...visibilityRow(v),
    }),
    toValues: (row) => ({
      quote: str(row.quote),
      authorName: str(row.author_name),
      eventType: str(row.event_type),
      isFeatured: row.is_featured === true,
      ...visibilityValues(row),
    }),
    label: (row) => str(row.author_name),
    detail: (row) => excerpt(row.quote),
  }),
  faqs: define({
    table: "faqs",
    title: "FAQs",
    singular: "FAQ",
    plural: "FAQs",
    description: "Questions and answers in the FAQ section.",
    featured: false,
    listSelect: "id, question, answer, is_published, sort_order, created_at",
    schema: faqSchema,
    toRow: (v) => ({
      question: v.question,
      answer: v.answer,
      action_label: v.actionLabel,
      action_href: v.actionHref,
      ...visibilityRow(v),
    }),
    toValues: (row) => ({
      question: str(row.question),
      answer: str(row.answer),
      actionLabel: str(row.action_label),
      actionHref: str(row.action_href),
      ...visibilityValues(row),
    }),
    label: (row) => str(row.question),
    detail: (row) => excerpt(row.answer),
  }),
  process: define({
    table: "process_steps",
    title: "Process",
    singular: "step",
    plural: "steps",
    description: "The steps of working with you, numbered in this order on the homepage.",
    featured: false,
    listSelect: "id, title, description, is_published, sort_order, created_at",
    schema: stepSchema,
    toRow: (v) => ({ title: v.title, description: v.description, ...visibilityRow(v) }),
    toValues: (row) => ({ title: str(row.title), description: str(row.description), ...visibilityValues(row) }),
    label: (row) => str(row.title),
    detail: (row) => excerpt(row.description),
  }),
  principles: define({
    table: "principles",
    title: "Why Canvas",
    singular: "principle",
    plural: "principles",
    description: "The principles in the “Why Canvas” section.",
    featured: false,
    listSelect: "id, title, description, is_published, sort_order, created_at",
    schema: stepSchema,
    toRow: (v) => ({ title: v.title, description: v.description, ...visibilityRow(v) }),
    toValues: (row) => ({ title: str(row.title), description: str(row.description), ...visibilityValues(row) }),
    label: (row) => str(row.title),
    detail: (row) => excerpt(row.description),
  }),
};

export type Collections = typeof collections;
export type CollectionValues<K extends CollectionKey> = z.input<Collections[K]["schema"]>;
export type CollectionOutput<K extends CollectionKey> = z.output<Collections[K]["schema"]>;

/** A collection's schema, typed for that collection (indexing with a generic key widens to a union). */
export const collectionSchema = <K extends CollectionKey>(key: K) =>
  collections[key].schema as unknown as z.ZodType<CollectionOutput<K>, CollectionValues<K>>;

/** Capitalised singular for headings and messages: "Service", "FAQ". */
export function singularTitle(key: CollectionKey) {
  const s = collections[key].singular;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** A media file offered in pickers. */
export interface MediaOption {
  id: string;
  label: string;
}

/** A category offered in the gallery form. */
export interface CategoryOption {
  id: string;
  label: string;
  isPublished: boolean;
}
