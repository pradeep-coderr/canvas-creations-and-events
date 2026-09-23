import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SiteLink } from "@/components/shared/site-link";
import { site } from "@/data/site";
import { Container } from "./container";
import { HeaderShell } from "./header-shell";
import { MobileMenu } from "./mobile-menu";

export function SiteHeader() {
  return (
    <HeaderShell>
      <Container className="flex h-(--header-height) items-center justify-between gap-8">
        <SiteLink href="/" className="shrink-0 rounded-full">
          <Image
            src="/images/logo/canvas-creations-logo-512.png"
            alt={site.name}
            width={512}
            height={512}
            loading="eager"
            sizes="(min-width: 1024px) 72px, 52px"
            className="size-13 lg:size-18"
          />
        </SiteLink>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-9 xl:gap-11">
            {site.navigation.map((item) => (
              <li key={item.href}>
                <SiteLink
                  href={item.href}
                  className="relative py-2 text-sm font-medium tracking-[0.04em] text-foreground/80 transition-colors duration-300 after:absolute after:inset-x-0 after:bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-highlight after:transition-transform after:duration-500 after:ease-elegant hover:text-foreground hover:after:scale-x-100"
                >
                  {item.label}
                </SiteLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center">
          <Button asChild className="hidden lg:inline-flex">
            <SiteLink href={site.enquiry.href}>{site.enquiry.label}</SiteLink>
          </Button>
          <MobileMenu />
        </div>
      </Container>
    </HeaderShell>
  );
}
