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
 * Enquiry validation. Shared by the form (client) and, later, the server
 * action that stores and emails the enquiry — validate on both sides.
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
  phone: optionalText(30, "your phone number").refine(
    (value) =>
      value === "" ||
      (/^[+()\d\s-]+$/.test(value) && value.replace(/\D/g, "").length >= 8),
    "Please enter a valid phone number, or leave it blank.",
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

export type EnquiryResult =
  | { status: "sent" }
  | { status: "unavailable" }
  | { status: "error"; message: string };

/**
 * Whether enquiries can actually be delivered. False until the Supabase +
 * email backend exists; the UI then says so instead of faking success.
 */
export const enquiriesEnabled = false;

/**
 * Deliver an enquiry. The single integration point for the future backend
 * (replace the body with a server action call). Until then it never claims
 * the enquiry was sent.
 */
export async function submitEnquiry(enquiry: Enquiry): Promise<EnquiryResult> {
  void enquiry;
  return { status: "unavailable" };
}
