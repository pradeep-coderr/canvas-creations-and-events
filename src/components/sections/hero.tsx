import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { AmbientGlow } from "@/components/motion/ambient-glow";
import { HangingSign } from "@/components/sections/hanging-sign";
import { BackgroundPhoto, backgroundSrc } from "@/components/shared/background-photo";
import { ImageFrame } from "@/components/shared/image-frame";
import { Button } from "@/components/ui/button";
import { SiteLink } from "@/components/shared/site-link";
import { DEFAULT_BACKGROUND, hero, type HeroCopy } from "@/data/home";
import { site } from "@/data/site";
import { defaultSiteSettings, type SiteCopy } from "@/lib/cms/site-settings";

// The hero's arch (a ceremony-arch window): a round top on a 4:5 panel.
const arch = "rounded-t-full";

export function Hero({
  copy = hero,
  settings = defaultSiteSettings,
  imageAction,
}: {
  copy?: HeroCopy;
  /** Headline, main button, phone (site details). */
  settings?: SiteCopy;
  /** Admin visual editor only: the "Change photo" control over the photo. */
  imageAction?: React.ReactNode;
}) {
  // The headline's emphasised ending ("masterpieces") is set in italic rose.
  const { lead, emphasis } = settings.headline;

  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-background">
      {/* The background (Edit website → Hero): a chosen library photo,
          blurred like a shallow depth of field with a wash that keeps the
          headline side calm; with none, the living glow
          (components/motion/ambient-glow). Or turned off. */}
      {copy.background.show &&
        (copy.background.image ? (
          <BackgroundPhoto
            src={backgroundSrc(copy.background.image, DEFAULT_BACKGROUND)}
            priority
            imageClassName="scale-110 blur-[5px] saturate-125 object-[center_40%]"
            washClassName="bg-background/70 lg:bg-transparent lg:bg-linear-to-r lg:from-background/90 lg:via-background/60 lg:to-background/15"
          />
        ) : (
          <AmbientGlow variant="hero" />
        ))}
      {/* Desktop: the hero fills the first screen under the header, its content centred. */}
      <Container className="grid items-center gap-14 py-12 sm:gap-16 sm:py-16 lg:min-h-[calc(100svh-var(--header-height))] lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-12 lg:gap-y-10 lg:py-14 xl:gap-x-16">
        {/* The studio's name on a wooden sign hanging over the hero (site
            details; empty hides it). */}
        {settings.heroBrand && (
          <div className="-mt-2 sm:-mt-4 lg:col-span-12 lg:-mt-2">
            {/* Not draggable in the visual editor (imageAction is set only there). */}
            <HangingSign draggable={!imageAction}>
              <span data-sk="site.heroBrand">{settings.heroBrand}</span>
            </HangingSign>
          </div>
        )}

        {/* hero-exit: eases up and softens as the page scrolls (reverses on the way back). */}
        <div className="hero-exit lg:col-span-7">
          <p
            data-sk="home.heroEyebrow"
            className="flex items-center gap-4 text-eyebrow font-semibold text-emphasis uppercase motion-safe:animate-rise"
          >
            <span aria-hidden="true" className="h-px w-10 bg-highlight" />
            {copy.eyebrow}
            <span className="sr-only"> in {site.region}</span>
          </p>

          <h1
            id="hero-title"
            data-sk="site.headlineLead"
            className="mt-6 font-display text-[clamp(2.5rem,1.4rem+4.4vw,5.5rem)] leading-[1.02] font-title tracking-[-0.015em] text-balance text-foreground motion-safe:animate-rise sm:mt-4"
            style={{ animationDelay: "80ms" }}
          >
            {lead}
            {emphasis ? (
              <>
                {" "}
                <em data-sk="site.headlineEmphasis" className="font-normal text-primary italic">
                  {emphasis}
                </em>
              </>
            ) : null}
          </h1>

          <p
            data-sk="home.heroDescription"
            className="mt-6 max-w-xl text-lead text-muted-foreground motion-safe:animate-rise sm:mt-8"
            style={{ animationDelay: "160ms" }}
          >
            {copy.description}
          </p>

          <div
            className="mt-10 flex flex-col gap-6 motion-safe:animate-rise sm:flex-row sm:items-center sm:gap-10"
            style={{ animationDelay: "240ms" }}
          >
            <Button asChild size="lg" className="w-full sm:w-auto">
              <SiteLink href={settings.enquiry.href}>{settings.enquiry.label}</SiteLink>
            </Button>
            <Button asChild variant="link" className="self-center sm:self-auto">
              <SiteLink href={copy.secondaryCta.href}>
                {copy.secondaryCta.label}
                <ArrowRight data-icon="inline-end" />
              </SiteLink>
            </Button>
          </div>

          {/* Set apart by a hairline: a quieter, secondary way in. */}
          <p
            className="mt-10 max-w-md border-t border-foreground/10 pt-6 text-sm text-muted-foreground motion-safe:animate-rise max-sm:mx-auto max-sm:text-center"
            style={{ animationDelay: "320ms" }}
          >
            <span data-sk="site.callPrompt">{settings.callPrompt}</span>{" "}
            {/* The email address with its subject (site details); the phone number if none is set. */}
            {settings.email && settings.emailLink.href ? (
              <a
                href={settings.emailLink.href}
                className="font-semibold break-all text-foreground underline decoration-primary/40 underline-offset-4 transition-colors hover:text-primary"
              >
                {settings.emailLink.label} {settings.email.address}
              </a>
            ) : (
              <a
                href={settings.phone.href}
                className="font-semibold text-foreground underline decoration-primary/40 underline-offset-4 transition-colors hover:text-primary"
              >
                {settings.mobileCallLabel} {settings.phone.display}
              </a>
            )}
          </p>
        </div>

        {/* A hero photo sits in a ceremony-arch window with an offset gold
            hairline arch behind it (signature entrance: globals.css "Hero
            signature"). Without one, the CC logo stands on its own: no
            panel, no frame (the client's wish). */}
        <div
          className={
            copy.image
              ? "hero-depth relative mx-auto w-[72%] max-w-[19rem] pr-3 pb-3 sm:w-[46%] sm:max-w-none sm:pr-5 sm:pb-5 lg:col-span-5 lg:w-full lg:max-w-[30rem] lg:justify-self-end xl:col-span-4 xl:col-start-9"
              : "hero-depth relative mx-auto w-[82%] max-w-[26rem] sm:w-[56%] lg:col-span-5 lg:w-full lg:max-w-[34rem] lg:justify-self-end xl:col-span-5 xl:col-start-8"
          }
        >
          {copy.image && (
            <div
              aria-hidden="true"
              className={`hero-frame absolute inset-0 top-3 left-3 border border-highlight/70 sm:top-5 sm:left-5 ${arch}`}
            />
          )}
          {copy.image ? (
            <ImageFrame
              src={copy.image.src}
              alt={copy.image.alt}
              ratio="portrait"
              loading="eager"
              fetchPriority="high"
              sizes="(min-width: 1024px) 480px, (min-width: 640px) 46vw, 72vw"
              className={`hero-media ${arch}`}
              imageClassName={`hero-media-settle ${copy.image.position ?? ""}`}
            />
          ) : (
            // Never a fake photo: the real CC monogram on its own (transparent,
            // trimmed to the artwork), straight on the hero background.
            <div className="hero-media">
              <Image
                src="/images/logo/canvas-creations-cc-mark.png"
                alt=""
                width={775}
                height={533}
                loading="eager"
                fetchPriority="high"
                sizes="(min-width: 1024px) 540px, (min-width: 640px) 56vw, 82vw"
                className="h-auto w-full"
              />
            </div>
          )}
          {imageAction}
        </div>
      </Container>
    </section>
  );
}
