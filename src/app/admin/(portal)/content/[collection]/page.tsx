import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/admin/back-link";
import { CollectionList, type ListItem } from "@/components/admin/collection-list";
import { NO_PHOTOS_HINT } from "@/components/admin/collection-forms";
import { getMediaOptions, listCollection } from "@/lib/admin/cms";
import { requireAdmin } from "@/lib/admin/session";
import { collections, isCollectionKey } from "@/lib/cms/collections";

export async function generateMetadata({ params }: PageProps<"/admin/content/[collection]">): Promise<Metadata> {
  const { collection } = await params;
  return { title: isCollectionKey(collection) ? collections[collection].title : "Not found" };
}

export default async function CollectionPage({ params }: PageProps<"/admin/content/[collection]">) {
  await requireAdmin();
  const { collection } = await params;
  if (!isCollectionKey(collection)) notFound();
  const def = collections[collection];

  const [rows, photos] = await Promise.all([
    listCollection(collection),
    collection === "gallery" ? getMediaOptions("image") : Promise.resolve(null),
  ]);

  const items: ListItem[] = (rows ?? []).map((row) => ({
    id: String(row.id),
    label: def.label(row),
    detail: def.detail?.(row) ?? null,
    published: row.is_published === true,
    featured: def.featured && row.is_featured === true,
  }));

  return (
    <>
      <BackLink href="/admin/content">Content</BackLink>
      <div className="mt-6">
        {rows === null ? (
          <>
            <h1 className="font-display text-display-md font-medium">{def.title}</h1>
            <p role="alert" className="mt-6 text-destructive">
              {def.title} couldn&apos;t be loaded. Please refresh the page.
            </p>
          </>
        ) : (
          <CollectionList
            collection={collection}
            items={items}
            addDisabledReason={photos && photos.length === 0 ? NO_PHOTOS_HINT : undefined}
          />
        )}
      </div>
    </>
  );
}
