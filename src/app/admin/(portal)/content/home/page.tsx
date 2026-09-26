import type { Metadata } from "next";
import { BackLink } from "@/components/admin/back-link";
import { HomeForm } from "@/components/admin/singleton-forms";
import { getImageLibrary, getSingleton } from "@/lib/admin/cms";
import { requireAdmin } from "@/lib/admin/session";
import { homeToValues } from "@/lib/cms/singletons";

export const metadata: Metadata = { title: "Homepage text" };

export default async function HomeContentPage() {
  await requireAdmin();
  const [row, imageOptions] = await Promise.all([getSingleton("home_content"), getImageLibrary()]);

  return (
    <>
      <BackLink href="/admin/content">Content</BackLink>
      <h1 className="mt-6 font-display text-display-md font-medium">Homepage text</h1>
      <div className="mt-8">
        {row ? (
          <HomeForm defaultValues={homeToValues(row)} imageOptions={imageOptions} />
        ) : (
          <p role="alert" className="text-destructive">The homepage text couldn&apos;t be loaded. Please refresh the page.</p>
        )}
      </div>
    </>
  );
}
