import type { Metadata } from "next";
import { HomeSections } from "@/components/home/home-sections";
import { getHomepageContent } from "@/lib/content/public";
import { localBusinessJsonLd, serializeJsonLd, websiteJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Statically rendered with CMS content, regenerated at most hourly. Admin
// content saves expire the `cms-content` cache tag (updateTag), so edits
// appear on the next request without waiting for this window.
export const revalidate = 3600;

export default async function Home() {
  const content = await getHomepageContent();

  return (
    <main id="main">
      {/* Business structured data: verified facts only (see lib/structured-data.ts). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(localBusinessJsonLd(content.settings)) }}
      />
      {/* The site's name for search results (with the names people search for). */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(websiteJsonLd()) }} />
      {/* Same composition as the admin visual editor (/admin/editor). */}
      <HomeSections content={content} />
    </main>
  );
}
