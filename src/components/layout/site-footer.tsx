import Image from "next/image";
import { Eyebrow } from "@/components/shared/eyebrow";
import { SiteLink } from "@/components/shared/site-link";
import { site } from "@/data/site";
import { AddressText } from "@/components/shared/address-text";
import type { SiteCopy } from "@/lib/cms/site-settings";
import { Container } from "./container";

const linkClass = "transition-colors hover:text-primary";

export function SiteFooter({ settings }: { settings: SiteCopy }) {
  const { phone, address } = settings;
  // Evaluated at build time for static pages; a yearly rebuild keeps it current.
  const year = new Date().getFullYear();

  return (
    <footer data-tone="dark" className="bg-background text-foreground">
      <Container className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8 lg:py-20">
        <div className="sm:col-span-2 lg:col-span-4">
          <Image
            src="/images/logo/canvas-creations-logo-512.png"
            alt={site.name}
            width={512}
            height={512}
            sizes="80px"
            className="size-20"
          />
          <p data-sk="site.footerTagline" className="mt-6 max-w-xs font-display text-display-sm text-foreground/90 italic">
            {settings.footerTagline}
          </p>
        </div>

        <nav aria-label="Footer" className="lg:col-span-3 lg:col-start-6">
          <Eyebrow data-sk="site.footerExploreHeading">{settings.footerHeadings.explore}</Eyebrow>
          <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-1">
            {[...settings.navigation, settings.enquiry].map((item) => (
              <li key={item.href}>
                <SiteLink href={item.href} className={linkClass}>
                  {item.label}
                </SiteLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-10 lg:col-span-4">
          <div>
            <Eyebrow data-sk="site.footerContactHeading">{settings.footerHeadings.contact}</Eyebrow>
            <address className="mt-5 space-y-3 text-sm not-italic">
              <p>
                <a href={phone.href} className={linkClass}>
                  {phone.display}
                </a>
              </p>
              {settings.email && (
                <p>
                  <a href={settings.email.href} className={linkClass}>
                    {settings.email.address}
                  </a>
                </p>
              )}
              <p className="text-muted-foreground">
                <AddressText address={address} />
              </p>
            </address>
          </div>
          <div>
            <Eyebrow data-sk="site.footerFollowHeading">{settings.footerHeadings.follow}</Eyebrow>
            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm">
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
          </div>
        </div>
      </Container>

      <div className="border-t border-border">
        <Container className="py-6 text-sm text-muted-foreground">
          <p>
            © {year} {site.name}
          </p>
        </Container>
      </div>
    </footer>
  );
}
