import { z } from "zod";

/*
 * Quotes in chat (Admin → Chats → Quote). The team sends a quote form, the
 * visitor fills it in inside the chat, the team sends a quote (items, total,
 * deposit), and the visitor can accept it. Each step is a chat message with
 * a `kind` and its details in `data` (see the chat migration).
 */

export const QUOTE_FIELDS = ["occasion", "date", "guests", "venue", "theme", "budget"] as const;
export type QuoteField = (typeof QUOTE_FIELDS)[number];
export const QUOTE_FIELD_LABELS: Record<QuoteField, string> = {
  occasion: "Occasion",
  date: "Date",
  guests: "Guests",
  venue: "Venue",
  theme: "Colours / theme",
  budget: "Budget",
};

const line = z.string().trim().max(100, "Keep it under 100 characters.").regex(/^[^\r\n]*$/, "Keep it to one line.");

/** The visitor's answers to the quote form. */
export const quoteDetailsSchema = z.object({
  occasion: line.min(1, "What are you celebrating?"),
  date: line,
  guests: line,
  venue: line,
  theme: line,
  budget: line,
});
export type QuoteDetails = z.infer<typeof quoteDetailsSchema>;

const amount = z
  .number({ error: "Enter an amount." })
  .min(0, "Amounts can't be negative.")
  .max(100000, "That's more than $100,000.")
  .transform((n) => Math.round(n * 100) / 100);

/** What the team fills in to send a quote. */
export const quoteInputSchema = z
  .object({
    items: z
      .array(z.object({ label: z.string().trim().min(1, "Name the item.").max(80, "Keep it under 80 characters."), amount }))
      .min(1, "Add at least one item.")
      .max(15, "Up to 15 items."),
    deposit: amount.nullable(),
    note: z.string().trim().max(300, "Keep the note under 300 characters."),
  })
  .refine((q) => q.deposit === null || q.deposit <= quoteTotal(q.items), { message: "The deposit can't be more than the total.", path: ["deposit"] });
export type QuoteInput = z.input<typeof quoteInputSchema>;

/** A sent quote, as stored in the message's data. */
export interface QuoteData {
  items: { label: string; amount: number }[];
  total: number;
  deposit: number | null;
  note: string;
}

export const quoteTotal = (items: { amount: number }[]) => Math.round(items.reduce((sum, i) => sum + (Number.isFinite(i.amount) ? i.amount : 0), 0) * 100) / 100;

/** "$1,250" or "$1,250.50". */
export const money = (n: number) =>
  `$${n.toLocaleString("en-AU", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;

/** A quote message's data, checked (it comes from the database as JSON). */
export function asQuote(data: unknown): QuoteData | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  if (!Array.isArray(d.items) || typeof d.total !== "number") return null;
  const items = d.items
    .filter((i): i is { label: string; amount: number } => Boolean(i) && typeof i.label === "string" && typeof i.amount === "number")
    .map((i) => ({ label: i.label, amount: i.amount }));
  return { items, total: d.total, deposit: typeof d.deposit === "number" ? d.deposit : null, note: typeof d.note === "string" ? d.note : "" };
}

/** The visitor's quote details from a message's data (only the known fields). */
export function asQuoteDetails(data: unknown): Partial<Record<QuoteField, string>> {
  if (!data || typeof data !== "object") return {};
  const d = data as Record<string, unknown>;
  return Object.fromEntries(QUOTE_FIELDS.flatMap((f) => (typeof d[f] === "string" && d[f] ? [[f, d[f] as string]] : [])));
}

/** The message text for a quote (previews, the email, and chats without the card). */
export function quoteText(q: QuoteData) {
  const lines = q.items.map((i) => `${i.label}: ${money(i.amount)}`);
  return [
    "Your quote",
    ...lines,
    `Total: ${money(q.total)}`,
    q.deposit !== null ? `Deposit to book: ${money(q.deposit)}` : "",
    q.note ? `\n${q.note}` : "",
  ]
    .filter(Boolean)
    .join("\n")
    .slice(0, 1000);
}

/** The message text for the visitor's quote details. */
export function quoteDetailsText(d: Partial<Record<QuoteField, string>>) {
  return ["Quote details", ...QUOTE_FIELDS.filter((f) => d[f]).map((f) => `${QUOTE_FIELD_LABELS[f]}: ${d[f]}`)].join("\n").slice(0, 1000);
}

export const QUOTE_FORM_TEXT = "Could you fill in a few details? Then we'll put your quote together.";
