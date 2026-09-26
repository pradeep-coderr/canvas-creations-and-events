import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { ImageFrame } from "@/components/shared/image-frame";
import { SectionHeading } from "@/components/shared/section-heading";
import { SiteLink } from "@/components/shared/site-link";
import { servicesSection, type ServicesCopy } from "@/data/home";
import { featuredServices, type Service } from "@/data/services";
import { site } from "@/data/site";
import { SlotItem, type ItemSlots } from "./item-slots";

// Round arrow affordance shared by linked rows; visible without hover so
// touch users can see the row is a link.
function RowArrow() {
  return (
    <span
      aria-hidden="true"
      className="flex size-11 shrink-0 items-center justify-center rounded-full border border-foreground/20 transition-[border-color,color] duration-500 ease-elegant group-hover:border-primary group-hover:text-primary"
    >
      <ArrowRight className="size-4 transition-transform duration-500 ease-elegant motion-safe:group-hover:translate-x-0.5" />
    </span>
  );
}

function ServiceRow({ service, number }: { service: Service; number?: string }) {
  const content = (
    <>
      {number && (
        <span className="pt-2 font-display text-lg text-muted-foreground tabular-nums">
          {number}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-display-md font-title transition-colors duration-500 group-hover:text-primary">
          {service.title}
        </h3>
        <p className="mt-3 max-w-md text-muted-foreground">{service.summary}</p>
      </div>
      {service.image && (
        <ImageFrame
          src={service.image.src}
          alt={service.image.alt}
          ratio="portrait"
          sizes="112px"
          className="hidden w-28 shrink-0 sm:block"
        />
      )}
      {service.href && <RowArrow />}
    </>
  );

  const row = "flex items-start gap-5 py-8 sm:gap-8 sm:py-10";
  return service.href ? (
    <SiteLink href={service.href} className={`group ${row}`}>
      {content}
    </SiteLink>
  ) : (
    <div className={row}>{content}</div>
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
      <Container className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <SectionHeading
          styleKeys={{ eyebrow: "home.servicesEyebrow", title: "home.servicesTitle", description: "home.servicesDescription" }}
          id="services-title"
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
          align="start"
          className="lg:sticky lg:top-[calc(var(--header-height)+3rem)] lg:col-span-5 lg:self-start"
        />

        <div className="border-t border-foreground/15 lg:col-span-7">
          {/* With no published services, the enquiry prompt stands alone. */}
          {services.length > 0 && (
            <ol>
              {services.map((service, i) => (
                <li key={service.id} className="border-b border-foreground/15">
                  <SlotItem slots={itemSlots} item={service}>
                    <Reveal>
                      <ServiceRow
                        service={service}
                        number={numbered ? String(i + 1).padStart(2, "0") : undefined}
                      />
                    </Reveal>
                  </SlotItem>
                </li>
              ))}
            </ol>
          )}
          {itemSlots?.after}

          <Reveal>
            <SiteLink
              href={site.enquiry.href}
              className="group flex items-center justify-between gap-6 border-b border-foreground/15 py-8 sm:py-10"
            >
              <span>
                <span className="block font-display text-display-md font-title italic transition-colors duration-500 group-hover:text-primary">
                  {copy.enquiry.title}
                </span>
                <span className="mt-2 block text-muted-foreground">
                  {copy.enquiry.text}
                </span>
              </span>
              <RowArrow />
            </SiteLink>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
