import { z } from "zod";

/** Today's date as YYYY-MM-DD in the visitor's timezone. */
function today() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10);
}

const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `Please keep ${label} under ${max} characters.`);

/**
 * Enquiry validation, shared by the form (client) and the `submitEnquiry`
 * server action, which re-validates every submission — the browser is never
 * trusted. Database CHECK constraints mirror these limits.
 */
export const enquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Please enter your name.")
    .max(100, "Please keep your name under 100 characters."),
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email address.")
    .max(254, "Please enter a shorter email address.")
    .pipe(z.email("Please enter a valid email address.")),
  // Required (Phase 20): the database insert policy requires it too.
  phone: z
    .string()
    .trim()
    .min(1, "Please enter your phone number.")
    .max(30, "Please keep your phone number under 30 characters.")
    .refine(
      (value) => /^[+()\d\s-]+$/.test(value) && value.replace(/\D/g, "").length >= 8,
      "Please enter a valid phone number.",
    ),
  eventType: optionalText(100, "the event type"),
  eventDate: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value),
      "Please enter a valid date.",
    )
    .refine(
      (value) => value === "" || value >= today(),
      "Please choose a date that hasn't passed.",
    ),
  venue: optionalText(200, "the venue or location"),
  message: z
    .string()
    .trim()
    .min(1, "Please tell us a little about your celebration.")
    .max(2000, "Please keep your message under 2,000 characters."),
});

export type EnquiryInput = z.input<typeof enquirySchema>;
export type Enquiry = z.output<typeof enquirySchema>;

/**
 * Outcome of `submitEnquiry` (src/lib/submit-enquiry.ts):
 *   sent        — the enquiry is stored in the database. `notified` is true
 *                 only if Resend confirmed the internal notification email;
 *                 false when email isn't configured or the send failed (the
 *                 enquiry is still stored).
 *   unavailable — this deployment has no database configured
 *   error       — nothing was stored; safe, generic message for the visitor
 */
export type EnquiryResult =
  | { status: "sent"; notified: boolean }
  | { status: "unavailable" }
  | { status: "error"; message: string };
