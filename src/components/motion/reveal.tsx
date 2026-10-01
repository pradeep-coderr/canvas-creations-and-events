import { cn } from "@/lib/utils";

/**
 * Scroll-linked reveal (see "Scroll motion" in globals.css). The content is
 * present and visible in the server-rendered HTML. Where CSS scroll timelines
 * exist it follows the scroll position in both directions with no
 * JavaScript; elsewhere <ScrollMotion> drives the same motion from the
 * scroll position. Static for reduced-motion users. Use for below-the-fold
 * content; above-the-fold entrances use `motion-safe:animate-rise`.
 *
 *   rise  comes in rising + fading on entry, goes out fading up on exit (default)
 *   in    entry only: for tall or interactive blocks (FAQ, long text, a video
 *         player) that must never fade while still being read or watched
 *   mask  a photo opens through a clip on entry and closes on exit
 */
export function Reveal({
  variant = "rise",
  className,
  ...props
}: React.ComponentProps<"div"> & { variant?: "rise" | "in" | "mask" }) {
  const cls = variant === "mask" ? "reveal-mask" : variant === "in" ? "reveal-in" : "reveal";
  return <div className={cn(cls, className)} {...props} />;
}

/** An editorial hairline that draws across as it scrolls into view. */
export function RevealRule({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("reveal-line h-px bg-highlight/60", className)} />;
}
