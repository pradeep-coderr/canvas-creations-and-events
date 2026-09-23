import { isSupabaseConfigured } from "@/lib/supabase/env";
import { site, type NavLink } from "./site";

/**
 * Frequently asked questions. Maps onto a future `faqs` table.
 *
 * Only questions whose answers come from verified business information are
 * published. Pricing, availability, service area, lead times and policies
 * are deliberately absent until the client confirms them.
 */
export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  /** Optional follow-up link shown under the answer. */
  action?: NavLink;
  order: number;
}

const { phone, address } = site.contact;

// Online enquiries are live only when this deployment has a database.
const enquiriesOnline = isSupabaseConfigured();

export const faqs: FaqItem[] = [
  {
    id: "how-to-enquire",
    question: "How do I make an enquiry?",
    answer: enquiriesOnline
      ? `You can send us an enquiry online using the form on this page, or call us on ${phone.display}. You can also find us on Instagram, Facebook and TikTok.`
      : `The quickest way to reach us right now is by phone on ${phone.display}. You can also find us on Instagram, Facebook and TikTok.`,
    action: enquiriesOnline
      ? { label: "Send an enquiry", href: "/#enquire" }
      : { label: `Call ${phone.display}`, href: phone.href },
    order: 1,
  },
  {
    id: "enquiry-details",
    question: "What details help with an enquiry?",
    answer:
      "Your event date, the type of celebration and the venue or location are a great start, along with any ideas, colours or inspiration you already have in mind.",
    order: 2,
  },
  {
    id: "location",
    question: "Where are you based?",
    answer: `We are based in ${address.locality}, ${site.region}.`,
    order: 3,
  },
];

export const sortedFaqs = [...faqs].sort((a, b) => a.order - b.order);
