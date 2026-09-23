"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/** "YYYY-MM-DD" ↔ local Date, without timezone shifts. */
function fromIsoDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}
function toIsoDate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const display = new Intl.DateTimeFormat("en-AU", {
  weekday: "short",
  day: "numeric",
  month: "long",
  year: "numeric",
});

interface DatePickerProps {
  id: string;
  /** Id of the visible <label>; combined with the chosen date for the accessible name. */
  labelId: string;
  /** "YYYY-MM-DD" or "" (no date). */
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  /** Disable days before today. */
  disablePast?: boolean;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  ref?: React.Ref<HTMLButtonElement>;
}

/**
 * shadcn date picker (Popover + Calendar) styled like the other form
 * controls. Works with a plain "YYYY-MM-DD" string value.
 */
export function DatePicker({
  id,
  labelId,
  value,
  onChange,
  onBlur,
  placeholder = "Select a date",
  disablePast = false,
  ref,
  ...aria
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selected = value ? fromIsoDate(value) : undefined;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) onBlur?.();
      }}
    >
      <PopoverTrigger asChild>
        <button
          ref={ref}
          id={id}
          type="button"
          aria-labelledby={`${labelId} ${id}-value`}
          // aria-invalid isn't valid on buttons; the error is announced via
          // aria-describedby, and data-invalid drives the error styling.
          data-invalid={aria["aria-invalid"] || undefined}
          aria-describedby={aria["aria-describedby"]}
          className="flex h-11 w-full min-w-0 items-center justify-between gap-3 rounded-md border border-input bg-background px-4 py-2 text-left text-base text-foreground transition-[border-color,box-shadow] duration-200 outline-none hover:border-foreground/45 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 data-invalid:border-destructive data-invalid:ring-3 data-invalid:ring-destructive/15 data-[state=open]:border-ring"
        >
          <span id={`${id}-value`} className={cn("truncate", !selected && "text-muted-foreground")}>
            {selected ? display.format(selected) : placeholder}
          </span>
          <CalendarIcon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected ?? today}
          onSelect={(date) => {
            onChange(date ? toIsoDate(date) : "");
            setOpen(false);
          }}
          disabled={disablePast ? { before: today } : undefined}
          weekStartsOn={1}
          autoFocus
        />
        {selected && (
          <div className="border-t border-border p-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              Clear date
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
