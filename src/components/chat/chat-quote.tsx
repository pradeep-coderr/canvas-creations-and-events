"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CircleCheck, ClipboardList, MessageCircle, Receipt } from "lucide-react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NOT_SURE, chatContactSchema, planQuestion, type ChatBotContext } from "@/lib/chat/bot";
import { money, quoteDetailsSchema, type QuoteData, type QuoteDetails } from "@/lib/chat/quote";
import { cn } from "@/lib/utils";

/*
 * Quotes in the visitor's chat: the team's quote form (filled in right here)
 * and the team's quote, which the visitor can accept. The team's side is in
 * Admin → Chats (quote-tools.tsx); the rules are in lib/chat/quote.ts.
 */

const fieldClass =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 aria-invalid:border-destructive";

const contactFields = chatContactSchema.pick({ name: true, contact: true });
/** The form's fields (the date as the date input gives it); name and contact only when the chat has none. */
const formSchema = (needsContact: boolean) =>
  quoteDetailsSchema.extend({ date: z.string(), name: z.string(), contact: z.string() }).superRefine((values, ctx) => {
    if (!needsContact) return;
    const checked = contactFields.safeParse(values);
    if (!checked.success) for (const issue of checked.error.issues) ctx.addIssue({ code: "custom", message: issue.message, path: issue.path });
  });
type FormValues = z.infer<ReturnType<typeof formSchema>>;

/** The quote form the team sent. Filled in once; afterwards it shows as sent. */
export function QuoteFormCard({
  ctx,
  active,
  needsContact,
  onSubmit,
}: {
  ctx: ChatBotContext;
  /** The latest form, not yet answered: fillable. */
  active: boolean;
  /** No name or contact in this chat yet: ask for them too. */
  needsContact: boolean;
  onSubmit: (details: QuoteDetails, contact: { name: string; contact: string } | null) => Promise<boolean>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema(needsContact)),
    defaultValues: { occasion: "", date: "", guests: "", venue: "", theme: "", budget: "", name: "", contact: "" },
    shouldFocusError: true,
  });
  const occasions = planQuestion("occasion", ctx).plan?.options.filter((o) => o !== "Something else") ?? [];
  const guests = planQuestion("guests", ctx).plan?.options ?? [];
  const budgets = planQuestion("budget", ctx).plan?.options ?? [];
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  if (!active) {
    return (
      <div className="ml-9 flex items-center gap-2 rounded-2xl border border-border bg-surface-ivory/60 px-3.5 py-2.5 text-[13px] text-muted-foreground">
        <ClipboardList className="size-4 shrink-0 text-highlight" aria-hidden="true" />
        Quote form · details sent
      </div>
    );
  }

  return (
    <form
      noValidate
      aria-labelledby="quote-form-title"
      onSubmit={handleSubmit(async (values) => {
        // The date as the chat shows dates ("Sat 14 March 2027"), or "Not sure yet".
        const date = values.date
          ? new Date(`${values.date}T00:00:00`).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "long", year: "numeric" })
          : NOT_SURE;
        const details: QuoteDetails = {
          occasion: values.occasion,
          date,
          guests: values.guests,
          venue: values.venue,
          theme: values.theme,
          budget: values.budget,
        };
        await onSubmit(details, needsContact ? { name: values.name, contact: values.contact } : null);
      })}
      className="ml-9 grid gap-3 rounded-2xl border border-primary/30 bg-surface-ivory/60 p-3.5"
    >
      <p id="quote-form-title" className="flex items-center gap-2 text-sm font-semibold">
        <ClipboardList className="size-4 text-emphasis" aria-hidden="true" />
        Quote details
      </p>
      <Field data-invalid={errors.occasion ? true : undefined}>
        <FieldLabel htmlFor="quote-occasion">What are you celebrating?</FieldLabel>
        <Input id="quote-occasion" list="quote-occasions" aria-invalid={errors.occasion ? true : undefined} {...register("occasion")} />
        <datalist id="quote-occasions">
          {occasions.map((o) => (
            <option key={o} value={o} />
          ))}
        </datalist>
        {errors.occasion && <FieldError>{errors.occasion.message}</FieldError>}
      </Field>
      <Field>
        <FieldLabel htmlFor="quote-date">Date (leave empty if not sure)</FieldLabel>
        <input id="quote-date" type="date" min={today} className={fieldClass} {...register("date")} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field>
          <FieldLabel htmlFor="quote-guests">Guests</FieldLabel>
          <select id="quote-guests" className={fieldClass} {...register("guests")}>
            <option value="">Choose</option>
            {guests.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Field>
        <Field>
          <FieldLabel htmlFor="quote-budget">Budget</FieldLabel>
          <select id="quote-budget" className={fieldClass} {...register("budget")}>
            <option value="">Choose</option>
            {budgets.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field data-invalid={errors.venue ? true : undefined}>
        <FieldLabel htmlFor="quote-venue">Venue or suburb</FieldLabel>
        <Input id="quote-venue" placeholder="e.g. Munno Para Community Hall" aria-invalid={errors.venue ? true : undefined} {...register("venue")} />
        {errors.venue && <FieldError>{errors.venue.message}</FieldError>}
      </Field>
      <Field data-invalid={errors.theme ? true : undefined}>
        <FieldLabel htmlFor="quote-theme">Colours or theme</FieldLabel>
        <Input id="quote-theme" placeholder="e.g. Blush and gold" aria-invalid={errors.theme ? true : undefined} {...register("theme")} />
        {errors.theme && <FieldError>{errors.theme.message}</FieldError>}
      </Field>
      {needsContact && (
        <>
          <Field data-invalid={errors.name ? true : undefined}>
            <FieldLabel htmlFor="quote-name">Your name</FieldLabel>
            <Input id="quote-name" autoComplete="name" aria-invalid={errors.name ? true : undefined} {...register("name")} />
            {errors.name && <FieldError>{errors.name.message}</FieldError>}
          </Field>
          <Field data-invalid={errors.contact ? true : undefined}>
            <FieldLabel htmlFor="quote-contact">Email or phone (for the quote)</FieldLabel>
            <Input id="quote-contact" autoComplete="email" aria-invalid={errors.contact ? true : undefined} {...register("contact")} />
            {errors.contact && <FieldError>{errors.contact.message}</FieldError>}
          </Field>
        </>
      )}
      <button
        type="submit"
        aria-disabled={isSubmitting || undefined}
        className="h-11 rounded-full bg-(--btn-bg) px-4 text-sm font-semibold text-(--btn-fg) hover:bg-(--btn-hover-bg) focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-disabled:opacity-60"
      >
        {isSubmitting ? "Sending…" : "Send details"}
      </button>
    </form>
  );
}

/** The team's quote: Accept (with a confirm step) or ask a question. */
export function QuoteOffer({
  quote,
  state,
  at,
  onAccept,
  onAsk,
}: {
  quote: QuoteData;
  state: "accepted" | "waiting" | "replaced";
  at: string;
  onAccept: () => Promise<boolean>;
  onAsk: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex max-w-[92%] items-end gap-2">
      <span aria-hidden="true" className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emphasis text-[10px] font-bold text-white">
        CC
      </span>
      <div className="min-w-0 flex-1">
        <p className="mb-1 text-[11px] text-muted-foreground">The team · {at}</p>
        <section
          aria-label="Your quote"
          className={cn(
            "overflow-hidden rounded-2xl rounded-bl-sm border bg-background text-sm",
            state === "accepted" ? "border-[#9fcdb2]" : state === "replaced" ? "border-border opacity-70" : "border-highlight/60",
          )}
        >
          <p className="flex items-center gap-2 border-b border-border bg-surface-ivory px-3.5 py-2 font-semibold">
            <Receipt className="size-4 text-emphasis" aria-hidden="true" />
            Your quote
            {state !== "waiting" && (
              <span
                className={cn(
                  "ml-auto rounded-full px-2 py-0.5 text-[11px] font-bold",
                  state === "accepted" ? "bg-[#eef6f1] text-[#2f6b4c]" : "bg-muted text-muted-foreground",
                )}
              >
                {state === "accepted" ? "Accepted" : "Replaced"}
              </span>
            )}
          </p>
          <dl className="space-y-1 px-3.5 py-2.5">
            {quote.items.map((item, i) => (
              <div key={i} className="flex justify-between gap-4">
                <dt className="min-w-0 wrap-break-word">{item.label}</dt>
                <dd className="shrink-0 tabular-nums">{money(item.amount)}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-4 border-t border-border pt-1.5 text-base font-bold">
              <dt>Total</dt>
              <dd className="tabular-nums">{money(quote.total)}</dd>
            </div>
            {quote.deposit !== null && (
              <div className="flex justify-between gap-4 text-muted-foreground">
                <dt>Deposit to book</dt>
                <dd className="tabular-nums">{money(quote.deposit)}</dd>
              </div>
            )}
          </dl>
          {quote.note && <p className="border-t border-border px-3.5 py-2 text-[13px] whitespace-pre-line text-muted-foreground">{quote.note}</p>}
          {state === "waiting" && (
            <div className="border-t border-border p-3">
              {confirming ? (
                <div className="grid gap-2">
                  <p className="text-[13px]">
                    Accept this quote for <strong>{money(quote.total)}</strong>? The team will be in touch to confirm
                    {quote.deposit !== null ? " the deposit and" : ""} your booking. Bookings are made under our{" "}
                    {/* A new tab, so the chat stays where it is. */}
                    <a href="/terms" target="_blank" rel="noopener" className="font-semibold underline underline-offset-2 hover:text-foreground">
                      Terms &amp; Conditions
                    </a>
                    .
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      aria-disabled={busy || undefined}
                      onClick={async () => {
                        if (busy) return;
                        setBusy(true);
                        const ok = await onAccept();
                        setBusy(false);
                        if (ok) setConfirming(false);
                      }}
                      className="h-10 flex-1 rounded-full bg-(--btn-bg) px-4 text-[13px] font-semibold text-(--btn-fg) hover:bg-(--btn-hover-bg) focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-disabled:opacity-60"
                    >
                      {busy ? "Accepting…" : "Yes, accept"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirming(false)}
                      className="h-10 rounded-full border border-border px-4 text-[13px] font-semibold hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                      Not yet
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirming(true)}
                    className="inline-flex h-10 items-center gap-1.5 rounded-full bg-(--btn-bg) px-4 text-[13px] font-semibold text-(--btn-fg) hover:bg-(--btn-hover-bg) focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    <CircleCheck className="size-4" aria-hidden="true" />
                    Accept quote
                  </button>
                  <button
                    type="button"
                    onClick={onAsk}
                    className="inline-flex h-10 items-center gap-1.5 rounded-full border border-primary/40 px-4 text-[13px] font-semibold text-emphasis hover:border-primary hover:bg-surface-blush focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    <MessageCircle className="size-4" aria-hidden="true" />
                    Ask a question
                  </button>
                </div>
              )}
            </div>
          )}
          {state === "accepted" && (
            <p className="border-t border-border px-3.5 py-2 text-[13px] text-[#2f6b4c]">Thank you! The team will be in touch to confirm your booking.</p>
          )}
        </section>
      </div>
    </div>
  );
}
