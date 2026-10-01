import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { ImageFrame } from "@/components/shared/image-frame";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import type { Film } from "@/data/films";
import { videoStory, type VideoStoryCopy } from "@/data/home";
import { defaultSiteSettings, type SiteCopy } from "@/lib/cms/site-settings";
import { cn } from "@/lib/utils";
import { FilmDialog } from "./film-dialog";
import { SlotItem, type ItemSlots } from "./item-slots";
import { VideoPlayer } from "./video-player";

const providerLabels = { youtube: "YouTube", vimeo: "Vimeo" } as const;

/** The film's cover: its poster from the media library, or the Canvas cover. */
function Cover({ film, sizes }: { film: Film; sizes: string }) {
  return film.poster ? (
    <ImageFrame src={film.poster.src} alt="" sizes={sizes} className="absolute inset-0 aspect-auto size-full" />
  ) : (
    // No third-party thumbnail: the Canvas monogram on ivory.
    <div className="absolute inset-0 flex items-center justify-center bg-surface-ivory outline outline-1 -outline-offset-12 outline-highlight/40">
      <Image
        src="/images/logo/canvas-creations-monogram.png"
        alt=""
        width={804}
        height={804}
        sizes="160px"
        className="w-24 opacity-80 mix-blend-multiply sm:w-32"
      />
    </div>
  );
}

function FilmText({ film, large = false }: { film: Film; large?: boolean }) {
  return (
    <div className={cn("mt-4", large && "sm:mt-6")}>
      <h3 data-sk="films.title" className={cn("font-display font-title", large ? "text-display-md" : "text-display-sm")}>
        {film.title}
      </h3>
      {film.caption && (
        <p data-sk="films.caption" className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {film.caption}
        </p>
      )}
    </div>
  );
}

/**
 * Films: the featured film large (it plays in place), the others as poster
 * cards that play in a dialog. Players load only when Play is pressed.
 * With no published films the section isn't shown (the editor keeps it, with
 * its wording, so films can be added).
 */
export function VideoStory({
  films = [],
  copy = videoStory,
  socials = defaultSiteSettings.socials,
  itemSlots,
}: {
  films?: Film[];
  copy?: VideoStoryCopy;
  /** Social links (site details). */
  socials?: SiteCopy["socials"];
  itemSlots?: ItemSlots<Film>;
}) {
  if (films.length === 0 && !itemSlots) return null;
  const [lead, ...rest] = films;
  const tiktok = socials.find((s) => s.platform === "tiktok");

  return (
    <Section id="films" aria-labelledby="films-title">
      <Container>
        <SectionHeading
          styleKeys={{ eyebrow: "video.eyebrow", title: "video.title" }}
          id="films-title"
          eyebrow={copy.eyebrow}
          title={copy.title}
        />

        {lead ? (
          <>
            <SlotItem slots={itemSlots} item={lead}>
              <Reveal variant="in" className="mx-auto mt-12 max-w-5xl sm:mt-14">
                <figure>
                  <div className="relative aspect-video w-full overflow-hidden bg-surface-ivory">
                    <VideoPlayer playerUrl={lead.playerUrl} title={lead.title} providerLabel={providerLabels[lead.provider]}>
                      <Cover film={lead} sizes="(min-width: 1024px) 1024px, 100vw" />
                    </VideoPlayer>
                  </div>
                  <figcaption>
                    <FilmText film={lead} large />
                  </figcaption>
                </figure>
              </Reveal>
            </SlotItem>

            {rest.length > 0 && (
              <ul className="mx-auto mt-14 grid max-w-5xl gap-x-6 gap-y-10 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
                {rest.map((film) => (
                  <li key={film.id} className="min-w-0">
                    <SlotItem slots={itemSlots} item={film}>
                      <Reveal>
                        <figure>
                          <div className="relative aspect-video w-full overflow-hidden bg-surface-ivory">
                            <FilmDialog playerUrl={film.playerUrl} title={film.title} providerLabel={providerLabels[film.provider]}>
                              <Cover film={film} sizes="(min-width: 1024px) 330px, (min-width: 640px) 50vw, 100vw" />
                            </FilmDialog>
                          </div>
                          <figcaption>
                            <FilmText film={film} />
                          </figcaption>
                        </figure>
                      </Reveal>
                    </SlotItem>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          // Editor only (the public page hides the section): the honest empty state.
          <div className="mx-auto mt-12 flex max-w-3xl flex-col items-center gap-8 bg-surface-ivory px-8 py-14 text-center outline outline-1 -outline-offset-12 outline-highlight/40 sm:py-16">
            <p data-sk="video.emptyText" className="max-w-sm font-display text-display-sm text-foreground/90 italic">
              {copy.emptyText}
            </p>
            {tiktok && (
              <Button asChild variant="secondary">
                <a href={tiktok.href} target="_blank" rel="noopener noreferrer">
                  {copy.tiktokCta}
                  <span className="sr-only"> (opens in a new tab)</span>
                  <ArrowUpRight data-icon="inline-end" />
                </a>
              </Button>
            )}
          </div>
        )}
        {itemSlots?.after}
      </Container>
    </Section>
  );
}
