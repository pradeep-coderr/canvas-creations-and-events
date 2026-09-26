import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { ImageFrame } from "@/components/shared/image-frame";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { videoStory, type VideoContent, type VideoStoryCopy } from "@/data/home";
import { defaultSiteSettings, type SiteCopy } from "@/lib/cms/site-settings";
import { VideoPlayer } from "./video-player";

const providerLabels = { youtube: "YouTube", vimeo: "Vimeo", stream: "video" } as const;

/**
 * Event film slot. With a video: a cover (poster from the media library, or
 * the Canvas cover) and a Play button; the provider's player loads only
 * when pressed. Without one: an honest empty state pointing to TikTok.
 */
export function VideoStory({
  video = videoStory.video,
  copy = videoStory,
  socials = defaultSiteSettings.socials,
}: {
  video?: VideoContent | null;
  copy?: VideoStoryCopy;
  /** Social links (site details). */
  socials?: SiteCopy["socials"];
}) {
  const tiktok = socials.find((s) => s.platform === "tiktok");
  return (
    <Section aria-labelledby="video-title">
      <Container>
        <SectionHeading
          styleKeys={{ eyebrow: "video.eyebrow", title: "video.title" }}
          id="video-title"
          eyebrow={copy.eyebrow}
          title={copy.title}
        />

        <Reveal className="mx-auto mt-12 max-w-5xl sm:mt-14">
          {video ? (
            <figure>
              {/* One player for every provider; the iframe loads on Play. */}
              <div className="relative aspect-video w-full overflow-hidden bg-surface-ivory">
                <VideoPlayer playerUrl={video.playerUrl} title={video.title} providerLabel={providerLabels[video.provider]}>
                  {video.poster ? (
                    <ImageFrame
                      src={video.poster.src}
                      alt=""
                      sizes="(min-width: 1024px) 1024px, 100vw"
                      className="absolute inset-0 aspect-auto size-full"
                    />
                  ) : (
                    // Canvas cover when no poster is chosen (no third-party thumbnail).
                    <div className="absolute inset-0 flex items-center justify-center outline outline-1 -outline-offset-12 outline-highlight/40">
                      <Image
                        src="/images/logo/canvas-creations-monogram.png"
                        alt=""
                        width={804}
                        height={804}
                        sizes="160px"
                        className="w-32 opacity-80 mix-blend-multiply sm:w-40"
                      />
                    </div>
                  )}
                </VideoPlayer>
              </div>
              <figcaption className="mt-4 text-center text-sm text-muted-foreground">
                {video.caption ?? video.title}
              </figcaption>
            </figure>
          ) : (
            // Deliberately not a fake player: no play button, no poster.
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 bg-surface-ivory px-8 py-14 text-center outline outline-1 -outline-offset-12 outline-highlight/40 sm:py-16">
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
        </Reveal>
      </Container>
    </Section>
  );
}
