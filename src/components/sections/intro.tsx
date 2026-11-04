import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { AmbientGlow } from "@/components/motion/ambient-glow";
import { Reveal } from "@/components/motion/reveal";
import { BackgroundPhoto, backgroundSrc } from "@/components/shared/background-photo";
import { RibbonBow } from "@/components/shared/ribbon-bow";
import { SectionHeading } from "@/components/shared/section-heading";
import { DEFAULT_BACKGROUND, hero, intro, type HeroCopy, type IntroCopy } from "@/data/home";

/** A calm editorial pause after the hero: who the studio is, in brief. */
export function Intro({
  copy = intro,
  background = hero.background,
}: {
  copy?: IntroCopy;
  /** The hero's background photo (the same photo, set in Edit website → Hero). */
  background?: HeroCopy["background"];
}) {
  return (
    <Section
      id="intro"
      aria-labelledby="intro-title"
      // The hero already ends with generous space; keep the gap deliberate.
      // overflow-clip, not hidden: hidden would make the section a scroll
      // container, freezing the view() scroll animations inside it.
      className="relative isolate overflow-clip pt-8 sm:pt-12 lg:pt-16"
    >
      {/* The hero's ballroom photo again, zoomed towards its floral side and
          blurred further; washed most in the centre, behind the text. */}
      {/* No photo picked: the living glow, as in the hero. */}
      {background.show &&
        (background.image ? (
          <BackgroundPhoto
            src={backgroundSrc(background.image, DEFAULT_BACKGROUND)}
            imageClassName="origin-[95%_85%] scale-[1.35] blur-[8px] saturate-125 object-[center_85%]"
            washClassName="bg-background/80 sm:bg-transparent sm:bg-[radial-gradient(ellipse_at_center,color-mix(in_oklab,var(--background)_90%,transparent)_30%,color-mix(in_oklab,var(--background)_55%,transparent)_100%)]"
          />
        ) : (
          <AmbientGlow variant="intro" />
        ))}
      <Container size="narrow">
        <Reveal>
          <SectionHeading
            styleKeys={{ eyebrow: "home.introEyebrow", title: "home.introTitle", description: "home.introBody" }}
            id="intro-title"
            eyebrow={copy.eyebrow}
            // Written in gold ink as it scrolls in (globals.css "Gold ink").
            title={<span className="ink-write">{copy.title}</span>}
            description={copy.body}
            className="max-w-3xl [&_p:last-child]:max-w-2xl"
          />
        </Reveal>
        {/* A satin ribbon that ties itself into a bow as it scrolls into view. */}
        <RibbonBow className="mt-14 sm:mt-16" />
      </Container>
    </Section>
  );
}
