import type { Metadata } from "next";
import { BackLink } from "@/components/admin/back-link";
import { AboutForm } from "@/components/admin/singleton-forms";
import { getImageLibrary, getSingleton } from "@/lib/admin/cms";
import { requireAdmin } from "@/lib/admin/session";
import { aboutToValues } from "@/lib/cms/singletons";

export const metadata: Metadata = { title: "About" };

export default async function AboutContentPage() {
  await requireAdmin();
  const [row, imageOptions] = await Promise.all([getSingleton("about_content"), getImageLibrary()]);

  return (
    <>
      <BackLink href="/admin/content">Content</BackLink>
      <h1 className="mt-6 font-display text-display-md font-title">About</h1>
      <div className="mt-8">
        {row ? (
          <AboutForm defaultValues={aboutToValues(row)} imageOptions={imageOptions} />
        ) : (
          <p role="alert" className="text-destructive">The About section couldn&apos;t be loaded. Please refresh the page.</p>
        )}
      </div>
    </>
  );
}
