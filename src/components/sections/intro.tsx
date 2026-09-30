import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { DecorativeDivider } from "@/components/shared/decorative-divider";
import { SectionHeading } from "@/components/shared/section-heading";
import { intro, type IntroCopy } from "@/data/home";

/** A calm editorial pause after the hero: who the studio is, in brief. */
export function Intro({ copy = intro }: { copy?: IntroCopy }) {
  return (
    <Section
      id="intro"
      aria-labelledby="intro-title"
      // The hero already ends with generous space; keep the gap deliberate.
      className="pt-8 sm:pt-12 lg:pt-16"
    >
      <Container size="narrow">
        <Reveal>
          <SectionHeading
          styleKeys={{ eyebrow: "home.introEyebrow", title: "home.introTitle", description: "home.introBody" }}
            id="intro-title"
            eyebrow={copy.eyebrow}
            title={copy.title}
            description={copy.body}
            className="max-w-3xl [&_p:last-child]:max-w-2xl"
          />
        </Reveal>
        {/* The divider draws out from its centre as it scrolls into view. */}
        <div className="reveal-line [transform-origin:center]">
          <DecorativeDivider className="mt-14 sm:mt-16" />
        </div>
      </Container>
    </Section>
  );
}
