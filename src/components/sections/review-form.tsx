"use client";

import { useId, useRef, useState } from "react";
import { MessageSquareHeart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { REVIEW_MESSAGE_MAX, reviewSchema } from "@/lib/review";
import { submitReview } from "@/lib/submit-review";
import { cn } from "@/lib/utils";

type FieldName = "rating" | "name" | "message" | "eventType" | "email" | "canPublish";
type Status = "idle" | "submitting" | "sent" | "error";

const ratingWords = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

/**
 * "Leave a review": a button that opens the review form in a dialog (focus
 * trapped, Escape closes, focus returns to the button). The visitor chooses
 * whether their review may appear on the website; either way it reaches the
 * team, and nothing is public until an admin approves it.
 */
export function ReviewForm({ label, enabled }: { label: React.ReactNode; enabled: boolean }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [canPublish, setCanPublish] = useState<boolean | null>(null);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<{ canPublish: boolean } | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [messageLength, setMessageLength] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const thanksRef = useRef<HTMLHeadingElement>(null);

  const reset = () => {
    setRating(0);
    setHover(0);
    setCanPublish(null);
    setErrors({});
    setStatus("idle");
    setResult(null);
    setFailure(null);
    setMessageLength(0);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "submitting") return;
    const data = new FormData(event.currentTarget);
    const input = {
      name: String(data.get("name") ?? ""),
      rating,
      message: String(data.get("message") ?? ""),
      eventType: String(data.get("eventType") ?? ""),
      email: String(data.get("email") ?? ""),
      canPublish: canPublish ?? undefined,
    };
    const parsed = reviewSchema.safeParse(input);
    if (!parsed.success) {
      const next: Partial<Record<FieldName, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as FieldName;
        next[key] ??= key === "canPublish" ? "Please choose whether we may show your review." : issue.message;
      }
      setErrors(next);
      // Focus the first field that needs attention, in reading order.
      const first = (["rating", "name", "message", "eventType", "email", "canPublish"] as FieldName[]).find((k) => next[k]);
      formRef.current?.querySelector<HTMLElement>(`[data-field="${first}"]`)?.focus();
      return;
    }
    setErrors({});
    setFailure(null);
    if (!enabled) {
      setFailure("This is a preview: reviews are sent from the live website.");
      return;
    }
    if (!navigator.onLine) {
      setFailure("You seem to be offline. Please check your connection and try again.");
      return;
    }
    setStatus("submitting");
    try {
      const outcome = await submitReview(parsed.data, data.get("hp_field"));
      if (outcome.status === "sent") {
        setResult({ canPublish: outcome.canPublish });
        setStatus("sent");
        requestAnimationFrame(() => thanksRef.current?.focus());
        return;
      }
      setStatus("error");
      setFailure(
        outcome.status === "unavailable"
          ? "Reviews can't be sent just yet. Please try again later."
          : outcome.message,
      );
    } catch {
      setStatus("error");
      setFailure("Your review couldn't be sent. Please try again in a moment.");
    }
  };

  const shown = hover || rating;
  const describe = (name: FieldName) => (errors[name] ? `${id}-${name}-error` : undefined);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        // A sent form starts fresh next time; an unsent one keeps what was typed.
        if (!next && status === "sent") reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="lg" variant="outline">
          <MessageSquareHeart data-icon="inline-start" aria-hidden="true" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        {status === "sent" && result ? (
          <div className="py-4 text-center">
            <DialogTitle asChild>
              <h2 ref={thanksRef} tabIndex={-1} className="font-display text-display-sm font-title outline-none">
                Thank you!
              </h2>
            </DialogTitle>
            <DialogDescription className="mt-3 text-base">
              {result.canPublish
                ? "We've received your review. It will appear on our website once our team has had a look."
                : "Your feedback has gone straight to our team. It won't be shown on the website."}
            </DialogDescription>
            <Button type="button" className="mt-8" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-display-sm font-title">Leave a review</DialogTitle>
              <DialogDescription>
                Tell us how your celebration went. Our team reads every review, and checks it before it appears on the website.
              </DialogDescription>
            </DialogHeader>

            <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-6">
              {/* Rating: five radio buttons drawn as stars (arrow keys move between them). */}
              <fieldset aria-describedby={describe("rating")} className="grid gap-2">
                <legend className="mb-2 text-sm font-semibold">Your rating</legend>
                <div className="flex flex-wrap items-center gap-3" onMouseLeave={() => setHover(0)}>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <label
                        key={value}
                        onMouseEnter={() => setHover(value)}
                        className="cursor-pointer rounded-md p-1 has-focus-visible:ring-2 has-focus-visible:ring-ring"
                      >
                        <input
                          type="radio"
                          name="rating-choice"
                          value={value}
                          checked={rating === value}
                          onChange={() => {
                            setRating(value);
                            setErrors((e) => ({ ...e, rating: undefined }));
                          }}
                          data-field={value === 1 ? "rating" : undefined}
                          className="sr-only"
                        />
                        <Star
                          aria-hidden="true"
                          strokeWidth={1.5}
                          className={cn(
                            "size-9 transition-colors sm:size-8",
                            value <= shown ? "fill-highlight text-highlight" : "fill-transparent text-foreground/35",
                          )}
                        />
                        <span className="sr-only">
                          {value} {value === 1 ? "star" : "stars"}, {ratingWords[value]}
                        </span>
                      </label>
                    ))}
                  </div>
                  <span aria-hidden="true" className="min-w-20 text-sm text-muted-foreground">
                    {shown ? ratingWords[shown] : "Choose 1 to 5 stars"}
                  </span>
                </div>
                {errors.rating && <FieldError id={`${id}-rating-error`}>{errors.rating}</FieldError>}
              </fieldset>

              <div className="grid gap-6 sm:grid-cols-2">
                <Field data-invalid={!!errors.name || undefined}>
                  <FieldLabel htmlFor={`${id}-name`}>Your name</FieldLabel>
                  <Input
                    id={`${id}-name`}
                    name="name"
                    autoComplete="name"
                    maxLength={100}
                    data-field="name"
                    aria-required
                    aria-invalid={!!errors.name || undefined}
                    aria-describedby={describe("name")}
                  />
                  {errors.name && <FieldError id={`${id}-name-error`}>{errors.name}</FieldError>}
                </Field>
                <Field data-invalid={!!errors.eventType || undefined}>
                  <FieldLabel htmlFor={`${id}-event`}>
                    Your event <span className="font-normal text-muted-foreground">(optional)</span>
                  </FieldLabel>
                  <Input
                    id={`${id}-event`}
                    name="eventType"
                    maxLength={100}
                    placeholder="e.g. Wedding, 30th birthday"
                    data-field="eventType"
                    aria-invalid={!!errors.eventType || undefined}
                    aria-describedby={describe("eventType")}
                  />
                  {errors.eventType && <FieldError id={`${id}-eventType-error`}>{errors.eventType}</FieldError>}
                </Field>
              </div>

              <Field data-invalid={!!errors.message || undefined}>
                <FieldLabel htmlFor={`${id}-message`}>Your review</FieldLabel>
                <Textarea
                  id={`${id}-message`}
                  name="message"
                  rows={5}
                  maxLength={REVIEW_MESSAGE_MAX}
                  data-field="message"
                  className="min-h-32"
                  aria-required
                  aria-invalid={!!errors.message || undefined}
                  aria-describedby={[describe("message"), `${id}-message-count`].filter(Boolean).join(" ")}
                  onChange={(e) => setMessageLength(e.target.value.length)}
                />
                <p id={`${id}-message-count`} className="text-right text-xs text-muted-foreground">
                  {messageLength} / {REVIEW_MESSAGE_MAX}
                </p>
                {errors.message && <FieldError id={`${id}-message-error`}>{errors.message}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.email || undefined}>
                <FieldLabel htmlFor={`${id}-email`}>
                  Email <span className="font-normal text-muted-foreground">(optional)</span>
                </FieldLabel>
                <Input
                  id={`${id}-email`}
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  maxLength={254}
                  data-field="email"
                  aria-invalid={!!errors.email || undefined}
                  aria-describedby={[describe("email"), `${id}-email-hint`].filter(Boolean).join(" ")}
                />
                <p id={`${id}-email-hint`} className="text-sm text-muted-foreground">
                  Only so we can reply to you. It&apos;s never shown on the website.
                </p>
                {errors.email && <FieldError id={`${id}-email-error`}>{errors.email}</FieldError>}
              </Field>

              <fieldset aria-describedby={describe("canPublish")} className="grid gap-3">
                <legend className="mb-1 text-sm font-semibold">Can we show your review on our website?</legend>
                {[
                  { value: true, text: "Yes — show my name, stars and review" },
                  { value: false, text: "No — it's private feedback for the team" },
                ].map((option, i) => (
                  <label key={String(option.value)} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
                    <input
                      type="radio"
                      name="can-publish"
                      checked={canPublish === option.value}
                      onChange={() => {
                        setCanPublish(option.value);
                        setErrors((e) => ({ ...e, canPublish: undefined }));
                      }}
                      data-field={i === 0 ? "canPublish" : undefined}
                      className="size-4 accent-(--primary)"
                    />
                    {option.text}
                  </label>
                ))}
                {errors.canPublish && <FieldError id={`${id}-canPublish-error`}>{errors.canPublish}</FieldError>}
              </fieldset>

              {/* Honeypot for bots: hidden from people and assistive technology. */}
              <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
                <label htmlFor={`${id}-hp`}>Leave this field empty</label>
                <input
                  id={`${id}-hp`}
                  name="hp_field"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  data-1p-ignore
                  data-lpignore="true"
                  data-bwignore
                  data-form-type="other"
                />
              </div>

              <p role="alert" className="text-sm font-medium text-destructive empty:hidden">
                {failure ?? ""}
              </p>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" pending={status === "submitting"} pendingLabel="Sending…">
                  Send review
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
