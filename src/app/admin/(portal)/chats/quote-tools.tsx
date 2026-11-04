"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CircleCheck, ClipboardList, Plus, Receipt, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { QUOTE_FIELDS, QUOTE_FIELD_LABELS, money, quoteTotal, type QuoteData, type QuoteField } from "@/lib/chat/quote";
import { cn } from "@/lib/utils";
import { sendQuote, sendQuoteForm } from "./actions";

/*
 * Quotes in chat, the team's side: "Send quote form" (the visitor fills in
 * their event details in the chat) and "Create a quote" (items, deposit and a
 * note, sent as a card the visitor can accept). See lib/chat/quote.ts.
 */

/** The "Quote" button beside the reply box. */
export function QuoteMenu({
  chatId,
  lastQuote,
  onError,
}: {
  chatId: string;
  /** The latest quote in this chat: a new quote starts from it. */
  lastQuote: QuoteData | null;
  onError: (error: string | null) => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" className="shrink-0 rounded-full border-primary/35 text-emphasis max-sm:size-11 max-sm:px-0" aria-label="Quote">
            <Receipt data-icon="inline-start" className="max-sm:m-0" />
            <span className="max-sm:sr-only">Quote</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="top" className="w-64 rounded-md p-1 shadow-soft">
          <DropdownMenuItem
            className="min-h-11"
            disabled={pending}
            onSelect={() =>
              start(async () => {
                const result = await sendQuoteForm(chatId);
                onError(result.ok ? null : result.error);
                router.refresh();
              })
            }
          >
            <ClipboardList aria-hidden="true" />
            <span>
              <span className="block font-semibold">Send quote form</span>
              <span className="block text-xs text-muted-foreground">They fill in their event details here</span>
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem className="min-h-11" onSelect={() => setOpen(true)}>
            <Receipt aria-hidden="true" />
            <span>
              <span className="block font-semibold">{lastQuote ? "Send a new quote…" : "Create a quote…"}</span>
              <span className="block text-xs text-muted-foreground">Items, total and deposit they can accept</span>
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <QuoteDialog open={open} onOpenChange={setOpen} chatId={chatId} initial={lastQuote} />
    </>
  );
}

const amount = z.number({ error: "Enter an amount." }).min(0, "Can't be negative.").max(100000, "Over $100,000.");
const formSchema = z.object({
  items: z
    .array(z.object({ label: z.string().trim().min(1, "Name the item.").max(80, "Keep it under 80 characters."), amount }))
    .min(1, "Add at least one item.")
    .max(15, "Up to 15 items."),
  deposit: amount.optional(),
  note: z.string().trim().max(300, "Keep the note under 300 characters."),
});
type QuoteFormValues = z.infer<typeof formSchema>;
const toNumber = (v: unknown) => (v === "" || v === null || v === undefined ? undefined : Number(v));

function QuoteDialog({
  open,
  onOpenChange,
  chatId,
  initial,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatId: string;
  initial: QuoteData | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const defaults: QuoteFormValues = initial
    ? { items: initial.items, deposit: initial.deposit ?? undefined, note: initial.note }
    : { items: [{ label: "", amount: Number.NaN }], deposit: undefined, note: "" };
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuoteFormValues>({ resolver: zodResolver(formSchema), defaultValues: defaults, shouldFocusError: true });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = useWatch({ control, name: "items" });
  const deposit = useWatch({ control, name: "deposit" });
  const total = quoteTotal((items ?? []).map((i) => ({ amount: Number(i?.amount) })));

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (next) {
          reset(defaults);
          setError(null);
        }
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Send a new quote" : "Create a quote"}</DialogTitle>
          <DialogDescription>
            It appears in the chat as a card with <strong>Accept quote</strong>. A new quote replaces the earlier one.
          </DialogDescription>
        </DialogHeader>
        <form
          noValidate
          className="grid gap-4"
          onSubmit={handleSubmit(async (values) => {
            const result = await sendQuote(chatId, { items: values.items, deposit: values.deposit ?? null, note: values.note });
            if (!result.ok) return setError(result.error);
            setError(null);
            onOpenChange(false);
            router.refresh();
          })}
        >
          <fieldset className="grid gap-2">
            <legend className="mb-1 text-sm font-semibold">Items</legend>
            {fields.map((f, i) => (
              <div key={f.id} className="grid grid-cols-[1fr_7rem_auto] items-start gap-2">
                <Field data-invalid={errors.items?.[i]?.label ? true : undefined}>
                  <FieldLabel htmlFor={`qi-${i}-label`} className="sr-only">
                    Item {i + 1}
                  </FieldLabel>
                  <Input
                    id={`qi-${i}-label`}
                    placeholder={i === 0 ? "e.g. Balloon arch" : "Item"}
                    aria-invalid={errors.items?.[i]?.label ? true : undefined}
                    {...register(`items.${i}.label`)}
                  />
                  {errors.items?.[i]?.label && <FieldError>{errors.items[i]?.label?.message}</FieldError>}
                </Field>
                <Field data-invalid={errors.items?.[i]?.amount ? true : undefined}>
                  <FieldLabel htmlFor={`qi-${i}-amount`} className="sr-only">
                    Item {i + 1} price
                  </FieldLabel>
                  <Input
                    id={`qi-${i}-amount`}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                    placeholder="$"
                    aria-invalid={errors.items?.[i]?.amount ? true : undefined}
                    {...register(`items.${i}.amount`, { setValueAs: (v) => toNumber(v) ?? Number.NaN })}
                  />
                  {errors.items?.[i]?.amount && <FieldError>{errors.items[i]?.amount?.message}</FieldError>}
                </Field>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove item ${i + 1}`}
                  aria-disabled={fields.length === 1 || undefined}
                  onClick={() => fields.length > 1 && remove(i)}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
            {errors.items?.root && <FieldError>{errors.items.root.message}</FieldError>}
            {fields.length < 15 && (
              <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => append({ label: "", amount: Number.NaN })}>
                <Plus data-icon="inline-start" />
                Add item
              </Button>
            )}
          </fieldset>

          <div className="flex items-center justify-between rounded-lg bg-surface-ivory px-3.5 py-2.5">
            <span className="text-sm font-semibold">Total</span>
            <span className="text-lg font-bold tabular-nums">{money(total)}</span>
          </div>

          <Field data-invalid={errors.deposit ? true : undefined}>
            <FieldLabel htmlFor="quote-deposit">Deposit to book (optional)</FieldLabel>
            <Input
              id="quote-deposit"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              placeholder="$"
              aria-invalid={errors.deposit ? true : undefined}
              {...register("deposit", { setValueAs: toNumber })}
            />
            {errors.deposit && <FieldError>{errors.deposit.message}</FieldError>}
            {deposit !== undefined && Number.isFinite(deposit) && deposit > total && <FieldError>The deposit is more than the total.</FieldError>}
          </Field>

          <Field data-invalid={errors.note ? true : undefined}>
            <FieldLabel htmlFor="quote-note">Note (optional)</FieldLabel>
            <Textarea id="quote-note" rows={2} placeholder="e.g. Includes delivery, setup and pack down." {...register("note")} />
            {errors.note && <FieldError>{errors.note.message}</FieldError>}
          </Field>

          <p role="alert" className="text-sm font-medium text-destructive empty:hidden">
            {error ?? ""}
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" pending={isSubmitting} pendingLabel="Sending…">
              <Receipt data-icon="inline-start" />
              Send quote
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** A sent quote, as the team sees it in the conversation. */
export function QuoteCard({ quote, state }: { quote: QuoteData; state: "accepted" | "waiting" | "replaced" }) {
  return (
    <div className={cn("rounded-2xl rounded-br-sm border bg-background text-left text-sm", state === "accepted" ? "border-[#9fcdb2]" : "border-primary/40")}>
      <p className="flex items-center gap-2 border-b border-border px-3.5 py-2 font-semibold">
        <Receipt className="size-4 text-emphasis" aria-hidden="true" />
        Quote
        <span
          className={cn(
            "ml-auto rounded-full px-2 py-0.5 text-[11px] font-bold",
            state === "accepted" ? "bg-[#eef6f1] text-[#2f6b4c]" : state === "replaced" ? "bg-muted text-muted-foreground" : "bg-surface-blush text-emphasis",
          )}
        >
          {state === "accepted" ? "Accepted" : state === "replaced" ? "Replaced" : "Waiting for them"}
        </span>
      </p>
      <dl className="space-y-1 px-3.5 py-2.5">
        {quote.items.map((item, i) => (
          <div key={i} className="flex justify-between gap-4">
            <dt>{item.label}</dt>
            <dd className="tabular-nums">{money(item.amount)}</dd>
          </div>
        ))}
        <div className="flex justify-between gap-4 border-t border-border pt-1.5 font-bold">
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
    </div>
  );
}

/** The visitor's answers to the quote form. */
export function QuoteDetailsCard({ details }: { details: Partial<Record<QuoteField, string>> }) {
  return (
    <div className="rounded-2xl rounded-bl-sm border border-border bg-background px-3.5 py-2.5 text-sm">
      <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
        <ClipboardList className="size-3.5" aria-hidden="true" />
        Quote details
      </p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
        {QUOTE_FIELDS.filter((f) => details[f]).map((f) => (
          <div key={f} className="contents">
            <dt className="text-muted-foreground">{QUOTE_FIELD_LABELS[f]}</dt>
            <dd className="font-semibold wrap-break-word">{details[f]}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** "Accepted the quote", from the visitor. */
export function QuoteAccepted({ total }: { total: number | null }) {
  return (
    <p className="inline-flex items-center gap-2 rounded-2xl rounded-bl-sm border border-[#9fcdb2] bg-[#eef6f1] px-3.5 py-2.5 text-sm font-semibold text-[#2f6b4c]">
      <CircleCheck className="size-4" aria-hidden="true" />
      Accepted the quote{total !== null ? ` · ${money(total)}` : ""}
    </p>
  );
}
