/**
 * Kinds of celebrations the studio styles. Used by the homepage category
 * strip and, later, to group gallery items.
 * The live list comes from the CMS (`categories` table, via
 * src/lib/content/public.ts). This file keeps the type and the built-in copy
 * used when no database is configured or it can't be reached.
 *
 * Intentionally empty: no verified list has been provided yet. The strip
 * does not render until at least one category exists. Add entries like:
 *   { id: "weddings", label: "Weddings", order: 1 }
 */
export interface Category {
  /** Stable slug; referenced by GalleryItem.categoryId. */
  id: string;
  label: string;
  order: number;
}

export const categories: Category[] = [];

export const sortedCategories = [...categories].sort(
  (a, b) => a.order - b.order,
);
