/** Business timezone: the studio is in South Australia. */
export const BUSINESS_TIME_ZONE = "Australia/Adelaide";

/** e.g. "Wednesday 23 September 2026 at 11:40 pm" (Adelaide time). */
export function formatDateTime(value: Date | string) {
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: BUSINESS_TIME_ZONE,
  }).format(new Date(value));
}

/** e.g. "23 Sept 2026, 11:40 pm" (Adelaide time) — for compact lists. */
export function formatShortDateTime(value: Date | string) {
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: BUSINESS_TIME_ZONE,
  }).format(new Date(value));
}

/** A calendar date "YYYY-MM-DD" (no timezone shift), e.g. "Monday 2 November 2026". */
export function formatEventDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}
