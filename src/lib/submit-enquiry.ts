"use server";

import { enquirySchema, type Enquiry, type EnquiryResult } from "@/lib/enquiry";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

const FAILED: EnquiryResult = {
  status: "error",
  message: "Your enquiry couldn't be sent. Please try again or call us.",
};

/** Explicit camelCase → snake_case mapping; blank optional fields become NULL. */
function toRow(enquiry: Enquiry) {
  const optional = (value: string) => (value === "" ? null : value);
  return {
    name: enquiry.name,
    email: enquiry.email,
    phone: optional(enquiry.phone),
    event_type: optional(enquiry.eventType),
    event_date: optional(enquiry.eventDate),
    venue: optional(enquiry.venue),
    message: enquiry.message,
  };
}

/**
 * Stores an enquiry. Runs on the server only (server action); the browser
 * never talks to the database directly.
 *
 * Trust boundary: everything arriving here is untrusted, so it is validated
 * again with the shared schema. The insert uses the public role, which RLS
 * limits to inserting new enquiries (no reads, updates or deletes).
 * "sent" is returned only after the database confirms the insert.
 * Email notification is not part of this step yet.
 */
export async function submitEnquiry(
  input: unknown,
  honeypot?: unknown,
): Promise<EnquiryResult> {
  // Hidden field that people never see: bots that fill it get a quiet
  // "sent" and nothing is stored.
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return { status: "sent" };
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

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("enquiries").insert(toRow(parsed.data));
    if (error) {
      // Log the database error for diagnosis, never the visitor's details.
      console.error("[enquiry] insert failed", { code: error.code, message: error.message });
      return FAILED;
    }
    return { status: "sent" };
  } catch (error) {
    console.error("[enquiry] unexpected failure", {
      message: error instanceof Error ? error.message : String(error),
    });
    return FAILED;
  }
}
