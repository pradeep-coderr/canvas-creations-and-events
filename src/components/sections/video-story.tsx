import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { videoStory, type VideoContent, type VideoStoryCopy } from "@/data/home";
import { site } from "@/data/site";

const tiktok = site.socials.find((s) => s.platform === "tiktok");

/**
 * Event film slot. With a local video: native player with controls, poster
 * and no autoplay (nothing moves or plays until the visitor chooses to).
 * Without one: an honest empty state pointing to the studio's TikTok.
 */
export function VideoStory({
  video = videoStory.video,
  copy = videoStory,
}: {
  video?: VideoContent | null;
  copy?: VideoStoryCopy;
}) {
  return (
    <Section aria-labelledby="video-title">
      <Container>
        <SectionHeading
          id="video-title"
          eyebrow={copy.eyebrow}
          title={copy.title}
        />

        <Reveal className="mx-auto mt-12 max-w-5xl sm:mt-14">
          {video ? (
            <figure>
              <video
                controls
                playsInline
                preload="none"
                poster={video.poster}
                aria-label={video.title}
                className="aspect-video w-full bg-muted object-cover"
              >
                <source src={video.src} />
              </video>
              {video.caption && (
                <figcaption className="mt-4 text-center text-sm text-muted-foreground">
                  {video.caption}
                </figcaption>
              )}
            </figure>
          ) : (
            // Deliberately not a fake player: no play button, no poster.
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 bg-surface-ivory px-8 py-14 text-center outline outline-1 -outline-offset-12 outline-highlight/40 sm:py-16">
              <p className="max-w-sm font-display text-display-sm text-foreground/90 italic">
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
