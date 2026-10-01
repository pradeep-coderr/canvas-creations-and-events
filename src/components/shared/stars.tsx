import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A 1–5 star rating, read as one image ("Rated 4 out of 5"). Filled stars in
 * the highlight colour; the rest outlined. Shape and label carry the value,
 * not colour alone.
 */
export function Stars({ rating, className, size = "size-4" }: { rating: number; className?: string; size?: string }) {
  return (
    <span role="img" aria-label={`Rated ${rating} out of 5`} className={cn("inline-flex gap-0.5", className)}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          aria-hidden="true"
          strokeWidth={1.5}
          className={cn(size, i < rating ? "fill-highlight text-highlight" : "fill-transparent text-foreground/30")}
        />
      ))}
    </span>
  );
}
