import Image from "next/image";
import { cn } from "@/lib/utils";

/** The photo's address (a library photo, or the built-in one when there's none). */
export function backgroundSrc(image: { src: string | { src: string } } | null | undefined, fallback: string) {
  const src = image?.src;
  return typeof src === "string" ? src : (src?.src ?? fallback);
}

/**
 * A decorative photo behind a section, kept quiet so the section's own text
 * and design lead: a wash in the page colour sits over it (it follows the
 * theme). The section needs `relative isolate overflow-hidden`.
 */
export function BackgroundPhoto({
  src,
  priority = false,
  // Blurred and washed over: half the width is plenty, and much lighter.
  sizes = "50vw",
  className,
  imageClassName,
  washClassName,
}: {
  src: string;
  /** The hero: load it straight away (but not ahead of the hero's own image). */
  priority?: boolean;
  sizes?: string;
  /** Where the photo sits (defaults to the whole section). */
  className?: string;
  imageClassName?: string;
  /** The wash over the photo (replaces the default even wash). */
  washClassName?: string;
}) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 -z-10", className)}>
      <Image
        src={src}
        alt=""
        fill
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        className={cn("object-cover", imageClassName)}
      />
      <div className={cn("absolute inset-0", washClassName ?? "bg-background/85")} />
    </div>
  );
}
