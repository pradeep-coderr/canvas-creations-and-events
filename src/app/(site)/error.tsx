"use client";

import { Button } from "@/components/ui/button";
import { site } from "@/data/site";

/** Branded fallback for unexpected errors on the public site (no details shown). */
export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main" className="flex flex-1 items-center justify-center bg-surface-ivory px-5 py-20">
      <div className="max-w-md text-center">
        <h1 className="font-display text-display-md font-medium">Something went wrong.</h1>
        <p className="mt-4 text-muted-foreground">
          Please try again. If it keeps happening, call us on{" "}
          <a href={site.contact.phone.href} className="font-semibold text-foreground underline decoration-highlight/70 underline-offset-4">
            {site.contact.phone.display}
          </a>
          .
        </p>
        <Button size="lg" className="mt-8" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  );
}
