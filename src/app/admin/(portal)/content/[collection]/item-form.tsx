import {
  CategoryForm,
  FaqForm,
  GalleryItemForm,
  NO_PHOTOS_HINT,
  ServiceForm,
  StepForm,
  TestimonialForm,
} from "@/components/admin/collection-forms";
import { getCategoryOptions, getMediaOptions } from "@/lib/admin/cms";
import { collections, type CollectionKey, type CollectionValues } from "@/lib/cms/collections";

/**
 * Picks the content-specific form for a collection and loads the options
 * it needs (photos, categories). Used by the create and edit pages.
 */
export async function ItemForm({
  collection,
  id,
  row,
  initialMessage,
}: {
  collection: CollectionKey;
  /** null when creating. */
  id: string | null;
  /** The existing row, or column defaults for a new item. */
  row: Record<string, unknown>;
  initialMessage?: string;
}) {
  const common = { id, initialMessage };
  const values = <K extends CollectionKey>(key: K) =>
    (collections[key].toValues as (r: Record<string, unknown>) => CollectionValues<K>)(row);

  switch (collection) {
    case "services":
      return <ServiceForm {...common} defaultValues={values("services")} imageOptions={await getMediaOptions("image")} />;
    case "categories":
      return <CategoryForm {...common} defaultValues={values("categories")} />;
    case "gallery": {
      const [imageOptions, categoryOptions] = await Promise.all([getMediaOptions("image"), getCategoryOptions()]);
      if (imageOptions.length === 0) {
        return <p className="bg-background p-6 text-muted-foreground sm:p-8">{NO_PHOTOS_HINT}</p>;
      }
      return (
        <GalleryItemForm
          {...common}
          defaultValues={values("gallery")}
          imageOptions={imageOptions}
          categoryOptions={categoryOptions}
        />
      );
    }
    case "testimonials":
      return <TestimonialForm {...common} defaultValues={values("testimonials")} />;
    case "faqs":
      return <FaqForm {...common} defaultValues={values("faqs")} />;
    case "process":
    case "principles":
      return <StepForm {...common} collection={collection} defaultValues={values(collection)} />;
  }
}
