import type { Metadata } from "next";
import { BackLink } from "@/components/admin/back-link";
import { MediaLibrary } from "@/components/media/media-library";
import { getImageLibrary, getVideoLibrary } from "@/lib/admin/cms";
import { requireAdmin } from "@/lib/admin/session";
import { uploadedVideoConfigured } from "@/lib/media/video-providers";

export const metadata: Metadata = { title: "Media library" };

export default async function MediaLibraryPage({ searchParams }: PageProps<"/admin/content/media">) {
  await requireAdmin();
  const { tab } = await searchParams;
  const [images, videos] = await Promise.all([getImageLibrary(), getVideoLibrary()]);

  return (
    <>
      <BackLink href="/admin/content">Content</BackLink>
      <div className="mt-6">
        <MediaLibrary
          tab={tab === "videos" ? "videos" : "photos"}
          images={images}
          videos={videos}
          uploadedVideoConfigured={uploadedVideoConfigured()}
        />
      </div>
    </>
  );
}
