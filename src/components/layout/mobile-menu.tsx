"use client";

import Image from "next/image";
import Link from "next/link";
import { MenuIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { site } from "@/data/site";

/**
 * Mobile navigation (below lg). Radix Dialog provides the focus trap,
 * Escape-to-close, focus return and aria-expanded/aria-controls.
 */
export function MobileMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="gap-2.5 px-3 lg:hidden">
          <span className="text-eyebrow font-semibold uppercase">Menu</span>
          <MenuIcon className="size-5" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        showCloseButton={false}
        className="gap-0 bg-surface-ivory"
      >
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <SheetDescription className="sr-only">
          Site navigation and enquiry
        </SheetDescription>

        <div className="flex h-(--header-height) shrink-0 items-center justify-between px-5 sm:px-8">
          <Image
            src="/images/logo/canvas-creations-logo-512.png"
            alt=""
            width={512}
            height={512}
            sizes="52px"
            className="size-13"
          />
          <SheetClose asChild>
            <Button variant="ghost" className="gap-2.5 px-3">
              <span className="text-eyebrow font-semibold uppercase">Close</span>
              <XIcon className="size-5" />
            </Button>
          </SheetClose>
        </div>

        <nav aria-label="Main" className="flex-1 overflow-y-auto px-5 pt-6 sm:px-8">
          <ul className="border-t border-highlight/40">
            {site.navigation.map((item, i) => (
              <li
                key={item.href}
                className="border-b border-highlight/40 motion-safe:animate-rise"
                style={{ animationDelay: `${120 + i * 50}ms` }}
              >
                <SheetClose asChild>
                  <Link
                    href={item.href}
                    className="block py-3.5 font-display text-display-sm font-medium transition-colors duration-300 hover:text-primary"
                  >
                    {item.label}
                  </Link>
                </SheetClose>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-5 px-5 pt-8 pb-8 sm:px-8">
          <SheetClose asChild>
            <Button asChild size="lg" className="w-full">
              <Link href={site.enquiry.href}>{site.enquiry.label}</Link>
            </Button>
          </SheetClose>
          <p className="text-center text-sm text-muted-foreground">
            Prefer to talk?{" "}
            <a
              href={site.contact.phone.href}
              className="font-semibold text-foreground underline decoration-highlight/70 underline-offset-4 hover:text-primary"
            >
              Call {site.contact.phone.display}
            </a>
          </p>
          <ul className="flex justify-center gap-6 text-sm">
            {site.socials.map((social) => (
              <li key={social.platform}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  {social.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  );
}
