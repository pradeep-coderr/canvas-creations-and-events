import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const sectionVariants = cva("py-20 sm:py-24 lg:py-32", {
  variants: {
    tone: {
      default: "bg-background",
      ivory: "bg-surface-ivory",
      blush: "bg-surface-blush",
      // `data-tone="dark"` swaps the semantic tokens (see globals.css), so
      // bg-background/text-foreground resolve to charcoal/ivory here.
      dark: "bg-background text-foreground",
    },
  },
  defaultVariants: {
    tone: "default",
  },
});

type SectionProps = React.ComponentProps<"section"> &
  VariantProps<typeof sectionVariants>;

/**
 * Page section with consistent vertical rhythm and surface.
 * Put a <Container> inside; full-bleed content can skip it.
 * Pass `aria-labelledby` pointing at the section's heading id.
 */
export function Section({ tone, className, ...props }: SectionProps) {
  return (
    <section
      data-tone={tone ?? "default"}
      className={cn(sectionVariants({ tone }), className)}
      {...props}
    />
  );
}
