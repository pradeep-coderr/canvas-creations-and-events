import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { site } from "@/data/site";

export const metadata: Metadata = { title: "Page not found" };

/** Site-wide 404 in the brand style. Next.js adds noindex to 404 responses. */
export default function NotFound() {
  return (
    <main id="main" className="flex flex-1 items-center justify-center bg-surface-ivory px-5 py-20">
      <div className="max-w-md text-center">
        <Image
          src="/images/logo/canvas-creations-logo-512.png"
          alt={site.name}
          width={512}
          height={512}
          sizes="80px"
          loading="eager"
          className="mx-auto size-20"
        />
        <p className="mt-8 text-eyebrow font-semibold text-emphasis uppercase">Page not found</p>
        <h1 className="mt-4 font-display text-display-md font-medium">
          This page doesn&apos;t exist.
        </h1>
        <p className="mt-4 text-muted-foreground">
          The link may be old or mistyped. You&apos;ll find everything on our homepage.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/">Back to the homepage</Link>
        </Button>
      </div>
    </main>
  );
}
