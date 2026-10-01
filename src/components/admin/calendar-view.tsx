"use client";

import { useId, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, List, Pencil, Plus, Trash2 } from "lucide-react";
import { deleteReminder, saveReminder, setReminderCompleted } from "@/app/admin/(portal)/calendar/actions";
import { StatusBadge } from "@/app/admin/(portal)/status-badge";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MonthYearPanel } from "@/components/ui/month-year-panel";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { describeActionFailure } from "@/lib/admin/action-error";
import {
  addDays,
  dayLabel,
  monthGrid,
  monthLabel,
  shiftMonth,
  timeLabel,
  type CalendarEnquiry,
  type CalendarItem,
  type CalendarReminder,
  type ReminderValues,
} from "@/lib/calendar";
import { cn } from "@/lib/utils";

/*
 * The admin calendar: enquiries on their event dates and reminders.
 * Month and Agenda views. The month is a full grid from tablet width; on
 * phones it is a compact grid (dots for what's on, swipe for the next or
 * previous month) with the chosen day's items listed under it. The month
 * heading opens a month-and-year picker to jump anywhere.
 * Every change goes through the reminder server actions with a real pending
 * state; the page data refreshes after each save.
 */

type Option = { id: string; name: string; date: string | null };

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function byTime(a: CalendarItem, b: CalendarItem) {
  const at = a.kind === "reminder" ? (a.time ?? "00:00") : "00:00";
  const bt = b.kind === "reminder" ? (b.time ?? "00:00") : "00:00";
  return at.localeCompare(bt);
}

export function CalendarView({
  today,
  now,
  month,
  view,
  openNew,
  enquiries,
  reminders,
  overdue,
  enquiryOptions,
}: {
  today: string;
  now: string;
  month: string;
  view: "month" | "agenda";
  openNew: boolean;
  enquiries: CalendarEnquiry[];
  reminders: CalendarReminder[];
  overdue: CalendarReminder[];
  enquiryOptions: Option[];
}) {
  const [editing, setEditing] = useState<CalendarReminder | "new" | null>(openNew ? "new" : null);
  const [newDate, setNewDate] = useState(today);
  const [deleting, setDeleting] = useState<CalendarReminder | null>(null);
  const [status, setStatus] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);
  const addRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  const items: CalendarItem[] = [...enquiries, ...reminders];
  const byDate = new Map<string, CalendarItem[]>();
  for (const item of items) byDate.set(item.date, [...(byDate.get(item.date) ?? []), item]);
  for (const list of byDate.values()) list.sort(byTime);

  const href = (m: string, v = view) => `/admin/calendar?month=${m}${v === "agenda" ? "&view=agenda" : ""}`;
  const isOverdue = (r: CalendarReminder) => !r.completed && r.dueAt < now;

  const addOn = (date: string) => {
    setNewDate(date);
    setEditing("new");
  };

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-display-md font-title">Calendar</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enquiries on their event dates, and your reminders. Times are Adelaide time.
          </p>
        </div>
        <Button ref={addRef} type="button" onClick={() => addOn(today)}>
          <Plus data-icon="inline-start" aria-hidden="true" />
          Add reminder
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-y border-border py-3">
        <div className="flex items-center gap-1 sm:gap-2">
          <Button asChild variant="outline">
            <Link href={href(today.slice(0, 7)) as never}>Today</Link>
          </Button>
          <Button asChild variant="ghost" size="icon" aria-label="Previous month">
            <Link href={href(shiftMonth(month, -1)) as never}>
              <ChevronLeft aria-hidden="true" />
            </Link>
          </Button>
          <MonthJump month={month} today={today} onJump={(m) => router.push(href(m) as never)} />
          <Button asChild variant="ghost" size="icon" aria-label="Next month">
            <Link href={href(shiftMonth(month, 1)) as never}>
              <ChevronRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <nav aria-label="Calendar view" className="ml-auto flex gap-1">
          <Link
            href={href(month, "month") as never}
            aria-current={view === "month" ? "page" : undefined}
            className={cn(
              "inline-flex h-11 items-center gap-2 border-b-2 px-3 text-sm font-semibold",
              view === "month" ? "border-primary" : "border-transparent text-muted-foreground",
            )}
          >
            <CalendarDays aria-hidden="true" className="size-4" /> Month
          </Link>
          <Link
            href={href(month, "agenda") as never}
            aria-current={view === "agenda" ? "page" : undefined}
            className={cn(
              "inline-flex h-11 items-center gap-2 border-b-2 px-3 text-sm font-semibold",
              view === "agenda" ? "border-primary" : "border-transparent text-muted-foreground",
            )}
          >
            <List aria-hidden="true" className="size-4" /> Agenda
          </Link>
        </nav>
      </div>

      <p role="status" className="-my-4 min-h-5 text-sm">
        {status?.kind === "success" && <span className="text-muted-foreground">{status.text}</span>}
      </p>
      <p role="alert" className="-mt-4 text-sm font-medium text-destructive empty:hidden">
        {status?.kind === "error" ? status.text : ""}
      </p>

      {overdue.length > 0 && (
        <section aria-labelledby="overdue-title" className="border-l-2 border-destructive bg-background p-4">
          <h2 id="overdue-title" className="text-sm font-semibold">
            Overdue ({overdue.length})
          </h2>
          <ul className="mt-2 grid gap-2">
            {overdue.map((r) => (
              <ReminderRow
                key={r.id}
                reminder={r}
                overdue
                onEdit={() => setEditing(r)}
                onDelete={() => setDeleting(r)}
                onStatus={setStatus}
              />
            ))}
          </ul>
        </section>
      )}

      {view === "month" ? (
        <MonthView
          key={month}
          onMonth={(m) => router.push(href(m) as never)}
          month={month}
          today={today}
          byDate={byDate}
          isOverdue={isOverdue}
          onAdd={addOn}
          onEdit={setEditing}
          onDelete={setDeleting}
          onStatus={setStatus}
        />
      ) : (
        <AgendaView
          today={today}
          byDate={byDate}
          isOverdue={isOverdue}
          onEdit={setEditing}
          onDelete={setDeleting}
          onStatus={setStatus}
        />
      )}

      <ReminderDialog
        key={editing === "new" ? `new-${newDate}` : (editing?.id ?? "closed")}
        open={editing !== null}
        reminder={editing === "new" ? null : editing}
        defaultDate={newDate}
        enquiryOptions={enquiryOptions}
        onClose={() => setEditing(null)}
        onSaved={(text) => {
          setEditing(null);
          setStatus({ kind: "success", text });
        }}
        returnFocus={addRef}
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this reminder?"
        description={<p>“{deleting?.title}” will be permanently deleted.</p>}
        confirmLabel="Delete reminder"
        destructive
        returnFocus={addRef}
        onConfirm={async () => {
          if (!deleting) return;
          try {
            const result = await deleteReminder(deleting.id);
            if (!result.ok) return result.error;
            setStatus({ kind: "success", text: result.message });
          } catch (error) {
            return describeActionFailure(error).text;
          }
        }}
      />
    </div>
  );
}

/** The month heading: opens a month-and-year picker to jump anywhere. */
function MonthJump({ month, today, onJump }: { month: string; today: string; onJump: (month: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`${monthLabel(month)}. Choose month and year`}
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-md px-2 font-display text-display-sm font-title outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/40 sm:min-w-44"
        >
          <span aria-live="polite">{monthLabel(month)}</span>
          <ChevronDown aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="center" className="w-72 p-3">
        <MonthYearPanel
          value={month}
          current={today.slice(0, 7)}
          onSelect={(m) => {
            setOpen(false);
            if (m !== month) onJump(m);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

type DayHandlers = {
  isOverdue: (r: CalendarReminder) => boolean;
  onEdit: (r: CalendarReminder) => void;
  onDelete: (r: CalendarReminder) => void;
  onStatus: (s: { kind: "success" | "error"; text: string }) => void;
};

function MonthView({
  month,
  today,
  byDate,
  onAdd,
  onMonth,
  ...handlers
}: {
  month: string;
  today: string;
  byDate: Map<string, CalendarItem[]>;
  onAdd: (date: string) => void;
  onMonth: (month: string) => void;
} & DayHandlers) {
  const days = monthGrid(month);
  const inMonth = (d: string) => d.startsWith(month);
  // Phones: the chosen day (today when it is in this month, else the first
  // day with something on, else the 1st). The view is keyed by month.
  const [selected, setSelected] = useState(
    () =>
      (today.startsWith(month) ? today : null) ??
      days.find((d) => inMonth(d) && byDate.has(d)) ??
      `${month}-01`,
  );

  return (
    <>
      <div className="hidden md:block">
        <div
          role="grid"
          aria-label={monthLabel(month)}
          className="grid grid-cols-7 border-t border-l border-border bg-background"
        >
          <div role="row" className="contents">
            {weekdays.map((w) => (
              <div
                key={w}
                role="columnheader"
                className="border-r border-b border-border px-2 py-2 text-xs font-semibold text-muted-foreground"
              >
                {w}
              </div>
            ))}
          </div>
          {Array.from({ length: 6 }, (_, week) => (
            <div key={week} role="row" className="contents">
              {days.slice(week * 7, week * 7 + 7).map((d) => {
                const list = byDate.get(d) ?? [];
                return (
                  <div
                    key={d}
                    role="gridcell"
                    aria-label={`${dayLabel(d)}${d === today ? ", today" : ""}${list.length ? `, ${list.length} item${list.length === 1 ? "" : "s"}` : ""}`}
                    className={cn(
                      "group/day min-h-28 min-w-0 border-r border-b border-border p-1.5",
                      !inMonth(d) && "bg-muted/60 text-muted-foreground",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "inline-flex size-7 items-center justify-center rounded-full text-sm",
                          d === today && "bg-primary font-semibold text-primary-foreground",
                        )}
                      >
                        {Number(d.slice(8))}
                        {d === today && <span className="sr-only"> (today)</span>}
                      </span>
                      <button
                        type="button"
                        // Hidden until hover with a mouse; always shown on touch screens.
                        className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity group-hover/day:opacity-100 hover:bg-muted focus-visible:opacity-100 pointer-coarse:opacity-100"
                        aria-label={`Add reminder on ${dayLabel(d)}`}
                        onClick={() => onAdd(d)}
                      >
                        <Plus aria-hidden="true" className="size-4" />
                      </button>
                    </div>
                    <ul className="mt-1 grid min-w-0 grid-cols-1 gap-1">
                      {list.slice(0, 3).map((item) => (
                        <li key={`${item.kind}-${item.id}`} className="min-w-0">
                          <Chip
                            item={item}
                            overdue={item.kind === "reminder" && handlers.isOverdue(item)}
                            onEdit={handlers.onEdit}
                          />
                        </li>
                      ))}
                      {list.length > 3 && (
                        <li>
                          <MoreItems date={d} list={list} isOverdue={handlers.isOverdue} onEdit={handlers.onEdit} />
                        </li>
                      )}
                    </ul>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:hidden">
        <CompactMonth
          month={month}
          today={today}
          days={days}
          byDate={byDate}
          isOverdue={handlers.isOverdue}
          selected={selected}
          onSelect={setSelected}
          onMonth={onMonth}
        />
        <section aria-labelledby="selected-day-title" className="grid gap-3">
          <div className="flex items-center justify-between gap-3 border-b border-border pb-2">
            <h2 id="selected-day-title" className="flex flex-wrap items-center gap-2 text-sm font-semibold">
              {dayLabel(selected)}
              {selected === today && (
                <span className="rounded-sm bg-primary px-2 py-0.5 text-xs text-primary-foreground">Today</span>
              )}
            </h2>
            <Button type="button" variant="outline" size="sm" onClick={() => onAdd(selected)}>
              <Plus data-icon="inline-start" aria-hidden="true" />
              Add<span className="sr-only"> reminder on {dayLabel(selected)}</span>
            </Button>
          </div>
          <DayItems list={byDate.get(selected) ?? []} {...handlers} />
        </section>
      </div>
    </>
  );
}

/** Desktop grid: all of a busy day's items, in a popover. */
function MoreItems({
  date,
  list,
  isOverdue,
  onEdit,
}: {
  date: string;
  list: CalendarItem[];
  isOverdue: (r: CalendarReminder) => boolean;
  onEdit: (r: CalendarReminder) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-full rounded-sm px-1.5 py-0.5 text-left text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          +{list.length - 3} more<span className="sr-only"> on {dayLabel(date)}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="grid w-64 gap-2 p-3">
        <p className="text-sm font-semibold">{dayLabel(date)}</p>
        <ul className="grid gap-1">
          {list.map((item) => (
            <li key={`${item.kind}-${item.id}`} className="min-w-0">
              <Chip item={item} overdue={item.kind === "reminder" && isOverdue(item)} onEdit={onEdit} />
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Phones: a compact month grid. Each day is a button (48 px tall) with up to
 * three dots for what is on: enquiries (rose), reminders (gold), overdue
 * (red). Arrow keys move between days; swiping left or right changes month.
 */
function CompactMonth({
  month,
  today,
  days,
  byDate,
  isOverdue,
  selected,
  onSelect,
  onMonth,
}: {
  month: string;
  today: string;
  days: string[];
  byDate: Map<string, CalendarItem[]>;
  isOverdue: (r: CalendarReminder) => boolean;
  selected: string;
  onSelect: (date: string) => void;
  onMonth: (month: string) => void;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const inMonth = (d: string) => d.startsWith(month);
  const first = `${month}-01`;
  const last = days.filter(inMonth).at(-1)!;

  const move = (date: string) => {
    if (date < first || date > last) return;
    onSelect(date);
    requestAnimationFrame(() => gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${date}"]`)?.focus());
  };
  const onKeyDown = (event: React.KeyboardEvent, d: string) => {
    const delta = ({ ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 } as Record<string, number>)[event.key];
    if (delta !== undefined) {
      event.preventDefault();
      move(addDays(d, delta));
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      move(event.key === "Home" ? first : last);
    }
  };

  return (
    <div
      ref={gridRef}
      role="grid"
      aria-label={`${monthLabel(month)}. Swipe or use the arrows above to change month.`}
      className="touch-pan-y select-none"
      onPointerDown={(e) => {
        if (e.pointerType !== "mouse") swipe.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={(e) => {
        const start = swipe.current;
        swipe.current = null;
        if (!start) return;
        const dx = e.clientX - start.x;
        const dy = e.clientY - start.y;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) onMonth(shiftMonth(month, dx < 0 ? 1 : -1));
      }}
      onPointerCancel={() => {
        swipe.current = null;
      }}
    >
      <div role="row" className="grid grid-cols-7">
        {weekdays.map((w) => (
          <div key={w} role="columnheader" className="py-2 text-center text-xs font-semibold text-muted-foreground">
            <span aria-hidden="true">{w.slice(0, 1)}</span>
            <span className="sr-only">{w}</span>
          </div>
        ))}
      </div>
      {Array.from({ length: 6 }, (_, week) => (
        <div key={week} role="row" className="grid grid-cols-7">
          {days.slice(week * 7, week * 7 + 7).map((d) => {
            if (!inMonth(d)) return <div key={d} role="gridcell" aria-hidden="true" className="h-12" />;
            const list = byDate.get(d) ?? [];
            const isSelected = d === selected;
            const dots = list
              .slice(0, 3)
              .map((item) =>
                item.kind === "enquiry"
                  ? "bg-primary"
                  : item.completed
                    ? "bg-muted-foreground/40"
                    : isOverdue(item)
                      ? "bg-destructive"
                      : "bg-highlight",
              );
            return (
              <div key={d} role="gridcell" aria-selected={isSelected} className="p-0.5">
                <button
                  type="button"
                  data-date={d}
                  tabIndex={isSelected ? 0 : -1}
                  aria-label={`${dayLabel(d)}${d === today ? ", today" : ""}${list.length ? `, ${list.length} item${list.length === 1 ? "" : "s"}` : ", nothing planned"}`}
                  onClick={() => onSelect(d)}
                  onKeyDown={(e) => onKeyDown(e, d)}
                  className={cn(
                    "flex h-12 w-full flex-col items-center justify-center gap-1 rounded-lg text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
                    isSelected
                      ? "bg-primary font-semibold text-primary-foreground"
                      : d === today
                        ? "font-semibold text-primary ring-1 ring-primary/50 ring-inset"
                        : "hover:bg-muted",
                  )}
                >
                  <span className="leading-none tabular-nums">{Number(d.slice(8))}</span>
                  <span aria-hidden="true" className="flex h-1.5 gap-0.5">
                    {dots.map((c, i) => (
                      <span key={i} className={cn("size-1.5 rounded-full", isSelected ? "bg-primary-foreground" : c)} />
                    ))}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function AgendaView({
  today,
  byDate,
  isOverdue,
  onEdit,
  onDelete,
  onStatus,
}: {
  today: string;
  byDate: Map<string, CalendarItem[]>;
  isOverdue: (r: CalendarReminder) => boolean;
  onEdit: (r: CalendarReminder) => void;
  onDelete: (r: CalendarReminder) => void;
  onStatus: (s: { kind: "success" | "error"; text: string }) => void;
}) {
  const end = addDays(today, 60);
  const days = [...byDate.keys()].filter((d) => d >= today && d <= end).sort();
  if (!days.includes(today)) days.unshift(today);
  return (
    <section aria-labelledby="upcoming-title">
      <h2 id="upcoming-title" className="text-eyebrow font-semibold text-emphasis uppercase">
        Upcoming (next 60 days)
      </h2>
      <div className="mt-4">
        <DayList
          days={days}
          today={today}
          byDate={byDate}
          isOverdue={isOverdue}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatus={onStatus}
        />
      </div>
    </section>
  );
}

function DayList({
  days,
  today,
  byDate,
  isOverdue,
  onEdit,
  onDelete,
  onStatus,
}: {
  days: string[];
  today: string;
  byDate: Map<string, CalendarItem[]>;
  isOverdue: (r: CalendarReminder) => boolean;
  onEdit: (r: CalendarReminder) => void;
  onDelete: (r: CalendarReminder) => void;
  onStatus: (s: { kind: "success" | "error"; text: string }) => void;
}) {
  return (
    <ol className="grid gap-6">
      {days.map((d) => {
        const list = byDate.get(d) ?? [];
        return (
          <li key={d}>
            <h3 className="flex items-center gap-2 border-b border-border pb-2 text-sm font-semibold">
              {dayLabel(d)}
              {d === today && (
                <span className="rounded-sm bg-primary px-2 py-0.5 text-xs text-primary-foreground">Today</span>
              )}
              {d > today && <span className="sr-only">(upcoming)</span>}
            </h3>
            <div className="mt-2">
              <DayItems list={list} isOverdue={isOverdue} onEdit={onEdit} onDelete={onDelete} onStatus={onStatus} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** One day's enquiries and reminders, as rows. */
function DayItems({ list, isOverdue, onEdit, onDelete, onStatus }: { list: CalendarItem[] } & DayHandlers) {
  if (list.length === 0) return <p className="text-sm text-muted-foreground">Nothing planned.</p>;
  return (
    <ul className="grid gap-2">
      {list.map((item) =>
        item.kind === "enquiry" ? (
          <li key={`e-${item.id}`}>
            <EnquiryRow enquiry={item} />
          </li>
        ) : (
          <ReminderRow
            key={`r-${item.id}`}
            reminder={item}
            overdue={isOverdue(item)}
            onEdit={() => onEdit(item)}
            onDelete={() => onDelete(item)}
            onStatus={onStatus}
          />
        ),
      )}
    </ul>
  );
}

function Chip({
  item,
  overdue,
  onEdit,
}: {
  item: CalendarItem;
  overdue: boolean;
  onEdit: (r: CalendarReminder) => void;
}) {
  if (item.kind === "enquiry") {
    return (
      <Link
        href={`/admin/enquiries/${item.id}` as never}
        className="flex min-h-7 items-center gap-1 rounded-sm border-l-2 border-primary bg-surface-blush px-1.5 py-0.5 text-xs hover:bg-secondary"
      >
        <span className="min-w-0 truncate font-semibold">{item.name}</span>
        <span className="sr-only">
          , enquiry{item.eventType ? `, ${item.eventType}` : ""}, status {item.status}
        </span>
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={() => onEdit(item)}
      className={cn(
        "flex min-h-7 w-full items-center gap-1 rounded-sm border-l-2 px-1.5 py-0.5 text-left text-xs hover:bg-muted",
        item.completed
          ? "border-border text-muted-foreground line-through"
          : overdue
            ? "border-destructive"
            : "border-highlight",
      )}
    >
      <Bell aria-hidden="true" className="size-3 shrink-0" />
      <span className="min-w-0 truncate">
        {item.time ? `${timeLabel(item.time)} ` : ""}
        {item.title}
      </span>
      <span className="sr-only">, reminder{item.completed ? ", completed" : overdue ? ", overdue" : ""}. Edit</span>
    </button>
  );
}

function EnquiryRow({ enquiry }: { enquiry: CalendarEnquiry }) {
  return (
    <Link
      href={`/admin/enquiries/${enquiry.id}` as never}
      className="flex flex-wrap items-center gap-x-3 gap-y-1 border-l-2 border-primary bg-background px-3 py-2.5 hover:bg-surface-blush"
    >
      <span className="font-semibold">{enquiry.name}</span>
      <span className="text-sm text-muted-foreground">{enquiry.eventType ?? "Event"} · Enquiry</span>
      <StatusBadge status={enquiry.status} />
    </Link>
  );
}

function ReminderRow({
  reminder,
  overdue,
  onEdit,
  onDelete,
  onStatus,
}: {
  reminder: CalendarReminder;
  overdue: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onStatus: (s: { kind: "success" | "error"; text: string }) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const toggle = () =>
    startTransition(async () => {
      try {
        const result = await setReminderCompleted(reminder.id, !reminder.completed);
        onStatus(result.ok ? { kind: "success", text: result.message } : { kind: "error", text: result.error });
        router.refresh();
      } catch (error) {
        onStatus({ kind: "error", text: describeActionFailure(error).text });
      }
    });

  return (
    <li
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-2 border-l-2 bg-background px-3 py-2",
        reminder.completed ? "border-border" : overdue ? "border-destructive" : "border-highlight",
      )}
    >
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-pressed={reminder.completed}
        aria-label={reminder.completed ? `Mark “${reminder.title}” as not done` : `Mark “${reminder.title}” as done`}
        pending={pending}
        onClick={toggle}
      >
        <Check aria-hidden="true" className={cn(!reminder.completed && "opacity-25")} />
      </Button>
      <div className="min-w-0 flex-1">
        <p className={cn("font-semibold", reminder.completed && "text-muted-foreground line-through")}>
          {reminder.title}
        </p>
        <p className="text-sm text-muted-foreground">
          {reminder.allDay ? "All day" : timeLabel(reminder.time!)} · Reminder
          {reminder.completed && " · Completed"}
          {overdue && <span className="font-semibold text-destructive"> · Overdue</span>}
          {reminder.relatedEnquiryId && (
            <>
              {" · "}
              <Link
                href={`/admin/enquiries/${reminder.relatedEnquiryId}` as never}
                className="underline underline-offset-4"
              >
                {reminder.relatedEnquiryName ?? "Enquiry"}
              </Link>
            </>
          )}
        </p>
        {reminder.notes && <p className="mt-1 text-sm whitespace-pre-line">{reminder.notes}</p>}
      </div>
      <div className="flex gap-1">
        <Button type="button" variant="ghost" size="icon" aria-label={`Edit “${reminder.title}”`} onClick={onEdit}>
          <Pencil aria-hidden="true" />
        </Button>
        <Button type="button" variant="ghost" size="icon" aria-label={`Delete “${reminder.title}”`} onClick={onDelete}>
          <Trash2 aria-hidden="true" />
        </Button>
      </div>
    </li>
  );
}

function ReminderDialog({
  open,
  reminder,
  defaultDate,
  enquiryOptions,
  onClose,
  onSaved,
  returnFocus,
}: {
  open: boolean;
  reminder: CalendarReminder | null;
  defaultDate: string;
  enquiryOptions: Option[];
  onClose: () => void;
  onSaved: (message: string) => void;
  returnFocus: React.RefObject<HTMLElement | null>;
}) {
  const id = useId();
  const router = useRouter();
  const [values, setValues] = useState<ReminderValues>({
    title: reminder?.title ?? "",
    date: reminder?.date ?? defaultDate,
    allDay: reminder?.allDay ?? false,
    time: reminder?.time ?? "10:00",
    relatedEnquiryId: reminder?.relatedEnquiryId ?? "",
    notes: reminder?.notes ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const set = <K extends keyof ReminderValues>(key: K, value: ReminderValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const result = await saveReminder(reminder?.id ?? null, values);
      if (result.ok) {
        onSaved(result.message);
        router.refresh();
      } else {
        setErrors(result.fieldErrors ?? {});
        setError(result.error);
      }
    } catch (e) {
      setError(describeActionFailure(e).text);
    } finally {
      setSaving(false);
    }
  };

  const err = (key: string) =>
    errors[key] ? (
      <p id={`${id}-${key}-error`} className="text-sm font-medium text-destructive">
        {errors[key]}
      </p>
    ) : null;
  const describedBy = (key: string) => (errors[key] ? `${id}-${key}-error` : undefined);
  const selectClass =
    "h-11 w-full rounded-md border border-input bg-background px-3 text-base focus-visible:outline-2 focus-visible:outline-ring";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !saving && onClose()}>
      <DialogContent
        className="sm:max-w-lg"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          titleRef.current?.focus();
        }}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          returnFocus.current?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>{reminder ? "Edit reminder" : "Add reminder"}</DialogTitle>
          <DialogDescription>Reminders are shared by all admins. Times are Adelaide time.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor={`${id}-title`}>Title</Label>
            <Input
              ref={titleRef}
              id={`${id}-title`}
              value={values.title}
              maxLength={200}
              aria-invalid={errors.title ? true : undefined}
              aria-describedby={describedBy("title")}
              onChange={(e) => set("title", e.target.value)}
            />
            {err("title")}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label id={`${id}-date-label`} htmlFor={`${id}-date`}>
                Date
              </Label>
              <DatePicker
                id={`${id}-date`}
                labelId={`${id}-date-label`}
                title="Reminder date"
                value={values.date}
                clearable={false}
                aria-invalid={errors.date ? true : undefined}
                aria-describedby={describedBy("date")}
                onChange={(v) => set("date", v)}
              />
              {err("date")}
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`${id}-time`}>Time</Label>
              <Input
                id={`${id}-time`}
                type="time"
                value={values.time}
                disabled={values.allDay}
                aria-invalid={errors.time ? true : undefined}
                aria-describedby={describedBy("time")}
                onChange={(e) => set("time", e.target.value)}
              />
              {err("time")}
            </div>
          </div>
          <label className="flex min-h-11 items-center gap-3 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-(--primary)"
              checked={values.allDay}
              onChange={(e) => set("allDay", e.target.checked)}
            />
            All day (reminds you at 9:00 am)
          </label>
          <div className="grid gap-2">
            <Label htmlFor={`${id}-enquiry`}>Related enquiry (optional)</Label>
            <select
              id={`${id}-enquiry`}
              className={selectClass}
              value={values.relatedEnquiryId}
              onChange={(e) => set("relatedEnquiryId", e.target.value)}
            >
              <option value="">None</option>
              {enquiryOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                  {o.date ? ` — ${dayLabel(o.date, "short")}` : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`${id}-notes`}>Notes (optional)</Label>
            <Textarea
              id={`${id}-notes`}
              rows={3}
              maxLength={2000}
              value={values.notes}
              aria-describedby={describedBy("notes")}
              onChange={(e) => set("notes", e.target.value)}
            />
            {err("notes")}
          </div>
          <p role="alert" className="text-sm font-medium text-destructive empty:hidden">
            {error ?? ""}
          </p>
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              aria-disabled={saving || undefined}
              onClick={() => !saving && onClose()}
            >
              Cancel
            </Button>
            <Button type="submit" pending={saving} pendingLabel="Saving reminder…">
              Save reminder
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
