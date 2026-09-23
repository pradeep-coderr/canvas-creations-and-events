import { z } from "zod";

/**
 * Enquiry status vocabulary. Must match the CHECK constraint
 * `enquiries_status_check` in supabase/migrations/…_create_enquiries.sql.
 */
export const enquiryStatuses = [
  "new",
  "contacted",
  "quoted",
  "booked",
  "completed",
  "archived",
] as const;

export type EnquiryStatus = (typeof enquiryStatuses)[number];

export const enquiryStatusSchema = z.enum(enquiryStatuses);

export const enquiryStatusLabels: Record<EnquiryStatus, string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  booked: "Booked",
  completed: "Completed",
  archived: "Archived",
};
