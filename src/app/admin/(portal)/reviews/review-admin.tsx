"use client";

import { useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, EyeOff, Plus, RotateCcw, Star, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Stars } from "@/components/shared/stars";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { describeActionFailure } from "@/lib/admin/action-error";
import { formatShortDateTime } from "@/lib/datetime";
import { REVIEW_MESSAGE_MAX, reviewStatusLabels, type ReviewStatus } from "@/lib/review";
import { cn } from "@/lib/utils";
import { addReview, deleteReview, setReviewStatus, type ReviewActionResult } from "./actions";

export interface AdminReview {
  id: string;
  name: string;
  email: string | null;
  event_type: string | null;
  rating: number;
  message: string;
  can_publish: boolean;
  status: ReviewStatus;
  source: "website" | "admin";
  created_at: string;
  approved_at: string | null;
}

/** One review with its moderation buttons. */
export function ReviewCard({ review }: { review: AdminReview }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<ReviewStatus | null>(null);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const deleteRef = useRef<HTMLButtonElement>(null);

  const change = (next: ReviewStatus) =>
    startTransition(async () => {
      setBusy(next);
      let result: ReviewActionResult;
      try {
        result = await setReviewStatus({ id: review.id, status: next });
      } catch (error) {
        result = { ok: false, error: describeActionFailure(error).text };
      }
      setBusy(null);
      setStatus(result.ok ? { ok: true, text: result.message } : { ok: false, text: result.error });
      if (result.ok) router.refresh();
    });

  const tone =
    !review.can_publish ? "border-l-foreground/30" : review.status === "approved" ? "border-l-primary" : review.status === "new" ? "border-l-highlight" : "border-l-border";

  return (
    <li className={cn("border border-l-4 border-border bg-background p-5 sm:p-6", tone)}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Stars rating={review.rating} />
        <span className="text-sm font-semibold">{review.rating} / 5</span>
        <span
          className={cn(
            "rounded-sm px-2 py-0.5 text-xs font-semibold",
            !review.can_publish
              ? "bg-muted text-foreground"
              : review.status === "approved"
                ? "bg-primary text-primary-foreground"
                : review.status === "new"
                  ? "bg-surface-blush text-foreground"
                  : "bg-muted text-muted-foreground",
          )}
        >
          {review.can_publish ? reviewStatusLabels[review.status] : "Private feedback"}
        </span>
        {review.source === "admin" && <span className="text-xs text-muted-foreground">Added by an admin</span>}
        <span className="ml-auto text-sm text-muted-foreground tabular-nums">{formatShortDateTime(review.created_at)}</span>
      </div>

      <blockquote className="mt-4 max-w-prose whitespace-pre-line">{review.message}</blockquote>

      <p className="mt-4 text-sm">
        <span className="font-semibold">{review.name}</span>
        {review.event_type && <span className="text-muted-foreground"> · {review.event_type}</span>}
        {review.email && (
          <>
            {" · "}
            <a href={`mailto:${review.email}`} className="underline underline-offset-4">
              {review.email}
            </a>
          </>
        )}
      </p>
      {!review.can_publish && (
        <p className="mt-2 text-sm text-muted-foreground">
          The client chose to keep this private, so it can&apos;t be shown on the website.
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {review.can_publish && review.status !== "approved" && (
          <Button type="button" pending={busy === "approved"} pendingLabel="Approving…" aria-disabled={pending || undefined} onClick={() => !pending && change("approved")}>
            <Check data-icon="inline-start" aria-hidden="true" />
            Approve and show
          </Button>
        )}
        {review.can_publish && review.status === "approved" && (
          <Button type="button" variant="outline" pending={busy === "hidden"} pendingLabel="Hiding…" aria-disabled={pending || undefined} onClick={() => !pending && change("hidden")}>
            <EyeOff data-icon="inline-start" aria-hidden="true" />
            Hide from website
          </Button>
        )}
        {review.status === "new" && review.can_publish && (
          <Button type="button" variant="outline" pending={busy === "hidden"} pendingLabel="Hiding…" aria-disabled={pending || undefined} onClick={() => !pending && change("hidden")}>
            <EyeOff data-icon="inline-start" aria-hidden="true" />
            Don&apos;t show
          </Button>
        )}
        {review.status === "hidden" && (
          <Button type="button" variant="ghost" pending={busy === "new"} pendingLabel="Moving…" aria-disabled={pending || undefined} onClick={() => !pending && change("new")}>
            <RotateCcw data-icon="inline-start" aria-hidden="true" />
            Back to New
          </Button>
        )}
        {!review.can_publish && review.status === "new" && (
          <Button type="button" variant="outline" pending={busy === "hidden"} pendingLabel="Saving…" aria-disabled={pending || undefined} onClick={() => !pending && change("hidden")}>
            <Check data-icon="inline-start" aria-hidden="true" />
            Mark as read
          </Button>
        )}
        <Button ref={deleteRef} type="button" variant="ghost" className="text-destructive" onClick={() => setDeleting(true)}>
          <Trash2 data-icon="inline-start" aria-hidden="true" />
          Delete
        </Button>
      </div>
      <p role="status" className={cn("mt-3 text-sm empty:hidden", status?.ok ? "text-muted-foreground" : "font-medium text-destructive")}>
        {status?.text ?? ""}
      </p>

      <ConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        title="Delete this review?"
        description={<p>{review.name}&apos;s review will be permanently deleted{review.status === "approved" ? " and removed from the website" : ""}.</p>}
        confirmLabel="Delete review"
        destructive
        returnFocus={deleteRef}
        onConfirm={async () => {
          const result = await deleteReview(review.id);
          if (!result.ok) return result.error;
          router.refresh();
        }}
      />
    </li>
  );
}

/** Add a review the client sent another way (with their permission). */
export function AddReview() {
  const id = useId();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const addRef = useRef<HTMLButtonElement>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    const data = new FormData(event.currentTarget);
    setSaving(true);
    setError(null);
    try {
      const result = await addReview({
        name: String(data.get("name") ?? ""),
        eventType: String(data.get("eventType") ?? ""),
        rating,
        message: String(data.get("message") ?? ""),
        publishNow: data.get("publishNow") === "on",
        permission: data.get("permission") === "on",
      });
      if (result.ok) {
        setOpen(false);
        setRating(0);
        setErrors({});
        router.refresh();
      } else {
        setErrors(result.fieldErrors ?? {});
        setError(result.error);
      }
    } catch (e) {
      setError(describeActionFailure(e).text);
    } finally {
      setSaving(false);
    }
  };

  const err = (key: string) =>
    errors[key] ? (
      <p id={`${id}-${key}-error`} className="text-sm font-medium text-destructive">
        {errors[key]}
      </p>
    ) : null;

  return (
    <>
      <Button ref={addRef} type="button" variant="outline" onClick={() => setOpen(true)}>
        <Plus data-icon="inline-start" aria-hidden="true" />
        Add a review
      </Button>
      <Dialog open={open} onOpenChange={(o) => !saving && setOpen(o)}>
        <DialogContent
          className="sm:max-w-lg"
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            addRef.current?.focus();
          }}
        >
          <DialogHeader>
            <DialogTitle>Add a review</DialogTitle>
            <DialogDescription>
              For reviews a client sent you another way, e.g. by message or email. Copy their words exactly.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} noValidate className="grid gap-4">
            <fieldset className="grid gap-2" aria-describedby={errors.rating ? `${id}-rating-error` : undefined}>
              <legend className="mb-1 text-sm font-semibold">Rating</legend>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((value) => (
                  <label key={value} className="cursor-pointer rounded-md p-1 has-focus-visible:ring-2 has-focus-visible:ring-ring">
                    <input type="radio" name="rating" className="sr-only" checked={rating === value} onChange={() => setRating(value)} />
                    <Star
                      aria-hidden="true"
                      strokeWidth={1.5}
                      className={cn("size-8", value <= rating ? "fill-highlight text-highlight" : "fill-transparent text-foreground/35")}
                    />
                    <span className="sr-only">{value} {value === 1 ? "star" : "stars"}</span>
                  </label>
                ))}
              </div>
              {err("rating")}
            </fieldset>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor={`${id}-name`}>Client&apos;s name</Label>
                <Input id={`${id}-name`} name="name" maxLength={100} aria-invalid={errors.name ? true : undefined} aria-describedby={errors.name ? `${id}-name-error` : undefined} />
                {err("name")}
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`${id}-event`}>Event (optional)</Label>
                <Input id={`${id}-event`} name="eventType" maxLength={100} placeholder="e.g. Wedding" />
                {err("eventType")}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`${id}-message`}>Their review</Label>
              <Textarea id={`${id}-message`} name="message" rows={5} maxLength={REVIEW_MESSAGE_MAX} aria-invalid={errors.message ? true : undefined} aria-describedby={errors.message ? `${id}-message-error` : undefined} />
              {err("message")}
            </div>
            <label className="flex min-h-11 items-start gap-3 text-sm">
              <input type="checkbox" name="permission" className="mt-1 size-4 accent-(--primary)" aria-describedby={errors.permission ? `${id}-permission-error` : undefined} />
              The client is happy for this review to be shown on the website.
            </label>
            {err("permission")}
            <label className="flex min-h-11 items-center gap-3 text-sm">
              <input type="checkbox" name="publishNow" defaultChecked className="size-4 accent-(--primary)" />
              Show it on the website now
            </label>
            <p role="alert" className="text-sm font-medium text-destructive empty:hidden">
              {error ?? ""}
            </p>
            <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" aria-disabled={saving || undefined} onClick={() => !saving && setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" pending={saving} pendingLabel="Adding…">
                Add review
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
