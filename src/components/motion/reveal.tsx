import { cn } from "@/lib/utils";

/**
 * Scroll-linked reveal (see "Scroll motion" in globals.css). Pure CSS: the
 * content is present and visible in the server-rendered HTML, needs no
 * JavaScript, follows the scroll position in both directions, and is static
 * for reduced-motion users or browsers without scroll timelines. Use for
 * below-the-fold content; above-the-fold entrances use `motion-safe:animate-rise`.
 *
 *   rise  fade + short rise (default)
 *   mask  a photo opens through a soft clip while it settles (wrap an image)
 */
export function Reveal({
  variant = "rise",
  className,
  ...props
}: React.ComponentProps<"div"> & { variant?: "rise" | "mask" }) {
  return <div className={cn(variant === "mask" ? "reveal-mask" : "reveal", className)} {...props} />;
}

/** An editorial hairline that draws across as it scrolls into view. */
export function RevealRule({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("reveal-line h-px bg-highlight/60", className)} />;
}
