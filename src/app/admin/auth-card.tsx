import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { site } from "@/data/site";

/**
 * Layout for sign-in and the password-reset pages. Large screens: a brand
 * panel (logo, slogan, gold hairline frame) beside the form. Phones and
 * tablets: the logo above a single card. A quiet "Back to website" link
 * either way. Decorative parts are hidden from assistive technology.
 */
export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  /** Small print under the card (e.g. "Back to sign in"). */
  footer?: React.ReactNode;
}) {
  return (
    <main id="main" className="grid flex-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* Brand panel (large screens) */}
      <div className="relative hidden overflow-hidden bg-surface-blush lg:block" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_20%_10%,var(--cc-champagne)_0%,transparent_60%),radial-gradient(90%_70%_at_90%_100%,color-mix(in_oklab,var(--cc-rose-ink)_18%,transparent)_0%,transparent_70%)]" />
        <div className="absolute inset-8 border border-highlight/50" />
        <div className="absolute inset-10 border border-highlight/25" />
        <div className="relative flex h-full flex-col items-center justify-center px-12 text-center">
          <Image
            src="/images/logo/canvas-creations-logo-512.png"
            alt=""
            width={512}
            height={512}
            sizes="128px"
            loading="eager"
            className="size-32 drop-shadow-sm"
          />
          <p className="mt-10 text-eyebrow font-semibold tracking-[0.2em] text-emphasis uppercase">{site.name}</p>
          <p className="mt-4 max-w-sm font-display text-display-md font-title text-foreground italic">
            {site.slogan}
          </p>
          <span className="mt-8 h-px w-16 bg-highlight" />
          <p className="mt-6 text-sm text-muted-foreground">Admin · enquiries, reviews, calendar and website</p>
        </div>
      </div>

      {/* Form side */}
      <div className="flex flex-col px-5 py-6 sm:px-8">
        <div>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to website
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-md">
            <div className="text-center lg:text-left">
              <Image
                src="/images/logo/canvas-creations-logo-512.png"
                alt={site.name}
                width={512}
                height={512}
                sizes="72px"
                loading="eager"
                className="mx-auto size-18 lg:hidden"
              />
              <h1 className="mt-5 font-display text-display-md font-title lg:mt-0">{title}</h1>
              {description && <p className="mt-3 text-muted-foreground">{description}</p>}
            </div>
            <div className="mt-8 rounded-xl border border-border bg-background p-6 shadow-[0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-12px_rgb(48_42_41/0.18)] sm:p-8">
              {children}
            </div>
            {footer && <div className="mt-6 text-center text-sm text-muted-foreground lg:text-left">{footer}</div>}
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground lg:text-left">
          Private area for the {site.shortName} team.
        </p>
      </div>
    </main>
  );
}
