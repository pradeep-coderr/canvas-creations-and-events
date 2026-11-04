import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Heart, Mail, MapPin, Phone, type LucideIcon } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { contactSection, type ContactCopy } from "@/data/home";
import { AddressText } from "@/components/shared/address-text";
import { defaultSiteSettings, type SiteCopy } from "@/lib/cms/site-settings";

const linkClass =
  "underline decoration-primary/40 decoration-1 underline-offset-[6px] transition-colors hover:text-primary hover:decoration-primary";
const labelClass = "text-eyebrow font-semibold text-emphasis uppercase";

// Each card's resting tilt, in turn.
const TILTS = [-1.6, 1.2, -0.8, 1.5];

/**
 * A printed calling card: ivory stock, a fine gold border and a gold line
 * icon. The outer element is dealt in by the scroll; the inner card holds
 * the tilt and lifts on hover. Its content is a <dt>/<dd> pair.
 */
function CallingCard({ icon: Icon, index, children }: { icon: LucideIcon; index: number; children: React.ReactNode }) {
  return (
    <div className="calling-card" style={{ "--i": index, "--tilt": `${TILTS[index % TILTS.length]}deg` } as React.CSSProperties}>
      <div className="calling-card-face relative h-full bg-[#fffdf8] px-6 pt-6 pb-7">
        <span aria-hidden="true" className="pointer-events-none absolute inset-2 border border-[#d29a49]/45" />
        <span aria-hidden="true" className="relative mb-4 flex size-10 items-center justify-center rounded-full border border-[#d29a49]/70 text-[#b28443]">
          <Icon className="size-5" strokeWidth={1.5} />
        </span>
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}

/**
 * Direct contact details (site details: phone, email, address, social links).
 * Laptops: the heading beside the details. Wide screens (xl+): the heading,
 * then the four details in one row, so there's no empty middle.
 */
export function Contact({
  copy = contactSection,
  settings = defaultSiteSettings,
}: {
  copy?: ContactCopy;
  settings?: SiteCopy;
}) {
  const { phone, email, address } = settings;
  return (
    <Section id="contact" aria-labelledby="contact-title">
      <Container className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <SectionHeading
          styleKeys={{ eyebrow: "home.contactEyebrow", title: "home.contactTitle", description: "home.contactDescription" }}
          id="contact-title"
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
          align="start"
          className="lg:col-span-5 xl:col-span-12"
        />

        {/* Each detail is a printed calling card, dealt onto the table as it
            scrolls in, resting a little askew; hovering lifts and
            straightens it (globals.css "Calling cards"). */}
        <address className="not-italic lg:col-span-7 lg:col-start-6 xl:col-span-12 xl:col-start-1">
          <dl className="grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
            <CallingCard icon={Phone} index={0}>
              <dt className={labelClass}>{settings.mobileCallLabel}</dt>
              <dd className="mt-2 font-display text-display-sm">
                <a href={phone.href} className={linkClass}>
                  {phone.display}
                </a>
              </dd>
            </CallingCard>
            {email && (
              <CallingCard icon={Mail} index={1}>
                <dt className={labelClass}>Email</dt>
                <dd className="calling-card-email mt-2 font-display leading-snug">
                  <a href={email.href} className={linkClass}>
                    {email.address}
                  </a>
                </dd>
              </CallingCard>
            )}
            <CallingCard icon={MapPin} index={2}>
              <dt className={labelClass} data-sk="site.basedInLabel">{settings.basedInLabel}</dt>
              <dd className="mt-2 font-display text-display-sm">
                <AddressText address={address} />
              </dd>
            </CallingCard>
            <CallingCard icon={Heart} index={3}>
              <dt className={labelClass}>{settings.footerHeadings.follow}</dt>
              <dd className="mt-2">
                <ul className="flex flex-wrap gap-x-5 gap-y-1 font-display text-display-sm">
                  {settings.socials.map((social) => (
                    <li key={social.platform}>
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={linkClass}
                      >
                        {social.label}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </dd>
            </CallingCard>
          </dl>
        </address>
      </Container>
    </Section>
  );
}
