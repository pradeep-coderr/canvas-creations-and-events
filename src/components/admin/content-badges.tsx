import { cn } from "@/lib/utils";

const badge = "inline-flex rounded-sm border px-2 py-0.5 text-xs font-semibold whitespace-nowrap";

/** "Published" / "Draft" in words; the style only reinforces it. */
export function VisibilityBadge({ published }: { published: boolean }) {
  return (
    <span className={cn(badge, published ? "border-primary bg-primary text-primary-foreground" : "border-dashed border-foreground/40 text-muted-foreground")}>
      {published ? "Published" : "Draft"}
    </span>
  );
}

/** Temporary sample material (is_demo): impossible to miss in the admin. */
export function SampleContentBadge() {
  return (
    <span className={cn(badge, "border-destructive/60 bg-background text-destructive uppercase tracking-wide")}>
      Sample / demo content
    </span>
  );
}

export function FeaturedBadge() {
  return <span className={cn(badge, "border-highlight-strong bg-surface-ivory text-foreground")}>Featured</span>;
}
