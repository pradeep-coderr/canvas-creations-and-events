import { z } from "zod";

/*
 * The website chat's menu bot (no AI): fixed answers to a few menu choices,
 * built from the site's own content (what we style, pricing), and a guided
 * "Plan my event" that asks one question at a time. Shared by the
 * chat widget and the admin inbox, so both show the same answer for a choice.
 * Answers are never stored: a choice is stored as the visitor's message with
 * its key, and the answer is shown from here.
 */

export const CHAT_CHOICES = ["plan", "style", "pricing", "date", "team", "work", "quote"] as const;
export type ChatChoice = (typeof CHAT_CHOICES)[number];

export const CHOICE_LABELS: Record<ChatChoice, string> = {
  plan: "Plan my event",
  style: "What we style",
  pricing: "Pricing & packages",
  date: "Check a date",
  team: "Talk to the team",
  work: "See our work",
  quote: "Get a quote",
};

/*
 * MOCK: the "packages start from" price used while no pricing packages are
 * published (Admin → Content → Pricing). Replace with the real figure, or
 * set to null to leave prices out, before the chat goes live.
 */
export const MOCK_PRICE_FROM: number | null = 350;

/** What the bot knows, from the site's content (passed in by the server). */
export interface ChatBotContext {
  /** Kinds of celebration ("Weddings", "Birthdays", …). */
  categories: string[];
  /** Lowest published package price in AUD, or null for "quote only". */
  priceFrom: number | null;
  /** Where "See our work" goes. */
  workHref: string;
  /** Contact details (Admin → Content → Site details). */
  phone: string;
  email: string | null;
  address: { street: string | null; locality: string; region: string };
  /** Published FAQs: typed questions are matched against them. */
  faqs: { question: string; answer: string }[];
  /** The team set the chat to Away (Admin → Chats). */
  away: boolean;
}

export interface BotAnswer {
  text: string;
  chips: ChatChoice[];
  /** Ask for contact details (and the date, for "Check a date"). */
  form?: "contact" | "date";
  /** "See our work": a link instead of more text. */
  link?: { label: string; href: string };
  /** "Plan my event": the question this answer asks, its quick answers and how else to answer. */
  plan?: PlanQuestion;
}

export const GREETING: BotAnswer = {
  text: "Hello, and welcome to Canvas Creations and Events. How can we help with your celebration?",
  chips: ["plan", "style", "pricing", "date", "team"],
};

// ---------------------------------------------------------------------------
// "Plan my event": one question at a time, then a summary and contact details
// ---------------------------------------------------------------------------

export const PLAN_STEPS = ["occasion", "date", "guests", "venue", "theme", "budget"] as const;
export type PlanStep = (typeof PLAN_STEPS)[number];

export const PLAN_LABELS: Record<PlanStep, string> = {
  occasion: "Occasion",
  date: "Date",
  guests: "Guests",
  venue: "Venue",
  theme: "Colours / theme",
  budget: "Budget",
};

export const NOT_SURE = "Not sure yet";

export interface PlanQuestion {
  step: PlanStep;
  /** Tap-to-answer buttons. */
  options: string[];
  /** Also answerable by typing, or with a date picker. */
  input: "text" | "date" | null;
  placeholder?: string;
}

export function planQuestion(step: PlanStep, ctx: ChatBotContext): BotAnswer {
  const q = (text: string, plan: PlanQuestion): BotAnswer => ({ text, chips: [], plan });
  switch (step) {
    case "occasion":
      return q("Lovely, let's plan it together. What are you celebrating?", {
        step,
        options: [...(ctx.categories.length ? ctx.categories : ["Weddings", "Birthdays", "Engagements", "Baby showers"]), "Something else"],
        input: "text",
        placeholder: "Or type the occasion",
      });
    case "date":
      return q("When is it? Pick the date, or tap Not sure yet.", { step, options: [NOT_SURE], input: "date" });
    case "guests":
      return q("Roughly how many guests?", { step, options: ["Under 20", "20–50", "50–100", "100+", NOT_SURE], input: null });
    case "venue":
      return q("Where will it be? A venue name or suburb is perfect.", {
        step,
        options: ["At home", "Not decided yet"],
        input: "text",
        placeholder: "e.g. Munno Para Community Hall",
      });
    case "theme":
      return q("Any colours or theme in mind?", {
        step,
        options: ["Blush & gold", "White & greenery", "Bright & colourful", NOT_SURE],
        input: "text",
        placeholder: "Or describe it",
      });
    case "budget":
      return q("Last question: do you have a budget in mind? It helps us suggest the right setup.", {
        step,
        options: ["Under $500", "$500–$1,000", "$1,000–$2,500", "$2,500+", "Prefer not to say"],
        input: null,
      });
  }
}

/** After the last question: their plan back to them, then contact details. */
export function planSummary(answers: Partial<Record<PlanStep, string>>): BotAnswer {
  const lines = PLAN_STEPS.filter((s) => answers[s]).map((s) => `${PLAN_LABELS[s]}: ${answers[s]}`);
  return {
    text: `Here's your plan:\n${lines.join("\n")}\n\nWhere should the team send ideas and a quote?`,
    chips: [],
    form: "contact",
  };
}

const list = (items: string[]) =>
  items.length <= 1 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

const aud = (n: number) => `$${n.toLocaleString("en-AU", { maximumFractionDigits: 0 })}`;

export function botAnswer(choice: ChatChoice, ctx: ChatBotContext): BotAnswer {
  switch (choice) {
    case "style": {
      const kinds = ctx.categories.length
        ? list(ctx.categories.map((c) => c.toLowerCase()))
        : "weddings, engagements, birthdays, baby showers, cultural celebrations and corporate events";
      return {
        text: `We style ${kinds}: backdrops, balloon styling, florals, table settings and more, all designed around your celebration.`,
        chips: ["work", "pricing", "team"],
      };
    }
    case "pricing":
      return {
        text:
          ctx.priceFrom !== null
            ? `Every setup is styled to order, so the price depends on the size, the venue and what you have in mind. Packages start from ${aud(ctx.priceFrom)}. Share a few details and we'll send you a quote.`
            : "Every setup is styled to order, so the price depends on the size, the venue and what you have in mind. Share a few details and we'll send you a quote.",
        chips: ["quote", "style"],
      };
    case "work":
      return {
        text: "Our gallery shows recent setups by occasion.",
        chips: ["pricing", "team"],
        link: { label: "Open the gallery", href: ctx.workHref },
      };
    case "date":
      return { text: "Lovely. Pop in the date and how to reach you, and the team will confirm availability.", chips: [], form: "date" };
    case "quote":
      return { text: "Happy to put a quote together. Where should we send it?", chips: [], form: "contact" };
    case "plan":
      return planQuestion("occasion", ctx);
    case "team":
      return {
        text: "Of course. Leave your name and how to reach you, and someone from the team will reply here and by email.",
        chips: [],
        form: "contact",
      };
  }
}

export const HANDOVER_THANKS = (name: string | null) =>
  `Thanks${name ? `, ${name.split(/\s+/)[0]}` : ""}. The team has your details and will reply here, usually within a few hours.`;

// ---------------------------------------------------------------------------
// Validation (browser and server)
// ---------------------------------------------------------------------------

/** The browser's chat key: random, kept in localStorage, sent only to our server. */
export const chatTokenSchema = z.string().regex(/^[A-Za-z0-9_-]{32,128}$/);

export const chatMessageSchema = z
  .string()
  .trim()
  .min(1, "Type a message.")
  .max(1000, "Keep messages under 1000 characters.");

const phoneOrEmail = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || (/^[+\d][\d\s()-]{6,}$/.test(v) && v.replace(/\D/g, "").length >= 8);

export const chatContactSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(100, "Keep the name under 100 characters.").regex(/^[^\r\n]*$/),
  contact: z
    .string()
    .trim()
    .min(1, "Enter an email address or phone number.")
    .max(254)
    .refine(phoneOrEmail, "Enter a valid email address or phone number."),
  eventDate: z.string().trim().max(60, "Keep the date short, e.g. 14 March 2027.").optional().or(z.literal("")),
});
export type ChatContactValues = z.infer<typeof chatContactSchema>;

export const isEmail = (v: string | null | undefined) => Boolean(v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));

// ---------------------------------------------------------------------------
// Messages as the visitor's chat shows them
// ---------------------------------------------------------------------------

/** A team event in a chat: the bot turned off / back on for this visitor. */
/**
 * Structured messages: the bot turned off / on (system), a quote form or a
 * quote (team), the visitor's quote details or acceptance (lib/chat/quote.ts).
 */
export type ChatEvent = "bot_off" | "bot_on" | "quote_form" | "quote" | "quote_details" | "quote_accept";

export interface ChatMessage {
  id: number;
  sender: "visitor" | "team" | "system";
  body: string;
  choice: ChatChoice | null;
  kind?: ChatEvent | null;
  /** "Plan my event": the question this message answers. */
  planStep?: PlanStep | null;
  /** A quote's items, or the visitor's quote details. */
  data?: unknown;
  at: string;
}

export interface ChatSnapshot {
  exists: boolean;
  status?: "open" | "closed";
  handedOver?: boolean;
  name?: string | null;
  /** When the team last read the chat ("Seen by the team"). */
  adminReadAt?: string | null;
  /** When the visitor last read the team's replies (unread count after a reload). */
  visitorReadAt?: string | null;
  messages?: ChatMessage[];
}

export type ChatActionResult =
  // `chat: null`: saved, but the chat couldn't be refreshed (the next check catches up).
  | { ok: true; chat: ChatSnapshot | null }
  | { ok: false; error: string };
