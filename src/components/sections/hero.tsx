import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { ImageFrame } from "@/components/shared/image-frame";
import { Button } from "@/components/ui/button";
import { SiteLink } from "@/components/shared/site-link";
import { hero, type HeroCopy } from "@/data/home";
import { site } from "@/data/site";
import { defaultSiteSettings, type SiteCopy } from "@/lib/cms/site-settings";

// Mobile/tablet use a shorter crop so the image doesn't dominate the scroll.
const frameRatio = "aspect-[4/3] sm:aspect-[3/2] lg:aspect-[4/5]";

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
    <section aria-labelledby="hero-title" className="bg-background">
      <Container className="grid items-center gap-12 pt-8 pb-20 sm:pt-12 sm:pb-24 lg:grid-cols-12 lg:gap-12 lg:pt-10 lg:pb-28 xl:gap-20">
        <div className="lg:col-span-7">
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
            className="mt-6 font-display text-display-xl font-title text-foreground motion-safe:animate-rise sm:mt-8"
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
            className="mt-6 max-w-lg text-lead text-muted-foreground motion-safe:animate-rise sm:mt-8"
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

          <p
            className="mt-10 text-sm text-muted-foreground motion-safe:animate-rise max-sm:text-center"
            style={{ animationDelay: "320ms" }}
          >
            <span data-sk="site.callPrompt">{settings.callPrompt}</span>{" "}
            <a
              href={settings.phone.href}
              className="font-semibold text-foreground underline decoration-primary/40 underline-offset-4 transition-colors hover:text-primary"
            >
              {settings.mobileCallLabel} {settings.phone.display}
            </a>
          </p>
        </div>

        {/* Image with an offset gold hairline frame behind it (signature entrance: globals.css "Hero signature") */}
        <div className="hero-depth relative pr-3 pb-3 sm:pr-5 sm:pb-5 lg:col-span-5">
          {/* The gold frame belongs to a photo; the monogram stands on its own. */}
          {copy.image && (
            <div
              aria-hidden="true"
              className="hero-frame absolute inset-0 top-3 left-3 border border-highlight/60 sm:top-5 sm:left-5"
            />
          )}
          {copy.image ? (
            <ImageFrame
              src={copy.image.src}
              alt={copy.image.alt}
              ratio="portrait"
              loading="eager"
              fetchPriority="high"
              sizes="(min-width: 1280px) 460px, (min-width: 1024px) 38vw, 100vw"
              className={`hero-media ${frameRatio}`}
              imageClassName={`hero-media-settle ${copy.image.position ?? ""}`}
            />
          ) : (
            // Until a hero photo is chosen: the real CC monogram on its own,
            // large, on the page background (no panel, no frame) — never a
            // fake photo. This copy has a transparent background (the white
            // was converted to transparency) and is trimmed to the artwork.
            <div className="hero-media mx-auto w-[82%] max-w-[30rem] sm:w-[62%] lg:w-full">
              <Image
                src="/images/logo/canvas-creations-cc-mark.png"
                alt=""
                width={775}
                height={533}
                loading="eager"
                fetchPriority="high"
                sizes="(min-width: 1024px) 480px, (min-width: 640px) 62vw, 82vw"
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
