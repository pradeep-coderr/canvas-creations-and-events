"use client";

import * as React from "react";
import { CalendarIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { MonthYearPanel } from "@/components/ui/month-year-panel";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";
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
const toMonth = (date: Date) => toIsoDate(date).slice(0, 7);
const fromMonth = (month: string) => fromIsoDate(`${month}-01`);

const display = new Intl.DateTimeFormat("en-AU", {
  weekday: "short",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const caption = new Intl.DateTimeFormat("en-AU", { month: "long", year: "numeric" });

interface DatePickerProps {
  id: string;
  /** Id of the visible <label>; combined with the chosen date for the accessible name. */
  labelId: string;
  /** "YYYY-MM-DD" or "" (no date). */
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  /** Title of the phone sheet, e.g. "Event date". */
  title?: React.ReactNode;
  /** Disable days before today. */
  disablePast?: boolean;
  /** How many years ahead can be chosen (default 5). */
  yearsAhead?: number;
  /** Offer "Clear date" (default true). */
  clearable?: boolean;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  ref?: React.Ref<HTMLButtonElement>;
}

/**
 * Date picker styled like the other form controls, with a plain
 * "YYYY-MM-DD" value.
 *
 * - The heading ("October 2026 ▾") opens a month-and-year grid, so any month
 *   or year is one or two taps away; the arrows still step a month.
 * - Phones get a bottom sheet with larger (44 px) days; wider screens a
 *   popover under the field.
 * - "Go to today" appears when browsing another month; "Clear date" when a
 *   date is set.
 */
export function DatePicker({
  id,
  labelId,
  value,
  onChange,
  onBlur,
  placeholder = "Select a date",
  title = "Choose a date",
  disablePast = false,
  yearsAhead = 5,
  clearable = true,
  ref,
  ...aria
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const phone = useMediaQuery("(max-width: 39.99rem)");
  const selected = value ? fromIsoDate(value) : undefined;

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) onBlur?.();
  };
  const panel = (
    <DatePickerPanel
      selected={selected}
      disablePast={disablePast}
      yearsAhead={yearsAhead}
      clearable={clearable}
      large={phone}
      onPick={(date) => {
        onChange(date ? toIsoDate(date) : "");
        onOpenChange(false);
      }}
    />
  );

  const trigger = (
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
  );

  if (phone) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent
          side="bottom"
          className="max-h-[92dvh] gap-0 overflow-y-auto rounded-t-2xl pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          <SheetHeader className="pb-0">
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription className="sr-only">
              Tap the month heading to jump to another month or year.
            </SheetDescription>
          </SheetHeader>
          <div className="flex justify-center px-2">{panel}</div>
        </SheetContent>
      </Sheet>
    );
  }
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        {panel}
      </PopoverContent>
    </Popover>
  );
}

function DatePickerPanel({
  selected,
  disablePast,
  yearsAhead,
  clearable,
  large,
  onPick,
}: {
  selected: Date | undefined;
  disablePast: boolean;
  yearsAhead: number;
  clearable: boolean;
  large: boolean;
  onPick: (date: Date | undefined) => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMonth = toMonth(today);
  const minMonth = disablePast ? todayMonth : undefined;
  const maxMonth = `${today.getFullYear() + yearsAhead}-12`;

  const [month, setMonth] = React.useState(toMonth(selected ?? today));
  const [view, setView] = React.useState<"days" | "months">("days");
  const captionRef = React.useRef<HTMLButtonElement>(null);
  const atMin = minMonth !== undefined && month <= minMonth;
  const atMax = month >= maxMonth;
  const step = (delta: number) => {
    const d = fromMonth(month);
    d.setMonth(d.getMonth() + delta);
    setMonth(toMonth(d));
  };

  return (
    <div className={cn("grid p-3", large ? "w-full max-w-sm" : "w-[19.5rem]")}>
      <div className="flex items-center justify-between gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Previous month"
          disabled={view === "months" || atMin}
          className={cn(view === "months" && "invisible")}
          onClick={() => step(-1)}
        >
          <ChevronLeftIcon aria-hidden="true" />
        </Button>
        <button
          ref={captionRef}
          type="button"
          aria-expanded={view === "months"}
          aria-label={
            view === "days"
              ? `${caption.format(fromMonth(month))}. Choose month and year`
              : "Back to days"
          }
          onClick={() => setView((v) => (v === "days" ? "months" : "days"))}
          className="inline-flex h-10 items-center gap-1.5 rounded-md px-3 font-display text-lg font-title outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          <span aria-live="polite">{caption.format(fromMonth(month))}</span>
          <ChevronDownIcon
            aria-hidden="true"
            className={cn("size-4 text-muted-foreground transition-transform", view === "months" && "rotate-180")}
          />
        </button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Next month"
          disabled={view === "months" || atMax}
          className={cn(view === "months" && "invisible")}
          onClick={() => step(1)}
        >
          <ChevronRightIcon aria-hidden="true" />
        </Button>
      </div>

      {view === "months" ? (
        <MonthYearPanel
          className="mt-2 min-h-[18.5rem] content-start"
          value={month}
          current={todayMonth}
          min={minMonth}
          max={maxMonth}
          onSelect={(m) => {
            setMonth(m);
            setView("days");
            requestAnimationFrame(() => captionRef.current?.focus());
          }}
        />
      ) : (
        <Calendar
          mode="single"
          className={cn("p-0 pt-1", large ? "w-full [--cell-size:--spacing(11)]" : "")}
          classNames={{ root: "rdp-root w-full", month_caption: "sr-only" }}
          month={fromMonth(month)}
          onMonthChange={(d) => setMonth(toMonth(d))}
          hideNavigation
          startMonth={minMonth ? fromMonth(minMonth) : undefined}
          endMonth={fromMonth(maxMonth)}
          selected={selected}
          // Tapping the chosen day again keeps it (and closes).
          onSelect={(date) => onPick(date ?? selected)}
          disabled={disablePast ? { before: today } : undefined}
          weekStartsOn={1}
          fixedWeeks
          autoFocus
        />
      )}

      {(month !== todayMonth || (clearable && selected)) && (
        <div className="mt-2 flex items-center justify-between gap-2 border-t border-border pt-2">
          {month !== todayMonth ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setMonth(todayMonth);
                setView("days");
              }}
            >
              Go to today
            </Button>
          ) : (
            <span />
          )}
          {clearable && selected && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onPick(undefined)}>
              Clear date
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
