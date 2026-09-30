import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Reveal, RevealRule } from "@/components/motion/reveal";
import { ImageFrame } from "@/components/shared/image-frame";
import { SampleBadge, SampleNotice } from "@/components/shared/sample-badge";
import { SectionHeading } from "@/components/shared/section-heading";
import { storiesSection, type StoriesCopy } from "@/data/home";
import type { EventStory } from "@/data/stories";
import { cn } from "@/lib/utils";
import { GalleryLightbox, LightboxTrigger } from "./gallery-lightbox";
import { SlotItem, type ItemSlots } from "./item-slots";

/*
 * Event stories: celebrations told like a magazine feature. Each story has a
 * large main photo (opening through a soft mask as it scrolls in), its text
 * settling beside it, supporting photos that drift at slightly different
 * rates on large screens, and — only when the client has agreed to one — their
 * testimonial. All motion is scroll-linked CSS (globals.css), reversing on
 * the way back up. Sample stories are labelled "Sample".
 */

function StoryText({ story, headingId }: { story: EventStory; headingId: string }) {
  return (
    <div className="flex flex-col gap-5">
      {story.category && (
        <p data-sk="stories.category" className="text-eyebrow font-semibold text-emphasis uppercase">
          {story.category}
        </p>
      )}
      <h3 id={headingId} data-sk="stories.title" className="font-display text-display-md font-title">
        {story.title}
      </h3>
      <p data-sk="stories.body" className="text-muted-foreground">
        {story.description}
      </p>
      {story.styling.length > 0 && (
        <div>
          <p className="text-xs font-semibold tracking-wide uppercase">Styling</p>
          <ul data-sk="stories.body" className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-sm text-muted-foreground">
            {story.styling.map((s, i) => (
              <li key={i} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden="true" className="text-highlight">·</span>}
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
      {story.location && <p className="text-sm text-muted-foreground">{story.location}</p>}
      {story.testimonial && (
        <figure className="mt-2 border-l-2 border-highlight pl-5">
          <p className="text-xs font-semibold tracking-wide uppercase">What they said</p>
          <blockquote data-sk="stories.quote" className="mt-3 font-display text-display-sm italic">
            “{story.testimonial.quote}”
          </blockquote>
          <figcaption className="mt-3 text-sm text-muted-foreground">
            {story.testimonial.name}
            {story.testimonial.eventType && <span> · {story.testimonial.eventType}</span>}
          </figcaption>
        </figure>
      )}
    </div>
  );
}

function Story({ story, flip }: { story: EventStory; flip: boolean }) {
  const photos = [story.image, ...story.gallery];
  return (
    <GalleryLightbox
      photos={photos.map((p) => ({ src: p.src, alt: p.alt, title: story.title, sample: story.isDemo, credit: p.credit }))}
    >
      <article aria-labelledby={`story-${story.id}`} className="grid gap-8 lg:grid-cols-12 lg:gap-16">
        {/* Flipped stories swap photo and text on large screens only (the extra photos stay below). */}
        <Reveal variant="mask" className={cn("lg:col-span-7", flip && "lg:col-start-6 lg:row-start-1")}>
          <figure className="relative">
            <ImageFrame
              src={story.image.src}
              alt={story.image.alt}
              ratio="portrait"
              sizes="(min-width: 1280px) 700px, (min-width: 1024px) 58vw, 100vw"
              className="aspect-4/5 sm:aspect-3/2 lg:aspect-4/5"
            />
            {story.isDemo && <SampleBadge />}
            <LightboxTrigger index={0} label={story.image.alt} />
          </figure>
        </Reveal>
        <div className={cn("flex flex-col justify-center lg:col-span-5", flip && "lg:col-start-1 lg:row-start-1")}>
          <Reveal>
            <StoryText story={story} headingId={`story-${story.id}`} />
          </Reveal>
        </div>
        {story.gallery.length > 0 && (
          <ul className={cn("grid grid-cols-2 gap-3 sm:gap-4 lg:col-span-12 lg:gap-6", story.gallery.length >= 3 && "lg:grid-cols-3")}>
            {story.gallery.map((img, i) => (
              <li key={i} className="min-w-0">
                <Reveal>
                  <figure className={cn("relative", i % 2 ? "drift" : "drift-slow")}>
                    <ImageFrame
                      src={img.src}
                      alt={img.alt}
                      ratio="square"
                      zoomOnHover
                      sizes="(min-width: 1280px) 400px, (min-width: 1024px) 33vw, 50vw"
                      className={i % 3 === 1 ? "aspect-4/5 sm:aspect-square" : "aspect-square"}
                    />
                    {story.isDemo && <SampleBadge />}
                    <LightboxTrigger index={i + 1} label={img.alt} />
                  </figure>
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </article>
    </GalleryLightbox>
  );
}

export function EventStories({
  stories,
  copy = storiesSection,
  itemSlots,
}: {
  stories: EventStory[];
  copy?: StoriesCopy;
  itemSlots?: ItemSlots<EventStory>;
}) {
  // No published stories, no section (the editor keeps it, to add one).
  if (stories.length === 0 && !itemSlots) return null;
  const anySample = stories.some((s) => s.isDemo);

  return (
    <Section id="stories" tone="ivory" aria-labelledby="stories-title">
      <Container>
        <SectionHeading
          styleKeys={{ eyebrow: "home.storiesEyebrow", title: "home.storiesTitle" }}
          id="stories-title"
          eyebrow={copy.eyebrow}
          title={copy.title}
          align="start"
        />
        {anySample && <SampleNotice className="mt-4">{copy.sampleNotice}</SampleNotice>}

        {stories.length > 0 && (
          <ol className="mt-14 grid gap-16 sm:mt-16 lg:mt-20 lg:gap-24">
            {stories.map((story, i) => (
              <li key={story.id} className="grid gap-16 lg:gap-24">
                {i > 0 && <RevealRule />}
                <SlotItem slots={itemSlots} item={story}>
                  <Story story={story} flip={i % 2 === 1} />
                </SlotItem>
              </li>
            ))}
          </ol>
        )}
        {itemSlots?.after}
      </Container>
    </Section>
  );
}
