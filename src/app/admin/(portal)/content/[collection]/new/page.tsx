import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/admin/back-link";
import { nextSortOrder } from "@/lib/admin/cms";
import { requireAdmin } from "@/lib/admin/session";
import { collections, isCollectionKey } from "@/lib/cms/collections";
import { ItemForm } from "../item-form";

export async function generateMetadata({ params }: PageProps<"/admin/content/[collection]/new">): Promise<Metadata> {
  const { collection } = await params;
  return { title: isCollectionKey(collection) ? `New ${collections[collection].singular}` : "Not found" };
}

export default async function NewItemPage({ params }: PageProps<"/admin/content/[collection]/new">) {
  await requireAdmin();
  const { collection } = await params;
  if (!isCollectionKey(collection)) notFound();
  const def = collections[collection];

  // A draft at the end of the list. Services and testimonials are featured by
  // default; in the other lists "featured" means shown first, so it's opt-in.
  const defaults = {
    is_published: false,
    is_featured: collection === "services" || collection === "testimonials",
    sort_order: await nextSortOrder(collection),
    price_type: "fixed",
  };

  return (
    <>
      <BackLink href={`/admin/content/${collection}`}>{def.title}</BackLink>
      <h1 className="mt-6 font-display text-display-md font-title">New {def.singular}</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        New {def.plural} start as drafts. Tick “Published on the website” when it&apos;s ready.
      </p>
      <div className="mt-8">
        <ItemForm collection={collection} id={null} row={defaults} />
      </div>
    </>
  );
}
