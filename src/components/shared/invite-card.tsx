import { cn } from "@/lib/utils";

/*
 * A printed invitation card: heavy ivory stock, a fine double gold border
 * and a gold flourish in each corner. Each flourish draws itself in as it
 * scrolls into view (globals.css "Invitation card"); static and complete
 * with reduced motion. The frame and flourishes are decorative only.
 */
const CORNERS = ["tl", "tr", "bl", "br"] as const;

export function InviteCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("invite-card relative bg-[#fffdf8] px-6 py-12 sm:px-12 sm:py-14", className)}>
      <span aria-hidden="true" className="invite-frame pointer-events-none absolute" />
      {CORNERS.map((corner) => (
        <svg key={corner} aria-hidden="true" viewBox="0 0 48 48" className={`invite-corner invite-corner-${corner} pointer-events-none absolute overflow-visible`}>
          {/* Drawn for the top-left corner; CSS mirrors it for the others. */}
          <path className="invite-flourish" pathLength={1} d="M4 44 L 4 15 C 4 8.5, 8.5 4, 15 4 L 44 4" />
          <path className="invite-flourish" pathLength={1} d="M10 34 C 10 19, 19 10, 34 10" />
          <path className="invite-flourish" pathLength={1} d="M24 24 C 18 24, 15.5 18, 19.5 15.5 C 23 13.5, 26.5 17.5, 23 19.5" />
          <circle cx="30" cy="30" r="1.6" fill="var(--cc-gold)" />
        </svg>
      ))}
      <div className="relative">{children}</div>
    </div>
  );
}
