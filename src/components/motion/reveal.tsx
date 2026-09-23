import { cn } from "@/lib/utils";

/**
 * Fades and lifts its content in as it scrolls into view.
 *
 * Pure CSS (`reveal` utility in globals.css, scroll-driven animation): the
 * content is always present and visible in the server-rendered HTML, needs
 * no JavaScript, and is static for reduced-motion users or browsers without
 * scroll timelines. Use for below-the-fold content; above-the-fold entrances
 * use `motion-safe:animate-rise` instead.
 */
export function Reveal({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("reveal", className)} {...props} />;
}
