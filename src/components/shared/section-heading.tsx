import { cn } from "@/lib/utils";
import { Eyebrow } from "./eyebrow";

interface SectionHeadingProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "center" | "start";
  /** Heading level. Sections use h2; a standalone page intro may use h1. */
  as?: "h1" | "h2" | "h3";
  /** Id for the heading, to use as the section's `aria-labelledby`. */
  id?: string;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  as: Heading = "h2",
  id,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex max-w-2xl flex-col",
        align === "center" ? "mx-auto items-center text-center" : "items-start",
        className,
      )}
    >
      {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
      <Heading
        id={id}
        className="font-display text-display-lg font-title text-foreground"
      >
        {title}
      </Heading>
      {description && (
        <p className="mt-5 max-w-xl text-lead text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
