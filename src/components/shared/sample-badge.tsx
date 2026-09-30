import { cn } from "@/lib/utils";

/**
 * Marks temporary sample content (is_demo) so it's never mistaken for a
 * real Canvas Creations event. Small and quiet, but always visible and
 * spoken.
 */
export function SampleBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute bottom-3 left-3 z-[2] rounded-full bg-background/90 px-2.5 py-1 text-[0.6875rem] font-semibold tracking-wide text-foreground uppercase",
        className,
      )}
    >
      Sample<span className="sr-only"> image, not a Canvas Creations event</span>
    </span>
  );
}

/** One line under a section heading while any of its content is sample content. */
export function SampleNotice({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p data-sk="home.sampleNotice" className={cn("text-sm text-muted-foreground italic", className)}>
      {children}
    </p>
  );
}
