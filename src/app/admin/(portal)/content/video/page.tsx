import type { Metadata } from "next";
import { BackLink } from "@/components/admin/back-link";
import { VideoForm } from "@/components/admin/singleton-forms";
import { getMediaOptions, getSingleton } from "@/lib/admin/cms";
import { requireAdmin } from "@/lib/admin/session";
import { videoToValues } from "@/lib/cms/singletons";

export const metadata: Metadata = { title: "Video" };

export default async function VideoContentPage() {
  await requireAdmin();
  const [row, imageOptions, videoOptions] = await Promise.all([
    getSingleton("video_story"),
    getMediaOptions("image"),
    getMediaOptions("video"),
  ]);

  return (
    <>
      <BackLink href="/admin/content">Content</BackLink>
      <h1 className="mt-6 font-display text-display-md font-medium">Video</h1>
      <div className="mt-8">
        {row ? (
          <VideoForm defaultValues={videoToValues(row)} imageOptions={imageOptions} videoOptions={videoOptions} />
        ) : (
          <p role="alert" className="text-destructive">The video section couldn&apos;t be loaded. Please refresh the page.</p>
        )}
      </div>
    </>
  );
}
