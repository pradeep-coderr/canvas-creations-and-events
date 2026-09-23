import { cn } from "@/lib/utils";

/**
 * Small uppercase label above a heading. Rose on light surfaces, champagne
 * on dark ones (via the `emphasis` token) — both pass AA at this size.
 */
export function Eyebrow({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "font-sans text-eyebrow font-semibold text-emphasis uppercase",
        className,
      )}
      {...props}
    />
  );
}
