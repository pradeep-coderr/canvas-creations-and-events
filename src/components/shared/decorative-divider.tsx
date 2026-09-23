import { cn } from "@/lib/utils";

/**
 * Fine gold hairline with a small botanical sprig at its centre.
 * Purely decorative: hidden from assistive technology.
 */
export function DecorativeDivider({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex items-center justify-center gap-3 text-highlight",
        className,
      )}
    >
      <span className="h-px w-16 bg-linear-to-r from-transparent to-current opacity-70 sm:w-24" />
      <svg
        viewBox="0 0 48 16"
        className="h-4 w-12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      >
        <path d="M20 8C17 4.5 12.5 4 9 6.5 12.5 11 17 11 20 8Z" />
        <path d="M28 8c3-3.5 7.5-4 11-1.5C35.5 11 31 11 28 8Z" />
        <path d="M9 6.5 3 8M39 6.5 45 8" />
        <path
          d="M24 5l2.2 3L24 11l-2.2-3L24 5Z"
          fill="currentColor"
          stroke="none"
        />
      </svg>
      <span className="h-px w-16 bg-linear-to-l from-transparent to-current opacity-70 sm:w-24" />
    </div>
  );
}
