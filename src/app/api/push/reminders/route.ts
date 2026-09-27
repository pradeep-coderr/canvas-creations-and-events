import { NextResponse } from "next/server";
import { adelaideDate, adelaideTime, timeLabel } from "@/lib/calendar";
import { dispatchSecret, dispatchSecretMatches, pushToAdmins } from "@/lib/push/server";
import { createPublicClient } from "@/lib/supabase/public";

/*
 * Reminder delivery. Called every minute by the database scheduler (pg_cron →
 * pg_net, only when something is due) with the dispatch secret; the browser
 * is never responsible for future reminders. Each due reminder is claimed
 * once (marked notified in the same statement) and pushed to subscribed
 * super admins. Nothing private is returned.
 */
export async function POST(request: Request) {
  if (!dispatchSecretMatches(request.headers.get("authorization"))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const { data, error } = await createPublicClient().rpc("claim_due_reminders", { p_secret: dispatchSecret! });
  if (error) {
    console.error("[push] reminders unavailable", { code: error.code });
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  const due = (data ?? []) as { id: string; title: string; due_at: string; all_day: boolean }[];
  let sent = 0;
  for (const r of due) {
    const at = new Date(r.due_at);
    const minutes = Math.round((at.getTime() - Date.now()) / 60000);
    const when = r.all_day ? "Today" : minutes > 1 ? `In ${minutes} minutes (${timeLabel(adelaideTime(at))})` : `Now (${timeLabel(adelaideTime(at))})`;
    const result = await pushToAdmins("reminder", {
      title: "Reminder",
      body: `${r.title}\n${when}`,
      url: `/admin/calendar?month=${adelaideDate(at).slice(0, 7)}&view=agenda`,
      tag: `reminder-${r.id}`,
    });
    sent += result.sent;
  }
  console.info("[push] reminders dispatched", { reminders: due.length, sent });
  return NextResponse.json({ ok: true, reminders: due.length, sent });
}
