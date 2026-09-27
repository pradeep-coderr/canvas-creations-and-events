import type { Metadata } from "next";
import { CalendarView } from "@/components/admin/calendar-view";
import { requireAdmin } from "@/lib/admin/session";
import {
  addDays,
  adelaideDate,
  adelaideTime,
  adelaideToUtc,
  monthGrid,
  MONTH,
  type CalendarEnquiry,
  type CalendarReminder,
} from "@/lib/calendar";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Calendar" };

/**
 * The business calendar: enquiries (on their event date) and reminders.
 * Enquiry data is read, never copied; reminders live in admin_reminders.
 */
export default async function CalendarPage({ searchParams }: PageProps<"/admin/calendar">) {
  await requireAdmin();
  const params = await searchParams;
  const today = adelaideDate(new Date());
  const month = typeof params.month === "string" && MONTH.test(params.month) ? params.month : today.slice(0, 7);
  const view = params.view === "agenda" ? "agenda" : "month";
  const openNew = params.new === "reminder";

  // Everything the month grid shows, plus the next 60 days for the agenda.
  const grid = monthGrid(month);
  const from = grid[0] < today ? grid[0] : today;
  const to = grid[41] > addDays(today, 60) ? grid[41] : addDays(today, 60);

  const supabase = await createClient();
  const [enquiriesRes, remindersRes, overdueRes, pickRes] = await Promise.all([
    supabase
      .from("enquiries")
      .select("id, name, event_type, event_date, status")
      .gte("event_date", from)
      .lte("event_date", to)
      .neq("status", "archived")
      .order("event_date"),
    supabase
      .from("admin_reminders")
      .select("id, title, notes, due_at, all_day, completed_at, related_enquiry_id, enquiry:enquiries(name)")
      .gte("due_at", adelaideToUtc(from).toISOString())
      .lt("due_at", adelaideToUtc(addDays(to, 1)).toISOString())
      .order("due_at"),
    // Overdue: not done, due before now (any date).
    supabase
      .from("admin_reminders")
      .select("id, title, notes, due_at, all_day, completed_at, related_enquiry_id, enquiry:enquiries(name)")
      .is("completed_at", null)
      .lt("due_at", new Date().toISOString())
      .order("due_at")
      .limit(50),
    // For "Related enquiry": recent and upcoming enquiries.
    supabase.from("enquiries").select("id, name, event_date").neq("status", "archived").order("created_at", { ascending: false }).limit(100),
  ]);

  const failed = [enquiriesRes, remindersRes, overdueRes, pickRes].find((r) => r.error);
  if (failed?.error) {
    console.error("[calendar] load failed", { code: failed.error.code });
    return (
      <>
        <h1 className="font-display text-display-md font-title">Calendar</h1>
        <p role="alert" className="mt-4 text-destructive">
          The calendar couldn&apos;t be loaded. Refresh to try again.
        </p>
      </>
    );
  }

  const enquiries: CalendarEnquiry[] = (enquiriesRes.data ?? []).map((e) => ({
    kind: "enquiry",
    id: e.id,
    date: e.event_date!,
    name: e.name,
    eventType: e.event_type,
    status: e.status,
  }));
  type ReminderRow = NonNullable<typeof remindersRes.data>[number];
  const toReminder = (r: ReminderRow): CalendarReminder => {
    const due = new Date(r.due_at);
    const enquiry = r.enquiry as unknown as { name: string } | null;
    return {
      kind: "reminder",
      id: r.id,
      date: adelaideDate(due),
      time: r.all_day ? null : adelaideTime(due),
      dueAt: r.due_at,
      title: r.title,
      notes: r.notes,
      allDay: r.all_day,
      completed: r.completed_at !== null,
      relatedEnquiryId: r.related_enquiry_id,
      relatedEnquiryName: enquiry?.name ?? null,
    };
  };

  return (
    <CalendarView
      today={today}
      now={new Date().toISOString()}
      month={month}
      view={view}
      openNew={openNew}
      enquiries={enquiries}
      reminders={(remindersRes.data ?? []).map(toReminder)}
      overdue={(overdueRes.data ?? []).map(toReminder)}
      enquiryOptions={(pickRes.data ?? []).map((e) => ({ id: e.id, name: e.name, date: e.event_date }))}
    />
  );
}
