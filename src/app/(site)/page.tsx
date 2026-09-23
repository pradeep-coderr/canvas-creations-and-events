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
import { localBusinessJsonLd, serializeJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <main id="main">
      {/* Business structured data: verified facts only (see lib/structured-data.ts). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(localBusinessJsonLd()) }}
      />
      <Hero />
      <Intro />
      <Services />
      <CategoryStrip />
      <GalleryPreview />
      <AboutFounder />
      <Process />
      {/* Trust right after "how we work"; renders nothing until real testimonials exist. */}
      <Testimonials />
      <WhyCanvas />
      <VideoStory />
      <Faq />
      <Enquiry />
      <Contact />
    </main>
  );
}
