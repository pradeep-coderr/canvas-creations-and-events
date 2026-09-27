import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"
import { Loader2 } from "lucide-react"

// Canvas Creations button system. Variant/size keys match shadcn's so other
// shadcn components that use them keep working.
//   default   → primary. Its look (filled / outline / soft / ghost), every
//               button's corner radius and the default size come from the
//               global site theme as CSS variables (--btn-*, see globals.css
//               and src/lib/theme/css.ts). Filled = the button colour (default:
//               brand pink #F7889A with charcoal text), faint champagne
//               inner edge. Height never drops below 44px.
//   secondary → white surface, charcoal text, gold hairline border
//   ghost     → transparent, blush hover (icon buttons, quiet actions)
//   link      → text CTA with gold underline; add an arrow with
//               <ArrowRight data-icon="inline-end" /> and it nudges on hover
//   outline   → neutral bordered button (used by shadcn internals)
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-(--btn-radius) border border-transparent bg-clip-padding font-sans text-sm font-semibold tracking-[0.02em] whitespace-nowrap transition-[color,background-color,border-color,box-shadow,text-decoration-color] duration-300 ease-elegant outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&[aria-disabled=true]:not([data-pending])]:cursor-not-allowed [&[aria-disabled=true]:not([data-pending])]:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg]:transition-transform [&_svg]:duration-300 [&_svg]:ease-elegant motion-safe:group-hover/button:[&_svg[data-icon=inline-end]]:translate-x-0.5",
  {
    variants: {
      variant: {
        default:
          "border-(--btn-border) bg-(--btn-bg) text-(--btn-fg) inset-ring inset-ring-(--btn-inset) hover:bg-(--btn-hover-bg) hover:text-(--btn-hover-fg)",
        secondary:
          "border-highlight/70 bg-background text-foreground hover:border-highlight hover:bg-muted aria-expanded:bg-muted",
        outline:
          "border-foreground/20 bg-background text-foreground hover:border-foreground/35 hover:bg-muted aria-expanded:bg-muted",
        ghost:
          "text-foreground hover:bg-accent hover:text-accent-foreground aria-expanded:bg-accent",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/15 focus-visible:ring-destructive",
        link: "text-foreground underline decoration-primary/40 decoration-1 underline-offset-[6px] hover:text-primary hover:decoration-primary",
      },
      size: {
        default:
          "h-(--btn-height) px-(--btn-px) text-(length:--btn-text) has-data-[icon=inline-end]:pr-[calc(var(--btn-px)-0.25rem)] has-data-[icon=inline-start]:pl-[calc(var(--btn-px)-0.25rem)]",
        xs: "h-8 gap-1.5 px-3 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-9 gap-1.5 px-4",
        lg: "h-12 px-8 text-base has-data-[icon=inline-end]:pr-7 has-data-[icon=inline-start]:pl-7",
        icon: "size-11",
        "icon-xs": "size-8 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    compoundVariants: [
      // Text links sit on the baseline: no box height or padding.
      {
        variant: "link",
        class:
          "h-auto rounded-sm px-0 has-data-[icon=inline-end]:pr-0 has-data-[icon=inline-start]:pl-0",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

/*
 * Pending state (one pattern for every async action): pass `pending` while a
 * REAL request runs and `pendingLabel` for what's happening ("Saving…").
 * The spinner and pending label are laid over the normal label in the same
 * grid cell, so the button keeps its width; the normal label is hidden (and
 * leaves the accessible name) while pending. The button stays focusable
 * (aria-disabled, not disabled), is marked aria-busy, and ignores clicks and
 * submits until the request finishes, so nothing is sent twice. The spinner
 * only turns with motion allowed (reduced motion: a still icon + the label).
 */
function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  pending = false,
  pendingLabel,
  children,
  onClick,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    /** A real request is running: show the spinner + pendingLabel, block repeat clicks. */
    pending?: boolean
    /** What's happening, e.g. "Saving…". Without it, the spinner replaces the icon/label in place. */
    pendingLabel?: string
  }) {
  const Comp = asChild ? Slot.Root : "button"
  const busy = pending && !asChild
  // aria-disabled (nothing to do right now): looks disabled and does nothing,
  // but stays focusable, so focus isn't lost when e.g. a save finishes.
  const inactive = !asChild && (busy || props["aria-disabled"] === true || props["aria-disabled"] === "true")

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-pending={busy || undefined}
      aria-busy={busy || undefined}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
      aria-disabled={busy ? true : props["aria-disabled"]}
      onClick={
        inactive
          ? (event: React.MouseEvent<HTMLButtonElement>) => {
              event.preventDefault()
              event.stopPropagation()
            }
          : onClick
      }
    >
      {busy ? (
        <span className="grid place-items-center [&>*]:col-start-1 [&>*]:row-start-1">
          <span aria-hidden="true" className="invisible inline-flex items-center gap-2">
            {children}
          </span>
          <span className="inline-flex items-center gap-2">
            <Loader2 aria-hidden="true" className="motion-safe:animate-spin" />
            {pendingLabel ?? <span className="sr-only">Working…</span>}
          </span>
        </span>
      ) : (
        children
      )}
    </Comp>
  )
}

export { Button, buttonVariants }
