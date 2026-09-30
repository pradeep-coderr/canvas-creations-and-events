import type { Metadata } from "next";
import Link from "next/link";
import { BackLink } from "@/components/admin/back-link";
import { VideoForm } from "@/components/admin/singleton-forms";
import { getSingleton } from "@/lib/admin/cms";
import { requireAdmin } from "@/lib/admin/session";
import { videoToValues } from "@/lib/cms/singletons";

export const metadata: Metadata = { title: "Films section" };

/** The Films section's wording. The films are a list: Content → Films. */
export default async function VideoContentPage() {
  await requireAdmin();
  const row = await getSingleton("video_story");

  return (
    <>
      <BackLink href="/admin/content">Content</BackLink>
      <h1 className="mt-6 font-display text-display-md font-title">Films section</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        The section&apos;s wording. The videos are added under{" "}
        <Link href="/admin/content/films" className="font-semibold underline underline-offset-4">
          Content → Films
        </Link>
        , from YouTube or Vimeo links in the media library.
      </p>
      <div className="mt-8">
        {row ? (
          <VideoForm defaultValues={videoToValues(row)} />
        ) : (
          <p role="alert" className="text-destructive">The films section couldn&apos;t be loaded. Please refresh the page.</p>
        )}
      </div>
    </>
  );
}
