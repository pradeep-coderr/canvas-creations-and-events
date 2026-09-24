import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { BackLink } from "@/components/admin/back-link";
import { FeaturedBadge, VisibilityBadge } from "@/components/admin/content-badges";
import { getCollectionItem } from "@/lib/admin/cms";
import { requireAdmin } from "@/lib/admin/session";
import { collections, isCollectionKey, singularTitle } from "@/lib/cms/collections";
import { ItemForm } from "../item-form";

export async function generateMetadata({ params }: PageProps<"/admin/content/[collection]/[id]">): Promise<Metadata> {
  const { collection } = await params;
  return { title: isCollectionKey(collection) ? `Edit ${collections[collection].singular}` : "Not found" };
}

export default async function EditItemPage({ params, searchParams }: PageProps<"/admin/content/[collection]/[id]">) {
  await requireAdmin();
  const [{ collection, id }, { created }] = await Promise.all([params, searchParams]);
  if (!isCollectionKey(collection) || !z.uuid().safeParse(id).success) notFound();
  const row = await getCollectionItem(collection, id);
  if (!row) notFound();
  const def = collections[collection];

  return (
    <>
      <BackLink href={`/admin/content/${collection}`}>{def.title}</BackLink>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-display-md font-medium break-words">
          {def.label(row) || `Untitled ${def.singular}`}
        </h1>
        <VisibilityBadge published={row.is_published === true} />
        {def.featured && row.is_featured === true && <FeaturedBadge />}
      </div>
      <div className="mt-8">
        <ItemForm
          collection={collection}
          id={id}
          row={row}
          initialMessage={created === "1" ? `${singularTitle(collection)} created.` : undefined}
        />
      </div>
    </>
  );
}
