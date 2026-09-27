import { cn } from "@/lib/utils"

// shadcn skeleton, in the site's tokens: a placeholder shaped like the content
// it stands in for, used only where content is really loading. It pulses
// gently when motion is allowed and stays a still, subtle block otherwise.
// Works on light, blush and dark surfaces (it's a tint of the text colour).
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("rounded-md bg-foreground/8 motion-safe:animate-pulse", className)}
      {...props}
    />
  )
}

export { Skeleton }
