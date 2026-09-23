/**
 * CMS media lives in the public "cms-media" Supabase Storage bucket.
 * Content rows reference media_assets by id; the URL is derived here, never
 * stored. next.config.ts allows exactly this path for next/image.
 */
export const CMS_MEDIA_BUCKET = "cms-media";

export function cmsMediaUrl(storagePath: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/${CMS_MEDIA_BUCKET}/${storagePath
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}
