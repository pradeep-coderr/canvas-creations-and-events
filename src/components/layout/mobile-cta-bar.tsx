"use client";

import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import { SiteLink } from "@/components/shared/site-link";
import { Button } from "@/components/ui/button";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";

/**
 * Mobile-only quick actions (Call / Enquire). Shown only while none of the
 * hero, enquiry, contact or footer areas is on screen — those already offer
 * the same actions — so it never covers the form, the keyboard or the end
 * of the page. Hidden bars are inert (not focusable or announced).
 */
export function MobileCtaBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const targets = [
      document.getElementById("hero-title")?.closest("section"),
      document.getElementById("enquire"),
      document.getElementById("contact"),
      document.querySelector("footer"),
    ].filter((el): el is HTMLElement => el instanceof HTMLElement);
    if (targets.length === 0) return;

    const onScreen = new Map<Element, boolean>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) onScreen.set(entry.target, entry.isIntersecting);
      setVisible(![...onScreen.values()].some(Boolean));
    });
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      inert={!visible}
      aria-hidden={!visible}
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] transition-transform duration-500 ease-elegant motion-reduce:transition-none lg:hidden",
        visible ? "translate-y-0" : "translate-y-full",
      )}
    >
      <nav aria-label="Quick contact" className="flex gap-3 px-5 py-3">
        <Button asChild variant="secondary" className="flex-1">
          <a href={site.contact.phone.href}>
            <Phone data-icon="inline-start" />
            Call
          </a>
        </Button>
        <Button asChild className="flex-1">
          <SiteLink href={site.enquiry.href}>Enquire</SiteLink>
        </Button>
      </nav>
    </div>
  );
}
