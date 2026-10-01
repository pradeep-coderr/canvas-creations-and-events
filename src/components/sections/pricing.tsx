import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { SiteLink } from "@/components/shared/site-link";
import { Button } from "@/components/ui/button";
import { pricingSection, type PricingCopy } from "@/data/home";
import type { PricingPackage } from "@/data/pricing";
import { site } from "@/data/site";
import { formatPackagePrice } from "@/lib/cms/collections";
import { cn } from "@/lib/utils";
import { SlotItem, type ItemSlots } from "./item-slots";

const DEFAULT_CTA = "Enquire about this package";

/** The price line. Custom quotes show words, never an amount. */
function Price({ pkg }: { pkg: PricingPackage }) {
  const text = formatPackagePrice({
    priceType: pkg.priceType,
    price: pkg.price,
    prefix: pkg.pricePrefix,
    suffix: pkg.priceSuffix,
  });
  const hasAmount = pkg.priceType !== "custom_quote" && pkg.price !== null;
  return (
    <p data-sk="pricing.packagePrice" className="font-display text-display-md font-title text-foreground tabular-nums">
      {text}
      {hasAmount && <span className="sr-only"> (Australian dollars)</span>}
    </p>
  );
}

function PackageBody({ pkg, single = false }: { pkg: PricingPackage; single?: boolean }) {
  return (
    <>
      {pkg.description && (
        <p data-sk="pricing.packageBody" className={cn("text-muted-foreground", single ? "text-lead" : "")}>
          {pkg.description}
        </p>
      )}
      {pkg.features.length > 0 && (
        <ul className="border-t border-foreground/15">
          {pkg.features.map((feature, i) => (
            <li
              key={i}
              data-sk="pricing.packageBody"
              className="flex gap-3 border-b border-foreground/15 py-3 text-sm leading-relaxed"
            >
              <span aria-hidden="true" className="mt-2.5 h-px w-3 shrink-0 bg-highlight" />
              <span className="min-w-0">{feature}</span>
            </li>
          ))}
        </ul>
      )}
      <Button asChild variant={pkg.featured || single ? "default" : "outline"} size="lg" className="mt-auto w-full sm:w-auto">
        <SiteLink href={site.enquiry.href}>
          <span data-sk="pricing.cta">{pkg.ctaLabel ?? DEFAULT_CTA}</span>
          <span className="sr-only">: {pkg.title}</span>
        </SiteLink>
      </Button>
    </>
  );
}

/**
 * Packages, presented editorially (not a pricing table). Nothing is shown
 * until a real package is published: no packages, no section. One package
 * gets a single feature layout; two or three sit side by side from lg.
 */
export function Pricing({
  packages,
  copy = pricingSection,
  itemSlots,
}: {
  packages: PricingPackage[];
  copy?: PricingCopy;
  itemSlots?: ItemSlots<PricingPackage>;
}) {
  // The editor passes itemSlots so the (empty) section stays editable there.
  if (packages.length === 0 && !itemSlots) return null;
  const single = packages.length === 1;

  return (
    <Section id="pricing" aria-labelledby="pricing-title">
      <Container>
        <SectionHeading
          styleKeys={{ eyebrow: "home.pricingEyebrow", title: "home.pricingTitle", description: "home.pricingDescription" }}
          id="pricing-title"
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description ?? undefined}
        />

        {single ? (
          <SlotItem slots={itemSlots} item={packages[0]}>
            <Reveal variant="in">
              <article
                aria-labelledby={`package-${packages[0].id}`}
                className="mx-auto mt-12 grid max-w-5xl gap-10 border-y border-highlight/60 py-10 sm:mt-16 sm:py-14 lg:grid-cols-12 lg:gap-16"
              >
                <div className="lg:col-span-5">
                  <h3
                    id={`package-${packages[0].id}`}
                    data-sk="pricing.packageTitle"
                    className="font-display text-display-lg font-title"
                  >
                    {packages[0].title}
                  </h3>
                  <div className="mt-5">
                    <Price pkg={packages[0]} />
                  </div>
                </div>
                <div className="flex flex-col gap-8 lg:col-span-7">
                  <PackageBody pkg={packages[0]} single />
                </div>
              </article>
            </Reveal>
          </SlotItem>
        ) : (
          packages.length > 0 && (
            <ul
              className={cn(
                "mt-12 grid gap-6 sm:mt-16 md:grid-cols-2 lg:gap-8",
                packages.length === 2 ? "mx-auto max-w-5xl" : "lg:grid-cols-3",
              )}
            >
              {packages.map((pkg) => (
                <li key={pkg.id} className="min-w-0">
                  <SlotItem slots={itemSlots} item={pkg}>
                    <Reveal className="h-full">
                      <article
                        aria-labelledby={`package-${pkg.id}`}
                        data-featured={pkg.featured || undefined}
                        className={cn(
                          "flex h-full flex-col gap-7 border p-7 sm:p-9",
                          pkg.featured
                            ? "border-highlight bg-surface-ivory outline-1 -outline-offset-8 outline-highlight/40 outline"
                            : "border-foreground/15",
                        )}
                      >
                        <div>
                          <h3
                            id={`package-${pkg.id}`}
                            data-sk="pricing.packageTitle"
                            className="font-display text-display-md font-title"
                          >
                            {pkg.title}
                          </h3>
                          <div className="mt-4">
                            <Price pkg={pkg} />
                          </div>
                        </div>
                        <PackageBody pkg={pkg} />
                      </article>
                    </Reveal>
                  </SlotItem>
                </li>
              ))}
            </ul>
          )
        )}
        {itemSlots?.after}
      </Container>
    </Section>
  );
}
