"use client";

import { Button } from "@/components/ui/button";
import { useSiteContact } from "@/components/shared/site-contact";

/** Branded fallback for unexpected errors on the public site (no details shown). */
export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  // Phone and email from Site details (built-in defaults if they couldn't load).
  const { phone, email } = useSiteContact();
  return (
    <main id="main" className="flex flex-1 items-center justify-center bg-surface-ivory px-5 py-20">
      <div className="max-w-md text-center">
        <h1 className="font-display text-display-md font-title">Something went wrong.</h1>
        <p className="mt-4 text-muted-foreground">
          Please try again. If it keeps happening, call us on{" "}
          <a href={phone.href} className="font-semibold text-foreground underline decoration-primary/40 underline-offset-4">
            {phone.display}
          </a>
          {email && (
            <>
              {" "}or email{" "}
              <a href={email.href} className="font-semibold break-all text-foreground underline decoration-primary/40 underline-offset-4">
                {email.address}
              </a>
            </>
          )}
          .
        </p>
        <Button size="lg" className="mt-8" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  );
}
