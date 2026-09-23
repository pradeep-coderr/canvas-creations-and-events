/**
 * Kinds of celebrations the studio styles. Used by the homepage category
 * strip and, later, to group gallery items. Maps onto a future `categories`
 * table.
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
