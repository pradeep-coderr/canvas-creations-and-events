import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { DecorativeDivider } from "@/components/shared/decorative-divider";
import { ImageFrame } from "@/components/shared/image-frame";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { galleryPreview, type GalleryItem } from "@/data/gallery";
import { gallerySection, type GalleryCopy } from "@/data/home";
import { defaultSiteSettings, type SiteCopy } from "@/lib/cms/site-settings";
import { GalleryLightbox, LightboxTrigger, type FilterCategory } from "./gallery-lightbox";
import { SlotItem, type ItemSlots } from "./item-slots";
import { cn } from "@/lib/utils";

/*
 * Editorial layout. Desktop (12 columns): a large lead photo beside two
 * smaller ones, a pair beneath, then the rest in threes with varied shapes.
 * Tablet and phone (2 columns): the lead full width, the rest in pairs (a
 * trailing single photo spans the width). One or two photos get their own
 * compositions instead of an empty-looking grid.
 */
interface Slot {
  item: string;
  frame: string;
  sizes: string;
}

const leadSlot: Slot = {
  item: "col-span-2 lg:col-span-7 lg:row-span-2",
  frame: "aspect-4/5 sm:aspect-3/2 lg:aspect-auto lg:h-full lg:min-h-[28rem]",
  sizes: "(min-width: 1280px) 700px, (min-width: 1024px) 58vw, 100vw",
};
const sideSlot: Slot = {
  item: "lg:col-span-5",
  frame: "aspect-square lg:aspect-3/2",
  sizes: "(min-width: 1280px) 500px, (min-width: 1024px) 42vw, 50vw",
};
const pairSlot: Slot = {
  item: "lg:col-span-6",
  frame: "aspect-square lg:aspect-3/2",
  sizes: "(min-width: 1280px) 600px, (min-width: 1024px) 50vw, 50vw",
};
// Photos after the first five: threes on desktop, alternating shapes.
const restShapes = ["lg:aspect-4/5", "lg:aspect-square", "lg:aspect-4/5"];

function slotFor(i: number, count: number): Slot {
  if (count === 1)
    return {
      item: "col-span-2 lg:col-span-8 lg:col-start-3",
      frame: "aspect-4/5 sm:aspect-3/2",
      sizes: "(min-width: 1280px) 800px, (min-width: 1024px) 66vw, 100vw",
    };
  if (count === 2)
    return {
      item: "col-span-2 sm:col-span-1 lg:col-span-6",
      frame: "aspect-4/5",
      sizes: "(min-width: 1280px) 600px, (min-width: 640px) 50vw, 100vw",
    };
  if (i === 0) return leadSlot;
  if (i <= 2) return sideSlot;
  if (i <= 4) return pairSlot;
  return {
    item: "lg:col-span-4",
    frame: `aspect-square ${restShapes[(i - 5) % restShapes.length]}`,
    sizes: "(min-width: 1280px) 400px, (min-width: 1024px) 33vw, 50vw",
  };
}

function ExternalLabel({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </>
  );
}

export function GalleryPreview({
  items = galleryPreview,
  categories = [],
  copy = gallerySection,
  itemSlots,
  socials = defaultSiteSettings.socials,
}: {
  items?: GalleryItem[];
  /** Categories that have photos here (the filter shows with three or more). */
  categories?: FilterCategory[];
  copy?: GalleryCopy;
  itemSlots?: ItemSlots<GalleryItem>;
  /** Social links (site details). */
  socials?: SiteCopy["socials"];
}) {
  const instagram = socials.find((s) => s.platform === "instagram");
  const hasImages = items.length > 0;

  return (
    <Section id="gallery" tone="dark" aria-labelledby="gallery-title">
      {hasImages ? (
        <Container>
          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              styleKeys={{ eyebrow: "home.galleryEyebrow", title: "home.galleryTitle", description: "home.galleryIntro" }}
              id="gallery-title"
              eyebrow={copy.eyebrow}
              title={copy.title}
              description={copy.intro ?? undefined}
              align="start"
            />
            {instagram && (
              <Button asChild variant="link" className="self-start sm:self-auto">
                <a href={instagram.href} target="_blank" rel="noopener noreferrer">
                  <ExternalLabel>{copy.instagramCta}</ExternalLabel>
                  <ArrowUpRight data-icon="inline-end" />
                </a>
              </Button>
            )}
          </div>

          {/* The grid is server-rendered; the lightbox adds an open button per photo and the optional filter. */}
          <GalleryLightbox
            photos={items.map((i) => ({ src: String(i.src), alt: i.alt, title: i.title, category: i.categoryId }))}
            categories={categories}
            allLabel={copy.filterAll}
          >
            <ul className="cc-portfolio mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:mt-16 lg:grid-cols-12 lg:gap-5">
              {items.map((item, i) => {
                const slot = slotFor(i, items.length);
                // On two columns, let a trailing single photo span the full width.
                const fullWidthOnMobile = items.length > 2 && i > 0 && i === items.length - 1 && i % 2 === 1;
                return (
                  <li
                    key={item.id}
                    data-gallery-index={i}
                    data-category={item.categoryId}
                    className={cn("min-w-0", slot.item, fullWidthOnMobile && "col-span-2")}
                  >
                    <SlotItem slots={itemSlots} item={item}>
                      <Reveal className="h-full">
                        <figure className="relative h-full">
                          <ImageFrame
                            src={item.src}
                            alt={item.alt}
                            ratio="square"
                            zoomOnHover
                            sizes={slot.sizes}
                            className={cn("cc-portfolio-frame", slot.frame, fullWidthOnMobile && "aspect-3/2")}
                          />
                          {item.title && <figcaption className="sr-only">{item.title}</figcaption>}
                          <LightboxTrigger index={i} label={item.title ?? item.alt} />
                        </figure>
                      </Reveal>
                    </SlotItem>
                  </li>
                );
              })}
            </ul>
          </GalleryLightbox>
          {itemSlots?.after}
        </Container>
      ) : (
        // Deliberate empty state: no placeholder frames pretending to be work.
        <Container size="narrow" className="text-center">
          <SectionHeading
          styleKeys={{ eyebrow: "home.galleryEyebrow", title: "home.galleryEmptyTitle", description: "home.galleryEmptyText" }}
            id="gallery-title"
            eyebrow={copy.eyebrow}
            title={copy.emptyTitle}
            description={copy.emptyText}
          />
          <DecorativeDivider className="mt-12" />
          <div className="mt-12 flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-10">
            {instagram && (
              <Button asChild variant="secondary" size="lg">
                <a href={instagram.href} target="_blank" rel="noopener noreferrer">
                  <ExternalLabel>{copy.instagramCta}</ExternalLabel>
                  <ArrowUpRight data-icon="inline-end" />
                </a>
              </Button>
            )}
            <ul className="flex gap-8 text-sm">
              {socials
                .filter((s) => s.platform !== "instagram")
                .map((social) => (
                  <li key={social.platform}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold underline decoration-primary/40 underline-offset-4 transition-colors hover:text-primary"
                    >
                      <ExternalLabel>{social.label}</ExternalLabel>
                    </a>
                  </li>
                ))}
            </ul>
          </div>
          {itemSlots?.after}
        </Container>
      )}
    </Section>
  );
}
