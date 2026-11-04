import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/shared/eyebrow";
import { SiteLink } from "@/components/shared/site-link";
import { Button } from "@/components/ui/button";
import { about, type AboutCopy } from "@/data/home";
import { site } from "@/data/site";

/** "Meet Neha – The Creative Mind…": the name leads, the rest is a softer subtitle. */
function splitTitle(title: AboutCopy["title"]) {
  if (typeof title !== "string") return { lead: title, rest: null };
  const match = title.match(/^(.+?)\s+[–—-]\s+(.+)$/);
  return match ? { lead: match[1], rest: match[2] } : { lead: title, rest: null };
}

/** A short final paragraph (3+ paragraphs, under 100 characters) reads as the closing line. */
function splitBody(body: AboutCopy["body"]) {
  const last = body.at(-1);
  const closing = body.length >= 3 && typeof last === "string" && last.length < 100 ? last : null;
  return { paragraphs: closing ? body.slice(0, -1) : body, closing };
}

// The sample cards in the corner of the mood board: the brand's colours.
const CHIPS = [
  ["#a6b898", "-26deg"],
  ["#ebd2ad", "-9deg"],
  ["#cc7e91", "8deg"],
  ["#f7889a", "24deg"],
] as const;

/**
 * The human side of the brand: the founder on a stylist's mood board (an
 * upright photo taped onto a blush panel, with colour sample cards; globals.css
 * "Mood board") beside her story, which closes on her handwritten note
 * card. Desktop: the portrait stays in view while the story scrolls past.
 * Phones: the portrait comes first, smaller.
 */
export function AboutFounder({
  copy = about,
  imageAction,
}: {
  copy?: AboutCopy;
  /** Admin visual editor only: the "Change photo" control over the photo. */
  imageAction?: React.ReactNode;
}) {
  const { lead, rest } = splitTitle(copy.title);
  const { paragraphs, closing } = splitBody(copy.body);

  return (
    <Section id="about" aria-labelledby="about-title">
      <Container className="grid gap-12 sm:gap-16 lg:grid-cols-12 lg:gap-12 xl:gap-16">
        <div className="lg:col-span-5 xl:col-span-5">
          <div className="moodboard reveal-in relative mx-auto mb-10 w-[66%] max-w-[19rem] sm:w-[44%] sm:max-w-none lg:sticky lg:top-[calc(var(--header-height)+3rem)] lg:mr-[6%] lg:ml-auto lg:w-[74%] lg:max-w-[27rem]">
            <span aria-hidden="true" className="mb-panel" />
            <div className="mb-photo">
              <div className="mb-photo-inner">
                {copy.image ? (
                  <Image
                    src={copy.image.src}
                    alt={copy.image.alt}
                    fill
                    sizes="(min-width: 1024px) 800px, (min-width: 640px) 75vw, 100vw"
                    className={`object-cover ${copy.image.position ?? ""}`}
                  />
                ) : (
                  // Until a real founder/studio photo exists: the CC monogram
                  // on a soft panel (never a fake portrait).
                  <div className="grid size-full place-items-center bg-surface-blush">
                    <Image
                      src="/images/logo/canvas-creations-cc-mark.png"
                      alt=""
                      width={775}
                      height={533}
                      sizes="(min-width: 1024px) 360px, 50vw"
                      className="mb-monogram h-auto w-[72%]"
                    />
                  </div>
                )}
              </div>
            </div>
            <span aria-hidden="true" className="mb-tape mb-tape-a" />
            <span aria-hidden="true" className="mb-tape mb-tape-b" />
            <span aria-hidden="true" className="mb-chips">
              {CHIPS.map(([colour, angle]) => (
                <span key={colour} className="mb-chip" style={{ "--chip": colour, "--a": angle } as React.CSSProperties} />
              ))}
            </span>
            {imageAction}
          </div>
        </div>

        <Reveal variant="in" className="lg:col-span-7 lg:pt-4 xl:col-span-6 xl:col-start-7">
          <Eyebrow data-sk="about.eyebrow" className="max-lg:text-center">
            {copy.eyebrow}
          </Eyebrow>
          <h2 id="about-title" data-sk="about.title" className="mt-4 font-display font-title text-foreground max-lg:text-center">
            <span className="block text-display-lg">{lead}</span>
            {rest && (
              <span className="mt-3 block text-display-sm text-balance text-muted-foreground italic">{rest}</span>
            )}
          </h2>

          <div aria-hidden="true" className="mt-8 h-px w-16 bg-highlight max-lg:mx-auto" />

          <div data-sk="about.body" className="mt-8 max-w-[38rem] space-y-5 text-lead text-muted-foreground max-lg:mx-auto">
            {paragraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          {/* The closing line as Neha's handwritten note card, taped beside her
              story and signed (globals.css "Note card"). Without a closing
              line, the name and role stand on their own. */}
          {closing ? (
            <figure className="note-card relative mx-auto mt-12 max-w-[26rem] bg-[#fffaf2] px-7 pt-9 pb-7 shadow-[0_16px_30px_-14px_rgb(70_40_15/0.45)] lg:mx-0 lg:ml-6">
              {/* Washi tape holding it on. */}
              <span aria-hidden="true" className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-3 bg-[color-mix(in_srgb,var(--cc-blush-soft)_80%,transparent)] shadow-[0_1px_2px_rgb(0_0_0/0.08)]" />
              {/* Faint ruled lines, like notepaper. */}
              <span aria-hidden="true" className="pointer-events-none absolute inset-x-7 top-9 bottom-16 bg-[repeating-linear-gradient(180deg,transparent_0_calc(2.25rem-1px),rgb(204_126_145/0.18)_calc(2.25rem-1px)_2.25rem)]" />
              <blockquote className="relative font-script text-[1.65rem] leading-[2.25rem] text-[#4a3b33]">{closing}</blockquote>
              {copy.founder && (
                <figcaption className="relative mt-5 text-right">
                  <span data-sk="about.founderName" className="font-script text-[2.1rem] leading-none text-primary">
                    {copy.founder.name}
                  </span>
                </figcaption>
              )}
            </figure>
          ) : (
            copy.founder && (
              <p data-sk="about.founderName" className="mt-10 font-display text-display-md text-primary italic max-lg:text-center">
                {copy.founder.name}
              </p>
            )
          )}
          {copy.founder?.role && (
            <p data-sk="about.founderRole" className="mt-6 text-eyebrow font-semibold text-muted-foreground uppercase max-lg:text-center lg:ml-6">
              {copy.founder.role}, {site.name}
            </p>
          )}

          <div className="max-lg:text-center">
            <Button asChild variant="link" className="mt-10">
              <SiteLink href={copy.cta.href}>
                {copy.cta.label}
                <ArrowRight data-icon="inline-end" />
              </SiteLink>
            </Button>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
