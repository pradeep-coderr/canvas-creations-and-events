import type { StaticImageData } from "next/image";

/**
 * Portfolio images. The live list comes from the CMS (`gallery_items` table, via
 * src/lib/content/public.ts). This file keeps the type and the built-in copy
 * used when no database is configured or it can't be reached.
 *
 * Real client photography only — never stock or generated images. Place
 * files in public/images/gallery/ and add entries like:
 *   {
 *     id: "garden-arbour",
 *     src: "/images/gallery/garden-arbour.jpg",
 *     alt: "Blush floral arbour with gold chairs on a lawn",
 *     title: "Garden arbour",
 *     categoryId: "weddings",
 *     featured: true,
 *     order: 1,
 *   }
 */
export interface GalleryItem {
  id: string;
  src: StaticImageData | string;
  /** Describe what is in the photo (the scene and styling). */
  alt: string;
  /** Short caption, shown in the lightbox. */
  title?: string;
  /** Intrinsic size (CMS images), for the lightbox. */
  width?: number;
  height?: number;
  /** References Category.id, for future filtering. */
  categoryId?: string;
  /** Included in the homepage preview. */
  featured: boolean;
  order: number;
}

export const galleryItems: GalleryItem[] = [];

/** The homepage preview shows up to five featured images. */
export const galleryPreview = galleryItems
  .filter((item) => item.featured)
  .sort((a, b) => a.order - b.order)
  .slice(0, 5);
