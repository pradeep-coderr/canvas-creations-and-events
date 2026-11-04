import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import { ImageFrame } from "@/components/shared/image-frame";
import { SectionHeading } from "@/components/shared/section-heading";
import { SiteLink } from "@/components/shared/site-link";
import { WaxSeal } from "@/components/shared/wax-seal";
import { servicesSection, type ServicesCopy } from "@/data/home";
import { featuredServices, type Service } from "@/data/services";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";
import { SlotItem, type ItemSlots } from "./item-slots";

// Round arrow affordance on linked cards; visible without hover so touch
// users can see the card is a link.
function RoundArrow({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-full border border-foreground/20 transition-[border-color,color,background-color] duration-500 ease-elegant group-hover:border-primary group-hover:text-primary",
        className,
      )}
    >
      <ArrowRight className="size-4 transition-transform duration-500 ease-elegant motion-safe:group-hover:translate-x-0.5" />
    </span>
  );
}

// A place card on the section's ivory: the theme's surface (Design page:
// radius, border, shadow) with a fine gold printed frame just inside its
// edge. It tilts towards the cursor (TiltCard).
const card = "surface group relative flex h-full flex-col p-7 sm:p-8 xl:p-10";

function ServiceCard({ service, number }: { service: Service; number?: string }) {
  const content = (
    <>
      <span aria-hidden="true" className="pointer-events-none absolute inset-2 rounded-[inherit] border border-highlight/40" />
      {service.image && (
        <ImageFrame
          src={service.image.src}
          alt={service.image.alt}
          ratio="landscape"
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
          className="mb-7"
        />
      )}
      {number && (
        <span aria-hidden="true" className="font-display text-lg text-muted-foreground tabular-nums">
          {number}
        </span>
      )}
      <h3 className="mt-3 font-display text-display-md font-title transition-colors duration-500 group-hover:text-primary">
        {service.title}
      </h3>
      <p className="mt-3 text-muted-foreground">{service.summary}</p>
      {service.href && <RoundArrow className="mt-8 self-end sm:mt-auto sm:pt-0" />}
    </>
  );

  return (
    <TiltCard className="h-full">
      {service.href ? (
        <SiteLink href={service.href} className={card}>
          {content}
        </SiteLink>
      ) : (
        <div className={card}>{content}</div>
      )}
    </TiltCard>
  );
}

export function Services({
  services = featuredServices,
  copy = servicesSection,
  itemSlots,
}: {
  services?: Service[];
  copy?: ServicesCopy;
  itemSlots?: ItemSlots<Service>;
}) {
  const numbered = services.length > 1;

  return (
    <Section id="services" tone="ivory" aria-labelledby="services-title">
      <Container className="grid gap-12 lg:grid-cols-12 lg:gap-12 xl:gap-16">
        <SectionHeading
          styleKeys={{ eyebrow: "home.servicesEyebrow", title: "home.servicesTitle", description: "home.servicesDescription" }}
          id="services-title"
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
          align="start"
          className="lg:sticky lg:top-[calc(var(--header-height)+3rem)] lg:col-span-5 lg:self-start"
        />

        <div className="lg:col-span-7">
          {/* Two across from tablets. The enquiry card fills the gap after an
              odd number of services, or takes a full row after an even one. */}
          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
            {services.length > 0 && (
              <ol className="contents">
                {services.map((service, i) => (
                  <li key={service.id}>
                    <SlotItem slots={itemSlots} item={service}>
                      <Reveal className="h-full">
                        <ServiceCard service={service} number={numbered ? String(i + 1).padStart(2, "0") : undefined} />
                      </Reveal>
                    </SlotItem>
                  </li>
                ))}
              </ol>
            )}

            {/* With no published services, the enquiry card stands alone. It's
                sealed like an invitation: a wax seal stamps down on its corner
                (the right padding keeps the text clear of it). */}
            <Reveal className={cn("h-full", services.length % 2 === 0 && "sm:col-span-2")}>
              <TiltCard className="h-full">
                <SiteLink
                  href={site.enquiry.href}
                  className="group relative flex h-full flex-col justify-between gap-8 rounded-(--surface-radius) bg-surface-blush p-7 pr-24 sm:p-8 sm:pr-28 xl:p-10 xl:pr-32"
                >
                  <WaxSeal className="seal-stamp absolute -top-5 right-5 size-18 transition-[translate,filter] duration-500 ease-elegant drop-shadow-[0_6px_8px_rgb(110_30_50/0.3)] group-hover:-translate-y-1.5 group-hover:drop-shadow-[0_12px_14px_rgb(110_30_50/0.3)] sm:size-22" />
                  <span>
                    <span className="block font-display text-display-md font-title italic transition-colors duration-500 group-hover:text-primary">
                      {copy.enquiry.title}
                    </span>
                    <span className="mt-3 block text-muted-foreground">{copy.enquiry.text}</span>
                  </span>
                  <span className="flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold underline decoration-primary/40 underline-offset-4">{site.enquiry.label}</span>
                    <RoundArrow className="border-primary/40 bg-background/70" />
                  </span>
                </SiteLink>
              </TiltCard>
            </Reveal>
          </div>
          {itemSlots?.after}
        </div>
      </Container>
    </Section>
  );
}
