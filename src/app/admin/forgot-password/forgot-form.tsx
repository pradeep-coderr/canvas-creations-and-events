"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CircleAlert, Mail, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { forgotSchema, type ForgotValues } from "@/lib/admin/auth-schemas";
import { requestPasswordReset, type ResetRequestState } from "../password-actions";

const backLink = (
  <Link
    href="/admin/login"
    className="inline-flex items-center gap-2 font-semibold text-emphasis underline-offset-4 hover:underline focus-visible:underline"
  >
    <ArrowLeft aria-hidden="true" className="size-4" />
    Back to sign in
  </Link>
);

export function ForgotPasswordForm({ invalidLink }: { invalidLink: boolean }) {
  const [state, action, pending] = useActionState<ResetRequestState, FormData>(requestPasswordReset, {});
  const doneRef = useRef<HTMLHeadingElement>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotValues>({ resolver: zodResolver(forgotSchema), defaultValues: { email: "" }, shouldFocusError: true });

  useEffect(() => {
    if (state.sent) doneRef.current?.focus();
  }, [state.sent]);

  const onSubmit = handleSubmit((values) => {
    const data = new FormData();
    data.set("email", values.email);
    startTransition(() => action(data));
  });

  if (state.sent) {
    return (
      <div className="space-y-5 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-surface-blush">
          <MailCheck aria-hidden="true" className="size-6 text-primary" />
        </span>
        <h2 ref={doneRef} tabIndex={-1} className="font-display text-display-sm font-title outline-none">
          Check your email
        </h2>
        <p role="status" className="text-sm text-muted-foreground">
          If an account exists for that address, a password reset link has been sent. Check your inbox (and spam
          folder), then open the link on this device.
        </p>
        <p className="text-sm">{backLink}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6" aria-describedby={state.error ? "forgot-error" : undefined}>
      {invalidLink && (
        <p
          role="alert"
          className="flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm"
        >
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-destructive" />
          That reset link has expired or was already used. Request a new one below.
        </p>
      )}
      <Field data-invalid={errors.email ? true : undefined}>
        <FieldLabel htmlFor="forgot-email">Email address</FieldLabel>
        <div className="relative">
          <Mail
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="forgot-email"
            type="email"
            autoComplete="username"
            inputMode="email"
            placeholder="you@example.com"
            aria-required
            aria-invalid={errors.email || state.error ? true : undefined}
            aria-describedby={errors.email ? "forgot-email-error" : undefined}
            className="pl-10"
            {...register("email")}
          />
        </div>
        {errors.email && <FieldError id="forgot-email-error">{errors.email.message}</FieldError>}
      </Field>
      {state.error && (
        <p
          id="forgot-error"
          role="alert"
          className="flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm font-medium text-destructive"
        >
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {state.error}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" pending={pending} pendingLabel="Sending reset link…">
        Send reset link
      </Button>
      <p className="text-center text-sm">{backLink}</p>
    </form>
  );
}
