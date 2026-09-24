import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { contactSection, type ContactCopy } from "@/data/home";
import { site } from "@/data/site";

const { phone, address } = site.contact;

const linkClass =
  "underline decoration-highlight/70 decoration-1 underline-offset-[6px] transition-colors hover:text-primary hover:decoration-primary";

/** Direct contact details. Only verified information from site.ts. */
export function Contact({ copy = contactSection }: { copy?: ContactCopy }) {
  return (
    <Section id="contact" aria-labelledby="contact-title">
      <Container className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <SectionHeading
          id="contact-title"
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
          align="start"
          className="lg:col-span-6"
        />

        <Reveal className="lg:col-span-5 lg:col-start-8">
          <address className="not-italic">
            <dl className="border-t border-foreground/15">
              <div className="border-b border-foreground/15 py-6">
                <dt className="text-eyebrow font-semibold text-emphasis uppercase">Call</dt>
                <dd className="mt-2 font-display text-display-sm">
                  <a href={phone.href} className={linkClass}>
                    {phone.display}
                  </a>
                </dd>
              </div>
              <div className="border-b border-foreground/15 py-6">
                <dt className="text-eyebrow font-semibold text-emphasis uppercase">Based in</dt>
                <dd className="mt-2 font-display text-display-sm">
                  {address.street}, {address.locality} {address.region} {address.postcode}
                </dd>
              </div>
              <div className="border-b border-foreground/15 py-6">
                <dt className="text-eyebrow font-semibold text-emphasis uppercase">Follow</dt>
                <dd className="mt-2">
                  <ul className="flex flex-wrap gap-x-6 gap-y-2 font-display text-display-sm">
                    {site.socials.map((social) => (
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
              </div>
            </dl>
          </address>
        </Reveal>
      </Container>
    </Section>
  );
}
