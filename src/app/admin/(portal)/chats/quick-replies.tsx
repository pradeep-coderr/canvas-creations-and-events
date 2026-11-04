"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowDown, ArrowUp, ChevronDown, Pencil, Plus, Trash2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SearchInput } from "@/components/ui/search-input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { deleteQuickReply, moveQuickReply, saveQuickReply } from "./actions";

/*
 * Quick replies: saved answers the team inserts into the reply box with one
 * tap, then edits before sending. {name} and {date} are filled in from the
 * chat, {price} from the website's starting price; anything in [brackets] is
 * left for the team to complete.
 */

export interface QuickReply {
  id: string;
  label: string;
  body: string;
}

/** The text a quick reply puts in the box for this chat. */
export function fillQuickReply(body: string, chat: { name: string | null; event_date: string | null }, priceFrom?: number | null) {
  return body
    .replaceAll("{name}", () => chat.name?.trim().split(/\s+/)[0] ?? "there")
    .replaceAll("{date}", () => chat.event_date ?? "[date]")
    .replaceAll("{price}", () => (priceFrom ? `$${priceFrom.toLocaleString("en-AU", { maximumFractionDigits: 0 })}` : "[price]"));
}

/** How many quick replies show as buttons above the reply box; the rest are in "All replies". */
const ROW_COUNT = 4;

/** Every quick reply, with a search box once the list is long. */
function QuickReplyList({ replies, onPick }: { replies: QuickReply[]; onPick: (body: string) => void }) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const shown = needle ? replies.filter((r) => `${r.label} ${r.body}`.toLowerCase().includes(needle)) : replies;
  return (
    <>
      {replies.length > 6 && (
        <div className="px-4 pb-2">
          <SearchInput value={query} onValueChange={setQuery} placeholder="Search quick replies" aria-label="Search quick replies" />
        </div>
      )}
      <ul className="min-h-0 flex-1 overflow-y-auto">
        {shown.map((r) => (
          <li key={r.id}>
            <button
              type="button"
              onClick={() => onPick(r.body)}
              className="block w-full border-t border-border px-4 py-3 text-left hover:bg-surface-blush focus-visible:bg-surface-blush focus-visible:outline-none"
            >
              <span className="block text-sm font-bold">{r.label}</span>
              <span className="mt-0.5 block truncate text-[13px] text-muted-foreground">{r.body}</span>
            </button>
          </li>
        ))}
        {shown.length === 0 && <li className="border-t border-border px-4 py-3 text-sm text-muted-foreground">No quick reply matches “{query.trim()}”.</li>}
      </ul>
    </>
  );
}

/**
 * "row": a row of buttons above the reply box (tablets and computers).
 * "button": a lightning-bolt button beside the box that opens the list (phones).
 */
export function QuickReplyPicker({
  replies,
  onPick,
  variant,
}: {
  replies: QuickReply[];
  onPick: (body: string) => void;
  variant: "row" | "button";
}) {
  const [sheet, setSheet] = useState(false);
  const [all, setAll] = useState(false);
  const [manage, setManage] = useState(false);
  if (variant === "row") {
    return (
      <>
        <div className="mb-2 hidden flex-wrap items-center gap-1.5 sm:flex">
        <span className="mr-1 text-xs font-bold text-muted-foreground">Quick replies</span>
        {replies.slice(0, ROW_COUNT).map((r) => (
          <button
            key={r.id}
            type="button"
            title={r.body}
            onClick={() => onPick(r.body)}
            className="h-8 rounded-full border border-primary/35 bg-background px-3 text-xs font-semibold text-emphasis transition-colors hover:border-primary hover:bg-surface-blush focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {r.label}
          </button>
        ))}
        {replies.length > ROW_COUNT && (
          <Popover open={all} onOpenChange={setAll}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="inline-flex h-8 items-center gap-1 rounded-full border border-border bg-surface-ivory px-3 text-xs font-semibold text-foreground transition-colors hover:border-primary hover:bg-surface-blush focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                All replies ({replies.length})
                <ChevronDown className="size-3.5" aria-hidden="true" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" side="top" className="flex max-h-[min(28rem,70dvh)] w-96 flex-col gap-0 overflow-hidden p-0 pt-3">
              <p className="px-4 pb-2 text-sm font-bold">Quick replies</p>
              <QuickReplyList
                replies={replies}
                onPick={(body) => {
                  onPick(body);
                  setAll(false);
                }}
              />
              <button
                type="button"
                onClick={() => {
                  setAll(false);
                  setManage(true);
                }}
                className="flex items-center gap-2 border-t border-border px-4 py-3 text-left text-[13px] font-semibold text-emphasis hover:bg-surface-blush focus-visible:bg-surface-blush focus-visible:outline-none"
              >
                <Pencil className="size-3.5" aria-hidden="true" />
                Edit list
              </button>
            </PopoverContent>
          </Popover>
        )}
        <button
          type="button"
          onClick={() => setManage(true)}
          className="ml-1 text-xs font-semibold text-emphasis underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
        >
          {replies.length ? "Edit list" : "Add quick replies"}
        </button>
        </div>
        <QuickRepliesManager open={manage} onOpenChange={setManage} replies={replies} />
      </>
    );
  }
  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Quick replies"
        className="shrink-0 rounded-full border-primary/35 text-emphasis sm:hidden"
        onClick={() => setSheet(true)}
      >
        <Zap />
      </Button>

      <Sheet open={sheet} onOpenChange={setSheet}>
        <SheetContent side="bottom" className="max-h-[80dvh] rounded-t-3xl pb-[max(1rem,env(safe-area-inset-bottom))]">
          <SheetHeader className="pb-0">
            <SheetTitle>Quick replies</SheetTitle>
            <SheetDescription>Tap one to put it in the reply box, then edit and send.</SheetDescription>
          </SheetHeader>
          <QuickReplyList
            replies={replies}
            onPick={(body) => {
              onPick(body);
              setSheet(false);
            }}
          />
          <div className="px-4">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setSheet(false);
                setManage(true);
              }}
            >
              <Pencil data-icon="inline-start" />
              Edit list
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <QuickRepliesManager open={manage} onOpenChange={setManage} replies={replies} />
    </>
  );
}

const replySchema = z.object({
  label: z.string().trim().min(1, "Give it a short name.").max(40, "Keep the name under 40 characters."),
  body: z.string().trim().min(1, "Write the reply.").max(1000, "Keep it under 1000 characters."),
});
type ReplyValues = z.infer<typeof replySchema>;

function QuickRepliesManager({ open, onOpenChange, replies }: { open: boolean; onOpenChange: (open: boolean) => void; replies: QuickReply[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      const result = await fn();
      setError(result.ok ? null : (result.error ?? "That didn't work."));
      router.refresh();
    });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setEditing(null);
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Quick replies</DialogTitle>
          <DialogDescription>
            Saved answers for chats. <strong>{"{name}"}</strong> and <strong>{"{date}"}</strong> are filled in from the chat, and{" "}
            <strong>{"{price}"}</strong> with the website&apos;s starting price; anything in [brackets] is left for you to complete before sending.
          </DialogDescription>
        </DialogHeader>
        <ul className="grid gap-2" aria-busy={pending}>
          {replies.map((r, i) =>
            editing === r.id ? (
              <li key={r.id}>
                <ReplyForm initial={r} onCancel={() => setEditing(null)} onSaved={() => setEditing(null)} />
              </li>
            ) : (
              <li key={r.id} className="flex items-start gap-2 rounded-lg border border-border p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">{r.label}</p>
                  <p className="mt-0.5 line-clamp-2 text-[13px] text-muted-foreground">{r.body}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button type="button" variant="ghost" size="icon-sm" aria-label={`Move "${r.label}" up`} aria-disabled={i === 0 || pending || undefined} onClick={() => i > 0 && !pending && run(() => moveQuickReply(r.id, "up"))}>
                    <ArrowUp />
                  </Button>
                  <Button type="button" variant="ghost" size="icon-sm" aria-label={`Move "${r.label}" down`} aria-disabled={i === replies.length - 1 || pending || undefined} onClick={() => i < replies.length - 1 && !pending && run(() => moveQuickReply(r.id, "down"))}>
                    <ArrowDown />
                  </Button>
                  <Button type="button" variant="ghost" size="icon-sm" aria-label={`Edit "${r.label}"`} onClick={() => setEditing(r.id)}>
                    <Pencil />
                  </Button>
                  <Button type="button" variant="ghost" size="icon-sm" aria-label={`Delete "${r.label}"`} aria-disabled={pending || undefined} onClick={() => !pending && run(() => deleteQuickReply(r.id))}>
                    <Trash2 />
                  </Button>
                </div>
              </li>
            ),
          )}
          {replies.length === 0 && editing !== "new" && <li className="text-sm text-muted-foreground">No quick replies yet.</li>}
        </ul>
        {editing === "new" ? (
          <ReplyForm onCancel={() => setEditing(null)} onSaved={() => setEditing(null)} />
        ) : (
          <Button type="button" variant="outline" onClick={() => setEditing("new")}>
            <Plus data-icon="inline-start" />
            Add a quick reply
          </Button>
        )}
        <p role="alert" className="text-sm font-medium text-destructive empty:hidden">
          {error ?? ""}
        </p>
      </DialogContent>
    </Dialog>
  );
}

function ReplyForm({ initial, onCancel, onSaved }: { initial?: QuickReply; onCancel: () => void; onSaved: () => void }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReplyValues>({
    resolver: zodResolver(replySchema),
    defaultValues: { label: initial?.label ?? "", body: initial?.body ?? "" },
    shouldFocusError: true,
  });
  const idPrefix = initial ? `qr-${initial.id}` : "qr-new";
  return (
    <form
      noValidate
      className="grid gap-3 rounded-lg border border-primary/30 bg-surface-blush/40 p-3"
      onSubmit={handleSubmit(async (values) => {
        const result = await saveQuickReply({ id: initial?.id, ...values });
        if (!result.ok) return setError(result.error);
        router.refresh();
        onSaved();
      })}
    >
      <Field data-invalid={errors.label ? true : undefined}>
        <FieldLabel htmlFor={`${idPrefix}-label`}>Button name</FieldLabel>
        <Input id={`${idPrefix}-label`} placeholder="e.g. Date is free" aria-invalid={errors.label ? true : undefined} {...register("label")} />
        {errors.label && <FieldError>{errors.label.message}</FieldError>}
      </Field>
      <Field data-invalid={errors.body ? true : undefined}>
        <FieldLabel htmlFor={`${idPrefix}-body`}>Reply</FieldLabel>
        <Textarea id={`${idPrefix}-body`} rows={3} placeholder="Hi {name}! Good news: {date} is free." aria-invalid={errors.body ? true : undefined} {...register("body")} />
        {errors.body && <FieldError>{errors.body.message}</FieldError>}
      </Field>
      <p role="alert" className="text-sm font-medium text-destructive empty:hidden">
        {error ?? ""}
      </p>
      <div className="flex gap-2">
        <Button type="submit" size="sm" pending={isSubmitting} pendingLabel="Saving…">
          Save
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
