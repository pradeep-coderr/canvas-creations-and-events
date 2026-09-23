import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const containerVariants = cva("mx-auto w-full px-5 sm:px-8 lg:px-10", {
  variants: {
    size: {
      // 1280px box → 1200px of content at desktop
      default: "max-w-7xl",
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
