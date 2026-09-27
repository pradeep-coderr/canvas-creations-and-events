/*
 * What to tell the admin when a server action call itself fails (no result
 * came back). Nothing was saved in any of these cases.
 *
 * The important one: after a new deployment (or a dev-server code reload),
 * an admin tab that was already open still calls the OLD server action ids,
 * which no longer exist ("Server Action … was not found on the server").
 * That is not a connection problem — reloading the page fixes it.
 */
export function describeActionFailure(error: unknown): { text: string; stale: boolean } {
  const message = error instanceof Error ? error.message : String(error ?? "");
  if (/server action|was not found on the server|failed to find/i.test(message)) {
    return {
      text: "This page is out of date because the website was just updated, so nothing was saved. Reload the page, then save again.",
      stale: true,
    };
  }
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { text: "You're offline, so nothing was saved. Reconnect and try again.", stale: false };
  }
  return { text: "Couldn't reach the server, so nothing was saved. Try again.", stale: false };
}
