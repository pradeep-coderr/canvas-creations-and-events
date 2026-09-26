import type { ComponentType, ReactNode } from "react";
import { AboutFounder } from "@/components/sections/about-founder";
import { CategoryStrip } from "@/components/sections/category-strip";
import { Contact } from "@/components/sections/contact";
import { Enquiry } from "@/components/sections/enquiry";
import { Faq } from "@/components/sections/faq";
import { GalleryPreview } from "@/components/sections/gallery-preview";
import { Hero } from "@/components/sections/hero";
import { Intro } from "@/components/sections/intro";
import type { ItemSlots } from "@/components/sections/item-slots";
import { Process } from "@/components/sections/process";
import { Services } from "@/components/sections/services";
import { Testimonials } from "@/components/sections/testimonials";
import { VideoStory } from "@/components/sections/video-story";
import { WhyCanvas } from "@/components/sections/why-canvas";
import type { Category } from "@/data/categories";
import type { FaqItem } from "@/data/faq";
import type { GalleryItem } from "@/data/gallery";
import type { AboutCopy, Principle, ProcessStep, VideoContent, VideoStoryCopy } from "@/data/home";
import type { Service } from "@/data/services";
import type { Testimonial } from "@/data/testimonials";
import type { HomeCopy } from "@/lib/content/public";

/** Everything the homepage renders (from the CMS, or the editor's live values). */
export interface HomeContent {
  copy: HomeCopy;
  about: AboutCopy;
  video: { copy: VideoStoryCopy; video: VideoContent | null };
  services: Service[];
  categories: Category[];
  gallery: GalleryItem[];
  testimonials: Testimonial[];
  faqs: FaqItem[];
  processSteps: ProcessStep[];
  principles: Principle[];
}

export type HomeSectionKey =
  | "hero"
  | "intro"
  | "services"
  | "categories"
  | "gallery"
  | "about"
  | "process"
  | "testimonials"
  | "whyCanvas"
  | "video"
  | "faq"
  | "enquiry"
  | "contact";

/** Editor-only hooks (see ItemSlots). The public page passes none. */
export interface HomeEditorSlots {
  Section?: ComponentType<{ section: HomeSectionKey; children: ReactNode }>;
  /** Controls over the hero / About photos. */
  heroImage?: ReactNode;
  aboutImage?: ReactNode;
  services?: ItemSlots<Service>;
  categories?: ItemSlots<Category>;
  gallery?: ItemSlots<GalleryItem>;
  testimonials?: ItemSlots<Testimonial>;
  faqs?: ItemSlots<FaqItem>;
  process?: ItemSlots<ProcessStep>;
  principles?: ItemSlots<Principle>;
}

function Plain({ children }: { section: HomeSectionKey; children: ReactNode }) {
  return children;
}

/**
 * The homepage sections, in order. Used by the public page and by the admin
 * visual editor, so the two can't drift apart.
 */
export function HomeSections({ content, slots }: { content: HomeContent; slots?: HomeEditorSlots }) {
  const { copy } = content;
  const S = slots?.Section ?? Plain;
  return (
    <>
      <S section="hero">
        <Hero copy={copy.hero} imageAction={slots?.heroImage} />
      </S>
      <S section="intro">
        <Intro copy={copy.intro} />
      </S>
      <S section="services">
        <Services services={content.services} copy={copy.services} itemSlots={slots?.services} />
      </S>
      <S section="categories">
        <CategoryStrip categories={content.categories} copy={copy.categories} itemSlots={slots?.categories} />
      </S>
      <S section="gallery">
        <GalleryPreview items={content.gallery} copy={copy.gallery} itemSlots={slots?.gallery} />
      </S>
      <S section="about">
        <AboutFounder copy={content.about} imageAction={slots?.aboutImage} />
      </S>
      <S section="process">
        <Process steps={content.processSteps} copy={copy.process} itemSlots={slots?.process} />
      </S>
      {/* Trust right after "how we work"; renders nothing until real testimonials exist. */}
      <S section="testimonials">
        <Testimonials testimonials={content.testimonials} copy={copy.testimonials} itemSlots={slots?.testimonials} />
      </S>
      <S section="whyCanvas">
        <WhyCanvas principles={content.principles} copy={copy.whyCanvas} itemSlots={slots?.principles} />
      </S>
      <S section="video">
        <VideoStory video={content.video.video} copy={content.video.copy} />
      </S>
      <S section="faq">
        <Faq faqs={content.faqs} copy={copy.faq} itemSlots={slots?.faqs} />
      </S>
      <S section="enquiry">
        <Enquiry copy={copy.enquiry} />
      </S>
      <S section="contact">
        <Contact copy={copy.contact} />
      </S>
    </>
  );
}
