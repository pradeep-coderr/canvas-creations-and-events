import { cn } from "@/lib/utils";

/** A tiny gold satin bow (two loops, a knot, two tails). Decorative only. */
export function MiniBow({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 14" className={cn("overflow-visible", className)}>
      <path d="M12 7 L 8.6 13.2 L 10.6 12.6 L 11.4 13.6 Z" fill="#b28443" />
      <path d="M12 7 L 15.4 13.2 L 13.4 12.6 L 12.6 13.6 Z" fill="#b28443" />
      <path d="M12 7 C 8 1, 2 0.8, 2 5.6 C 2 9.8, 8 9.6, 12 7 Z" fill="#d29a49" stroke="#9f6b2b" strokeWidth="0.6" />
      <path d="M12 7 C 16 1, 22 0.8, 22 5.6 C 22 9.8, 16 9.6, 12 7 Z" fill="#d9a85c" stroke="#9f6b2b" strokeWidth="0.6" />
      <ellipse cx="12" cy="7" rx="2.1" ry="2.5" fill="#e9c98a" stroke="#9f6b2b" strokeWidth="0.6" />
    </svg>
  );
}
