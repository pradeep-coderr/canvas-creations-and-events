import { z } from "zod";
import { BUSINESS_TIME_ZONE } from "@/lib/datetime";

/*
 * Admin calendar: dates are the business's (Adelaide) calendar days, and
 * reminder times are entered and shown in Adelaide time whatever the admin's
 * device timezone. Shared by the calendar UI and its server actions.
 */

/** YYYY-MM-DD of an instant in Adelaide. */
export function adelaideDate(instant: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: BUSINESS_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(instant);
}

/** HH:mm (24h) of an instant in Adelaide. */
export function adelaideTime(instant: Date): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: BUSINESS_TIME_ZONE, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(instant);
}

// Minutes Adelaide is ahead of UTC at a given instant (handles daylight saving).
function offsetMinutes(instant: Date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: BUSINESS_TIME_ZONE,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(instant)
      .map((p) => [p.type, p.value]),
  );
  const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return Math.round((asUtc - instant.getTime()) / 60000);
}

/** The UTC instant of an Adelaide wall-clock date + time. */
export function adelaideToUtc(date: string, time = "00:00"): Date {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const wall = Date.UTC(y, m - 1, d, hh, mm);
  let guess = new Date(wall - offsetMinutes(new Date(wall)) * 60000);
  guess = new Date(wall - offsetMinutes(guess) * 60000); // settle across DST changes
  return guess;
}

export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

export function monthOf(date: string) {
  return date.slice(0, 7);
}

/** The 6-week grid (Monday first) that shows a month, as YYYY-MM-DD dates. */
export function monthGrid(month: string): string[] {
  const first = `${month}-01`;
  const [y, m] = month.split("-").map(Number);
  const weekday = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7; // Monday = 0
  const start = addDays(first, -weekday);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

export function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return d.toISOString().slice(0, 7);
}

export function monthLabel(month: string) {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-AU", { month: "long", year: "numeric", timeZone: "UTC" });
}

export function dayLabel(date: string, style: "long" | "short" = "long") {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-AU", {
    weekday: style === "long" ? "long" : "short",
    day: "numeric",
    month: style === "long" ? "long" : "short",
    timeZone: "UTC",
  });
}

export function timeLabel(time: string) {
  const [h, m] = time.split(":").map(Number);
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
}

export const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

// ---------------------------------------------------------------------------
// Reminders
// ---------------------------------------------------------------------------

export const reminderSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Give the reminder a title.")
      .max(200, "Keep the title to 200 characters or fewer.")
      .regex(/^[^\r\n]*$/, "Keep the title on one line."),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date."),
    allDay: z.boolean(),
    time: z.string(),
    relatedEnquiryId: z.union([z.uuid(), z.literal("")]),
    notes: z.string().trim().max(2000, "Keep the notes to 2,000 characters or fewer."),
  })
  .superRefine((v, ctx) => {
    if (!v.allDay && !/^([01]\d|2[0-3]):[0-5]\d$/.test(v.time)) {
      ctx.addIssue({ code: "custom", path: ["time"], message: "Choose a time, or make it an all-day reminder." });
    }
  });

export type ReminderValues = z.input<typeof reminderSchema>;

/** All-day reminders fall due at 9:00 am Adelaide time on their day. */
export function reminderDueAt(v: z.output<typeof reminderSchema>): Date {
  return adelaideToUtc(v.date, v.allDay ? "09:00" : v.time);
}

export interface CalendarEnquiry {
  kind: "enquiry";
  id: string;
  date: string;
  name: string;
  eventType: string | null;
  status: "new" | "contacted" | "quoted" | "booked" | "completed" | "archived";
}

export interface CalendarReminder {
  kind: "reminder";
  id: string;
  date: string;
  time: string | null;
  dueAt: string;
  title: string;
  notes: string | null;
  allDay: boolean;
  completed: boolean;
  relatedEnquiryId: string | null;
  relatedEnquiryName: string | null;
}

export type CalendarItem = CalendarEnquiry | CalendarReminder;
