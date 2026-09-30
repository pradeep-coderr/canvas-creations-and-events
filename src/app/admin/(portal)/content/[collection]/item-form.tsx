import {
  CategoryForm,
  FaqForm,
  FilmForm,
  GalleryItemForm,
  PricingForm,
  ServiceForm,
  StepForm,
  TestimonialForm,
} from "@/components/admin/collection-forms";
import { getCategoryOptions, getImageLibrary, getVideoLibrary } from "@/lib/admin/cms";
import { collections, type CollectionKey, type CollectionValues } from "@/lib/cms/collections";

/**
 * Picks the content-specific form for a collection and loads the options
 * it needs (library photos, categories). Used by the create and edit pages.
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
      return <ServiceForm {...common} defaultValues={values("services")} imageOptions={await getImageLibrary()} />;
    case "pricing":
      return <PricingForm {...common} defaultValues={values("pricing")} />;
    case "films":
      return <FilmForm {...common} defaultValues={values("films")} videoOptions={await getVideoLibrary()} />;
    case "categories":
      return <CategoryForm {...common} defaultValues={values("categories")} />;
    case "gallery": {
      // Photos can be uploaded from the photo picker, so a gallery item can
      // always be created.
      const [imageOptions, categoryOptions] = await Promise.all([getImageLibrary(), getCategoryOptions()]);
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
