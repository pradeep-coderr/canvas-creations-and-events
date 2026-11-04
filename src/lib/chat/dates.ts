/** "Today", "Yesterday" or "Mon 13 Oct": the day separators in a chat. */
export function chatDayLabel(iso: string, now: number = Date.now()) {
  const d = new Date(iso);
  const today = new Date(now);
  const yesterday = new Date(now);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" });
}
