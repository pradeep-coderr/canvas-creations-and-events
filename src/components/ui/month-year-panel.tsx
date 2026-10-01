"use client";

import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** "YYYY-MM" months. */
type Month = string;

const monthNames = Array.from({ length: 12 }, (_, i) =>
  new Date(Date.UTC(2000, i, 1)).toLocaleDateString("en-AU", { month: "short", timeZone: "UTC" }),
);
const longMonthNames = Array.from({ length: 12 }, (_, i) =>
  new Date(Date.UTC(2000, i, 1)).toLocaleDateString("en-AU", { month: "long", timeZone: "UTC" }),
);
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Jump to any month: a year stepper over a 3 × 4 grid of months. Used by the
 * date picker (tap its "October 2026" heading) and the admin calendar header,
 * so changing the month or year is one or two taps instead of many arrows.
 * Months outside `min`/`max` are disabled.
 */
export function MonthYearPanel({
  value,
  current,
  min,
  max,
  onSelect,
  className,
}: {
  /** The month being shown (highlighted, and where the panel opens). */
  value: Month;
  /** This month (marked with a dot). */
  current?: Month;
  min?: Month;
  max?: Month;
  onSelect: (month: Month) => void;
  className?: string;
}) {
  const [year, setYear] = React.useState(Number(value.slice(0, 4)));
  const minYear = min ? Number(min.slice(0, 4)) : -Infinity;
  const maxYear = max ? Number(max.slice(0, 4)) : Infinity;
  const gridRef = React.useRef<HTMLDivElement>(null);

  // Focus the shown month, so the keyboard starts where the eye is.
  React.useEffect(() => {
    gridRef.current?.querySelector<HTMLButtonElement>("[aria-pressed=true]")?.focus();
  }, []);

  return (
    <div className={cn("grid gap-3", className)}>
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Previous year, ${year - 1}`}
          disabled={year - 1 < minYear}
          onClick={() => setYear((y) => y - 1)}
        >
          <ChevronLeftIcon aria-hidden="true" />
        </Button>
        <p aria-live="polite" className="font-display text-xl font-title tabular-nums">
          {year}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Next year, ${year + 1}`}
          disabled={year + 1 > maxYear}
          onClick={() => setYear((y) => y + 1)}
        >
          <ChevronRightIcon aria-hidden="true" />
        </Button>
      </div>
      <div ref={gridRef} role="group" aria-label={`Months of ${year}`} className="grid grid-cols-3 gap-1.5">
        {monthNames.map((name, i) => {
          const month = `${year}-${pad(i + 1)}`;
          const shown = month === value;
          const disabled = (min !== undefined && month < min) || (max !== undefined && month > max);
          return (
            <button
              key={month}
              type="button"
              disabled={disabled}
              aria-pressed={shown}
              aria-label={`${longMonthNames[i]} ${year}${month === current ? ", this month" : ""}`}
              onClick={() => onSelect(month)}
              className={cn(
                "relative flex h-12 items-center justify-center rounded-md text-sm font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
                shown ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                disabled && "pointer-events-none opacity-35",
              )}
            >
              {name}
              {month === current && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute bottom-1.5 size-1 rounded-full",
                    shown ? "bg-primary-foreground" : "bg-primary",
                  )}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
