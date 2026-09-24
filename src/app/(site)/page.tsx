import type { Metadata } from "next";
import { AboutFounder } from "@/components/sections/about-founder";
import { CategoryStrip } from "@/components/sections/category-strip";
import { Contact } from "@/components/sections/contact";
import { Enquiry } from "@/components/sections/enquiry";
import { Faq } from "@/components/sections/faq";
import { GalleryPreview } from "@/components/sections/gallery-preview";
import { Hero } from "@/components/sections/hero";
import { Intro } from "@/components/sections/intro";
import { Process } from "@/components/sections/process";
import { Services } from "@/components/sections/services";
import { Testimonials } from "@/components/sections/testimonials";
import { VideoStory } from "@/components/sections/video-story";
import { WhyCanvas } from "@/components/sections/why-canvas";
import { getHomepageContent } from "@/lib/content/public";
import { localBusinessJsonLd, serializeJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Statically rendered with CMS content, regenerated at most hourly. Admin
// content saves expire the `cms-content` cache tag (updateTag), so edits
// appear on the next request without waiting for this window.
export const revalidate = 3600;

export default async function Home() {
  const content = await getHomepageContent();
  const { copy } = content;

  return (
    <main id="main">
      {/* Business structured data: verified facts only (see lib/structured-data.ts). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(localBusinessJsonLd()) }}
      />
      <Hero copy={copy.hero} />
      <Intro copy={copy.intro} />
      <Services services={content.services} copy={copy.services} />
      <CategoryStrip categories={content.categories} copy={copy.categories} />
      <GalleryPreview items={content.gallery} copy={copy.gallery} />
      <AboutFounder copy={content.about} />
      <Process steps={content.processSteps} copy={copy.process} />
      {/* Trust right after "how we work"; renders nothing until real testimonials exist. */}
      <Testimonials testimonials={content.testimonials} copy={copy.testimonials} />
      <WhyCanvas principles={content.principles} copy={copy.whyCanvas} />
      <VideoStory video={content.video.video} copy={content.video.copy} />
      <Faq faqs={content.faqs} copy={copy.faq} />
      <Enquiry copy={copy.enquiry} />
      <Contact copy={copy.contact} />
    </main>
  );
}
