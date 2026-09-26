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
import { site } from "@/data/site";
import { GalleryLightbox, LightboxTrigger } from "./gallery-lightbox";
import { SlotItem, type ItemSlots } from "./item-slots";
import { cn } from "@/lib/utils";

// Editorial layout for up to five images: one large lead image beside two
// smaller ones, then a pair beneath (12-column grid from lg; 2 columns below).
const slots = [
  {
    item: "col-span-2 lg:col-span-7 lg:row-span-2",
    frame: "aspect-4/5 lg:aspect-auto lg:h-full lg:min-h-[28rem]",
    sizes: "(min-width: 1280px) 700px, (min-width: 1024px) 58vw, 100vw",
  },
  { item: "lg:col-span-5", frame: "aspect-square lg:aspect-3/2", sizes: "(min-width: 1280px) 500px, (min-width: 1024px) 42vw, 50vw" },
  { item: "lg:col-span-5", frame: "aspect-square lg:aspect-3/2", sizes: "(min-width: 1280px) 500px, (min-width: 1024px) 42vw, 50vw" },
  { item: "lg:col-span-6", frame: "aspect-square lg:aspect-3/2", sizes: "(min-width: 1280px) 600px, (min-width: 1024px) 50vw, 50vw" },
  { item: "lg:col-span-6", frame: "aspect-square lg:aspect-3/2", sizes: "(min-width: 1280px) 600px, (min-width: 1024px) 50vw, 50vw" },
];

const instagram = site.socials.find((s) => s.platform === "instagram");

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
  copy = gallerySection,
  itemSlots,
}: {
  items?: GalleryItem[];
  copy?: GalleryCopy;
  itemSlots?: ItemSlots<GalleryItem>;
}) {
  const hasImages = items.length > 0;

  return (
    <Section id="gallery" tone="dark" aria-labelledby="gallery-title">
      {hasImages ? (
        <Container>
          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              id="gallery-title"
              eyebrow={copy.eyebrow}
              title={copy.title}
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

          {/* Lightbox-ready: each item carries its index for a future viewer. */}
          {/* The grid stays server-rendered; the lightbox adds an open button per photo. */}
          <GalleryLightbox photos={items.map((i) => ({ src: String(i.src), alt: i.alt, title: i.title }))}>
          <ul className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:mt-16 lg:grid-cols-12 lg:gap-5">
            {items.map((item, i) => {
              const slot = slots[i] ?? slots[slots.length - 1];
              // On two columns, let a trailing odd image span the full width.
              const fullWidthOnMobile = i > 0 && i === items.length - 1 && i % 2 === 1;
              return (
                <li
                  key={item.id}
                  data-gallery-index={i}
                  className={cn(slot.item, fullWidthOnMobile && "col-span-2")}
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
                        className={cn(
                          slot.frame,
                          fullWidthOnMobile && "aspect-3/2",
                        )}
                      />
                      {item.title && (
                        <figcaption className="sr-only">{item.title}</figcaption>
                      )}
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
              {site.socials
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
