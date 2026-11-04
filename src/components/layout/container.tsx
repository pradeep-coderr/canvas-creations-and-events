import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// The fluid side padding (--gutter, globals.css), shared with the site header so everything lines up.
const containerVariants = cva("mx-auto w-full px-(--gutter)", {
  variants: {
    size: {
      // Full width: the page uses the whole window (edge padding only)
      default: "max-w-none",
      // Reading width: editorial copy, headings, forms
      narrow: "max-w-3xl",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

type ContainerProps = React.ComponentProps<"div"> &
  VariantProps<typeof containerVariants>;

export function Container({ size, className, ...props }: ContainerProps) {
  return (
    <div className={cn(containerVariants({ size }), className)} {...props} />
  );
}
