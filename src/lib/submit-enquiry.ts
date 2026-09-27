"use server";

import { after } from "next/server";
import { sendEnquiryNotification } from "@/lib/email/send-enquiry-notification";
import { notifyNewEnquiry } from "@/lib/push/server";
import { enquirySchema, type Enquiry, type EnquiryResult } from "@/lib/enquiry";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

const FAILED: EnquiryResult = {
  status: "error",
  message: "Your enquiry couldn't be sent. Please try again or call us.",
};

/** Explicit camelCase → snake_case mapping; blank optional fields become NULL. */
function toRow(id: string, enquiry: Enquiry) {
  const optional = (value: string) => (value === "" ? null : value);
  return {
    id,
    name: enquiry.name,
    email: enquiry.email,
    phone: enquiry.phone,
    event_type: optional(enquiry.eventType),
    event_date: optional(enquiry.eventDate),
    venue: optional(enquiry.venue),
    message: enquiry.message,
  };
}

/**
 * The single public entry point for enquiries (server action; the browser
 * never talks to the database or to Resend directly).
 *
 *   1. honeypot            → quiet "sent", nothing stored, nothing emailed
 *   2. Supabase configured → otherwise "unavailable"
 *   3. Zod re-validation   → the browser is never trusted
 *   4. insert              → the database is the source of truth
 *   5. notification email  → best effort; never undoes a stored enquiry
 *   6. push alert          → after the response (next/server after()), best effort
 *
 * The id is generated here (public roles can't read rows back, so the insert
 * can't return it) and becomes the row's primary key and the notification's
 * idempotency key.
 */
export async function submitEnquiry(
  input: unknown,
  honeypot?: unknown,
): Promise<EnquiryResult> {
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return { status: "sent", notified: false };
  }

  if (!isSupabaseConfigured()) return { status: "unavailable" };

  const parsed = enquirySchema.safeParse(input);
  if (!parsed.success) {
    console.warn("[enquiry] rejected invalid payload", {
      fields: parsed.error.issues.map((issue) => issue.path.join(".")),
    });
    return {
      status: "error",
      message: "Some details weren't valid. Please check the form and try again.",
    };
  }

  const id = crypto.randomUUID();
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("enquiries").insert(toRow(id, parsed.data));
    if (error) {
      // Log the database error for diagnosis, never the visitor's details.
      console.error("[enquiry] insert failed", { code: error.code, message: error.message });
      return FAILED;
    }
  } catch (error) {
    console.error("[enquiry] unexpected failure", {
      message: error instanceof Error ? error.message : String(error),
    });
    return FAILED;
  }

  console.info(`[enquiry] stored ${id}`);

  // Stored — from here on the visitor is told it was received, whatever
  // happens to the email or the push alert.
  // Push alert to subscribed super admins, after the response is sent: it
  // never delays or fails the enquiry, and only name + event date go out.
  const { name, eventDate } = parsed.data;
  after(() => notifyNewEnquiry({ id, name, eventDate: eventDate || null }));
  const outcome = await sendEnquiryNotification(id, parsed.data);
  return { status: "sent", notified: outcome === "sent" };
}
