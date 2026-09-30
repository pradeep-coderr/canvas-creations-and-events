import type { ComponentType, ReactNode } from "react";
import { AboutFounder } from "@/components/sections/about-founder";
import { CategoryStrip } from "@/components/sections/category-strip";
import { Contact } from "@/components/sections/contact";
import { Enquiry } from "@/components/sections/enquiry";
import { Faq } from "@/components/sections/faq";
import { GalleryPreview } from "@/components/sections/gallery-preview";
import { Hero } from "@/components/sections/hero";
import { Intro } from "@/components/sections/intro";
import { Pricing } from "@/components/sections/pricing";
import type { ItemSlots } from "@/components/sections/item-slots";
import { Process } from "@/components/sections/process";
import { Services } from "@/components/sections/services";
import { VideoStory } from "@/components/sections/video-story";
import { WhyCanvas } from "@/components/sections/why-canvas";
import type { Category } from "@/data/categories";
import type { FaqItem } from "@/data/faq";
import type { Film } from "@/data/films";
import type { GalleryItem } from "@/data/gallery";
import type { AboutCopy, Principle, ProcessStep, VideoStoryCopy } from "@/data/home";
import type { PricingPackage } from "@/data/pricing";
import type { Service } from "@/data/services";
import type { Testimonial } from "@/data/testimonials";
import type { SiteCopy } from "@/lib/cms/site-settings";
import { sectionAttrs, type PageStyles } from "@/lib/styles/schema";
import type { HomeCopy } from "@/lib/content/public";

/** Everything the homepage renders (from the CMS, or the editor's live values). */
export interface HomeContent {
  copy: HomeCopy;
  /** Site details: headline, button labels, phone, social links, form wording. */
  settings: SiteCopy;
  /** Section style presets (background, spacing) from the visual editor. */
  sectionStyles?: PageStyles["sections"];
  about: AboutCopy;
  /** The Films section's wording. */
  video: { copy: VideoStoryCopy };
  services: Service[];
  pricing: PricingPackage[];
  categories: Category[];
  gallery: GalleryItem[];
  /** Categories that have photos in the portfolio (for its filter). */
  galleryCategories: { id: string; label: string }[];
  films: Film[];
  testimonials: Testimonial[];
  faqs: FaqItem[];
  processSteps: ProcessStep[];
  principles: Principle[];
}

export type HomeSectionKey =
  | "hero"
  | "intro"
  | "services"
  | "pricing"
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
  Section?: ComponentType<{ section: HomeSectionKey; styles?: PageStyles["sections"]; children: ReactNode }>;
  /** Controls over the hero / About photos. */
  heroImage?: ReactNode;
  aboutImage?: ReactNode;
  services?: ItemSlots<Service>;
  pricing?: ItemSlots<PricingPackage>;
  categories?: ItemSlots<Category>;
  gallery?: ItemSlots<GalleryItem>;
  films?: ItemSlots<Film>;
  testimonials?: ItemSlots<Testimonial>;
  faqs?: ItemSlots<FaqItem>;
  process?: ItemSlots<ProcessStep>;
  principles?: ItemSlots<Principle>;
}

/**
 * Public wrapper: a section with a style preset gets a display: contents
 * wrapper carrying it (see globals.css); without one, the HTML is unchanged.
 */
function StyledSection({
  section,
  styles,
  children,
}: {
  section: HomeSectionKey;
  styles?: PageStyles["sections"];
  children: ReactNode;
}) {
  const attrs = sectionAttrs(styles?.[section]);
  return attrs ? (
    <div data-ss={section} {...attrs}>
      {children}
    </div>
  ) : (
    children
  );
}

/**
 * The homepage sections, in order. Used by the public page and by the admin
 * visual editor, so the two can't drift apart.
 */
export function HomeSections({ content, slots }: { content: HomeContent; slots?: HomeEditorSlots }) {
  const { copy, settings } = content;
  const S = slots?.Section ?? StyledSection;
  const ss = content.sectionStyles;
  return (
    <>
      <S section="hero" styles={ss}>
        <Hero copy={copy.hero} settings={settings} imageAction={slots?.heroImage} />
      </S>
      <S section="intro" styles={ss}>
        <Intro copy={copy.intro} />
      </S>
      <S section="services" styles={ss}>
        <Services services={content.services} copy={copy.services} itemSlots={slots?.services} />
      </S>
      {/* Only once a package is published (the editor always shows it). */}
      {(content.pricing.length > 0 || slots?.pricing) && (
        <S section="pricing" styles={ss}>
          <Pricing packages={content.pricing} copy={copy.pricing} itemSlots={slots?.pricing} />
        </S>
      )}
      <S section="categories" styles={ss}>
        <CategoryStrip categories={content.categories} copy={copy.categories} itemSlots={slots?.categories} />
      </S>
      <S section="gallery" styles={ss}>
        <GalleryPreview
          items={content.gallery}
          categories={content.galleryCategories}
          copy={copy.gallery}
          itemSlots={slots?.gallery}
          socials={settings.socials}
        />
      </S>
      <S section="about" styles={ss}>
        <AboutFounder copy={content.about} imageAction={slots?.aboutImage} />
      </S>
      <S section="process" styles={ss}>
        <Process steps={content.processSteps} copy={copy.process} itemSlots={slots?.process} />
      </S>
      {/* The testimonials ("Kind words") section is not shown (Phase 20); the CMS list is kept. */}
      <S section="whyCanvas" styles={ss}>
        <WhyCanvas principles={content.principles} copy={copy.whyCanvas} itemSlots={slots?.principles} />
      </S>
      {/* Films: only once a film is published (the editor always shows it). */}
      {(content.films.length > 0 || slots?.films) && (
        <S section="video" styles={ss}>
          <VideoStory films={content.films} copy={content.video.copy} socials={settings.socials} itemSlots={slots?.films} />
        </S>
      )}
      <S section="faq" styles={ss}>
        <Faq faqs={content.faqs} copy={copy.faq} itemSlots={slots?.faqs} />
      </S>
      <S section="enquiry" styles={ss}>
        <Enquiry copy={copy.enquiry} settings={settings} />
      </S>
      <S section="contact" styles={ss}>
        <Contact copy={copy.contact} settings={settings} />
      </S>
    </>
  );
}
