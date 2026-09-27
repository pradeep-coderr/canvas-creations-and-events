import "server-only";
import { Resend } from "resend";
import type { Enquiry } from "@/lib/enquiry";
import { getEmailConfig } from "./config";
import { buildEnquiryNotification } from "./enquiry-notification";

export type NotificationOutcome = "sent" | "not-configured" | "failed";

// Transient Resend errors worth one more attempt with the same idempotency key.
const RETRYABLE = new Set([
  "application_error",
  "internal_server_error",
  "rate_limit_exceeded",
  "concurrent_idempotent_requests",
]);
const ATTEMPTS = 2;
const TIMEOUT_MS = 8_000;

function withTimeout<T>(promise: Promise<T>, ms: number) {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms),
    ),
  ]);
}

export interface DeliveryResult {
  outcome: NotificationOutcome;
  /** Resend's error (code: message) when it failed; never contains the API key. */
  error?: string;
}

/**
 * Emails the business about a stored enquiry. Never throws.
 *
 * Idempotency: the payload is built once and every attempt uses the key
 * `enquiry-notification/<enquiry id>`, so a retry of this notification can't
 * produce a second email (Resend deduplicates identical keyed requests).
 * Separate enquiries always have separate ids, so they are never merged.
 *
 * Logs contain the enquiry id and Resend's error code/message only — never
 * the enquirer's details, the message or the API key.
 */
export async function sendEnquiryNotification(
  id: string,
  enquiry: Enquiry,
): Promise<NotificationOutcome> {
  return (await deliverEnquiryEmail({ id, enquiry, idempotencyKey: `enquiry-notification/${id}` })).outcome;
}

/**
 * The one delivery path, shared by real enquiries and the Settings test
 * email (which passes `test: true`: "[Test]" subject, its own key).
 */
export async function deliverEnquiryEmail({
  id,
  enquiry,
  idempotencyKey,
  test = false,
}: {
  id: string;
  enquiry: Enquiry;
  idempotencyKey: string;
  test?: boolean;
}): Promise<DeliveryResult> {
  const label = test ? "test email" : "notification";
  const config = getEmailConfig();
  if (!config) {
    console.info(`[enquiry] ${label} skipped ${id} (email not configured)`);
    return { outcome: "not-configured" };
  }

  const resend = new Resend(config.apiKey);
  const built = buildEnquiryNotification({
    id,
    enquiry,
    receivedAt: new Date(),
  });
  const payload = {
    from: config.from,
    to: config.to,
    // Validated by the server-side Zod schema before we get here.
    replyTo: enquiry.email,
    subject: test ? `[Test] ${built.subject}` : built.subject,
    html: built.html,
    text: built.text,
  };
  const options = { idempotencyKey };

  let lastError = "unknown error";
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      const { data, error } = await withTimeout(
        resend.emails.send(payload, options),
        TIMEOUT_MS,
      );
      if (!error) {
        console.info(`[enquiry] ${label} sent ${id}`, { emailId: data?.id, attempt });
        return { outcome: "sent" };
      }
      lastError = `${error.name}: ${error.message}`;
      console.error(`[enquiry] ${label} failed ${id}`, {
        attempt,
        code: error.name,
        message: error.message,
      });
      if (!RETRYABLE.has(error.name)) return { outcome: "failed", error: lastError };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      console.error(`[enquiry] ${label} failed ${id}`, {
        attempt,
        code: "exception",
        message: lastError,
      });
    }
    if (attempt < ATTEMPTS) await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return { outcome: "failed", error: lastError };
}
