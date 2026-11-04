import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { DecorativeDivider } from "@/components/shared/decorative-divider";
import { ImageFrame } from "@/components/shared/image-frame";
import { SampleBadge, SampleNotice } from "@/components/shared/sample-badge";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { galleryPreview, type GalleryItem } from "@/data/gallery";
import { gallerySection, type GalleryCopy } from "@/data/home";
import { defaultSiteSettings, type SiteCopy } from "@/lib/cms/site-settings";
import { GalleryLightbox, LightboxTrigger, type FilterCategory } from "./gallery-lightbox";
import { SlotItem, type ItemSlots } from "./item-slots";

/*
 * The portfolio as polaroids pegged on a string of fairy lights: each photo
 * hangs from its own swag of the string, so the swags join into one
 * festoon across every row however many photos show (the category filter
 * and "Show all" hide items, and the rest reflow). Two across on phones,
 * three on tablets, four on desktop; a short last row is centred. Each
 * polaroid hangs at a slight angle, sways gently and swings when the
 * pointer nudges it (globals.css "Polaroid string").
 */

// The resting angle of each polaroid, in turn (degrees).
const TILTS = [-2.6, 1.8, -1.2, 2.4, -1.9, 1.1, -2.2, 2.9];
// Fairy-light bulbs along a swag: position along it (0–1) and drop (px).
const BULBS = [0.14, 0.38, 0.62, 0.86].map((t) => ({ t, y: 4 + 60 * t * (1 - t) }));

/** One swag of the fairy-light string, sagging across the polaroid's cell. */
function Swag() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[30px]">
      <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
        <path d="M0 4 Q 50 34, 100 4" fill="none" stroke="var(--cc-champagne)" strokeOpacity="0.55" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
      </svg>
      {BULBS.map((b, i) => (
        <span
          key={b.t}
          className="fairy-bulb absolute size-1.5 -translate-x-1/2 rounded-full bg-[#ffe1a1]"
          style={{ left: `${b.t * 100}%`, top: `${b.y}px`, animationDelay: `${-i * 0.9}s` }}
        />
      ))}
    </span>
  );
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
  sampleNotice,
  itemSlots,
  socials = defaultSiteSettings.socials,
}: {
  items?: GalleryItem[];
  /** Categories that have photos here (the filter shows with three or more). */
  categories?: FilterCategory[];
  copy?: GalleryCopy;
  /** Shown under the heading while any photo here is sample content. */
  sampleNotice?: React.ReactNode;
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
            {sampleNotice && items.some((i) => i.isDemo) && <SampleNotice className="sm:hidden">{sampleNotice}</SampleNotice>}
            {instagram && (
              <Button asChild variant="link" className="self-start sm:self-auto">
                <a href={instagram.href} target="_blank" rel="noopener noreferrer">
                  <ExternalLabel>{copy.instagramCta}</ExternalLabel>
                  <ArrowUpRight data-icon="inline-end" />
                </a>
              </Button>
            )}
          </div>

          {sampleNotice && items.some((i) => i.isDemo) && (
            <SampleNotice className="mt-4 max-sm:hidden">{sampleNotice}</SampleNotice>
          )}

          {/* The grid is server-rendered; the lightbox adds an open button per photo and the optional filter. */}
          <GalleryLightbox
            photos={items.map((i) => ({
              src: String(i.src),
              alt: i.alt,
              title: i.title,
              category: i.categoryId,
              sample: i.isDemo,
              credit: i.credit,
            }))}
            categories={categories}
            allLabel={copy.filterAll}
            // The website shows 8, then "Show all"; the editor shows every photo (to edit them).
            limit={itemSlots ? undefined : 8}
          >
            <ul className="cc-portfolio mt-14 flex flex-wrap justify-center gap-y-10 sm:gap-y-14 lg:mt-16 lg:gap-y-16">
              {items.map((item, i) => (
                <li
                  key={item.id}
                  data-gallery-index={i}
                  data-category={item.categoryId}
                  className="relative w-1/2 pt-5 sm:w-1/3 lg:w-1/4"
                >
                  <Swag />
                  <SlotItem slots={itemSlots} item={item}>
                    <Reveal className="relative mx-auto w-[84%]">
                      <figure
                        className="polaroid relative bg-[#fdfaf4] p-2 pb-0 shadow-[0_22px_32px_-14px_rgb(0_0_0/0.65)] sm:p-2.5 sm:pb-0"
                        style={{ "--tilt": `${TILTS[i % TILTS.length]}deg`, "--sway-delay": `${-i * 1.7}s` } as React.CSSProperties}
                      >
                        {/* The wooden peg, clipping the polaroid to the string. */}
                        <span
                          aria-hidden="true"
                          className="absolute -top-3.5 left-1/2 z-[2] h-7 w-2.5 -translate-x-1/2 rounded-[2px] bg-[linear-gradient(90deg,#b98049,#d9a46a_45%,#9a6534)] shadow-[0_2px_3px_rgb(0_0_0/0.4)] after:absolute after:inset-x-0 after:top-2.5 after:h-[2px] after:bg-[#8e9aa3]"
                        />
                        <div className="relative">
                          <ImageFrame src={item.src} alt={item.alt} ratio="square" sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw" />
                          {item.isDemo && <SampleBadge />}
                        </div>
                        {/* The polaroid's wide bottom margin, with the title written on it. */}
                        <figcaption className="flex h-9 items-center justify-center px-1 sm:h-11">
                          {item.title && (
                            <span className="truncate font-display text-base text-[#4a3b33] italic sm:text-lg">{item.title}</span>
                          )}
                        </figcaption>
                        <LightboxTrigger index={i} label={item.title ?? item.alt} />
                      </figure>
                    </Reveal>
                  </SlotItem>
                </li>
              ))}
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
