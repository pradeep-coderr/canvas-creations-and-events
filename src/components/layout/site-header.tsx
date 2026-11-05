import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SiteLink } from "@/components/shared/site-link";
import { site } from "@/data/site";
import type { SiteCopy } from "@/lib/cms/site-settings";
import { AdminSwitch } from "./admin-switch";
import { Container } from "./container";
import { HeaderNav } from "./header-nav";
import { HeaderShell } from "./header-shell";
import { MobileMenu } from "./mobile-menu";

export function SiteHeader({ settings }: { settings: SiteCopy }) {
  return (
    <HeaderShell>
      {/* Full width with edge padding (the sections below keep their reading width). */}
      <Container className="flex h-(--header-height) max-w-none items-center justify-between gap-3 lg:gap-6">
        {/* The logo and name; a quick gold sparkle round the logo on hover (globals.css "Header ribbon"). */}
        <SiteLink href="/" className="logo-sparkle flex shrink-0 items-center gap-3 rounded-sm">
          <span className="relative shrink-0">
            <Image
              src="/images/logo/canvas-creations-logo-512.png"
              alt={site.name}
              width={512}
              height={512}
              loading="eager"
              sizes="(min-width: 1024px) 56px, 48px"
              className="size-12 lg:size-14"
            />
            {[1, 2, 3].map((n) => (
              <svg key={n} aria-hidden="true" viewBox="0 0 10 10" className={`sparkle sparkle-${n} pointer-events-none absolute`}>
                <path d="M5 0 C 5.4 3.6, 6.4 4.6, 10 5 C 6.4 5.4, 5.4 6.4, 5 10 C 4.6 6.4, 3.6 5.4, 0 5 C 3.6 4.6, 4.6 3.6, 5 0 Z" fill="#d29a49" />
              </svg>
            ))}
          </span>
          {/* Repeats the logo's alt text, so hidden from screen readers. */}
          <span aria-hidden="true" className="logo-name">
            <span className="font-display text-lg font-title sm:text-xl">{site.shortName}</span>
            <span className="logo-sub text-muted-foreground">and Events</span>
          </span>
        </SiteLink>

        <HeaderNav items={settings.navigation} />

        <div className="flex shrink-0 items-center gap-1 lg:gap-2">
          <AdminSwitch />
          <Button asChild className="hidden lg:inline-flex">
            <SiteLink href={settings.enquiry.href}>{settings.enquiry.label}</SiteLink>
          </Button>
          <MobileMenu settings={settings} />
        </div>
      </Container>
    </HeaderShell>
  );
}
