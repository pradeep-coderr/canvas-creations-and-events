import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { ImageFrame } from "@/components/shared/image-frame";
import { SectionHeading } from "@/components/shared/section-heading";
import { SiteLink } from "@/components/shared/site-link";
import { Button } from "@/components/ui/button";
import { about, type AboutCopy } from "@/data/home";

/** The human side of the brand: portrait slot beside the studio's story. */
export function AboutFounder({
  copy = about,
  imageAction,
}: {
  copy?: AboutCopy;
  /** Admin visual editor only: the "Change photo" control over the photo. */
  imageAction?: React.ReactNode;
}) {
  return (
    <Section id="about" aria-labelledby="about-title">
      <Container className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16 xl:gap-24">
        {/* Text first in the DOM (reading order); the image leads visually on desktop. */}
        <Reveal variant="in" className="lg:col-span-6 lg:col-start-7">
          <SectionHeading
          styleKeys={{ eyebrow: "about.eyebrow", title: "about.title" }}
            id="about-title"
            eyebrow={copy.eyebrow}
            title={copy.title}
            align="start"
          />
          <div data-sk="about.body" className="mt-8 max-w-xl space-y-5 text-lead text-muted-foreground">
            {copy.body.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
          {/* Only once the client has added a real name (never invented). */}
          {copy.founder && (
            <p className="mt-6 text-sm">
              <span data-sk="about.founderName" className="font-semibold">{copy.founder.name}</span>
              {copy.founder.role && (
                <span className="text-muted-foreground">
                  , <span data-sk="about.founderRole">{copy.founder.role}</span>
                </span>
              )}
            </p>
          )}
          <Button asChild variant="link" className="mt-10">
            <SiteLink href={copy.cta.href}>
              {copy.cta.label}
              <ArrowRight data-icon="inline-end" />
            </SiteLink>
          </Button>
        </Reveal>

        <Reveal variant="mask" className="relative lg:order-first lg:col-span-5">
          {copy.image ? (
            <ImageFrame
              src={copy.image.src}
              alt={copy.image.alt}
              ratio="portrait"
              sizes="(min-width: 1280px) 460px, (min-width: 1024px) 38vw, 100vw"
              imageClassName={copy.image.position}
              className="aspect-4/3 sm:aspect-3/2 lg:aspect-4/5"
            />
          ) : (
            // Portrait slot until a real founder/studio photo exists: the
            // full logo on blush, so the section still carries the brand.
            <div className="flex aspect-4/3 items-center justify-center bg-surface-blush sm:aspect-3/2 lg:aspect-4/5">
              <Image
                src="/images/logo/canvas-creations-logo-512.png"
                alt=""
                width={512}
                height={512}
                sizes="(min-width: 1024px) 240px, 40vw"
                className="w-[40%] max-w-60 mix-blend-multiply"
              />
            </div>
          )}
          {imageAction}
        </Reveal>
      </Container>
    </Section>
  );
}
