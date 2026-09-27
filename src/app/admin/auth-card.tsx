import Image from "next/image";
import { site } from "@/data/site";

/** The centred card used by sign-in and the password-reset pages. */
export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <main id="main" className="flex flex-1 items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <Image
            src="/images/logo/canvas-creations-logo-512.png"
            alt={site.name}
            width={512}
            height={512}
            sizes="72px"
            loading="eager"
            className="mx-auto size-18"
          />
          <h1 className="mt-6 font-display text-display-sm font-title">{title}</h1>
          {description && <p className="mt-3 text-sm text-muted-foreground">{description}</p>}
        </div>
        <div className="mt-8 bg-background p-6 sm:p-8">{children}</div>
      </div>
    </main>
  );
}
