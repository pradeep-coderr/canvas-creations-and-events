"use client";

import { startTransition, useActionState, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CircleAlert, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { forgotSchema, type ForgotValues } from "@/lib/admin/auth-schemas";
import { requestPasswordReset, type ResetRequestState } from "../password-actions";
import { ResetCodeForm } from "./reset-code-form";

const backLink = (
  <Link
    href="/admin/login"
    className="inline-flex items-center gap-2 font-semibold text-emphasis underline-offset-4 hover:underline focus-visible:underline"
  >
    <ArrowLeft aria-hidden="true" className="size-4" />
    Back to sign in
  </Link>
);

/**
 * Forgot password, in two steps on one page: 1. the email address → a
 * 6-digit code is emailed; 2. the code + a new password (ResetCodeForm).
 */
export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<ResetRequestState, FormData>(requestPasswordReset, {});
  const [changingEmail, setChangingEmail] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotValues>({ resolver: zodResolver(forgotSchema), defaultValues: { email: "" }, shouldFocusError: true });

  const send = (email: string) => {
    const data = new FormData();
    data.set("email", email);
    startTransition(() => action(data));
  };
  const onSubmit = handleSubmit((values) => {
    setChangingEmail(false);
    send(values.email);
  });

  if (state.sent && state.email && state.sentAt && !changingEmail) {
    return (
      <div className="space-y-6">
        <ResetCodeForm
          key={state.sentAt}
          email={state.email}
          sentAt={state.sentAt}
          resending={pending}
          onResend={() => send(state.email!)}
          onChangeEmail={() => setChangingEmail(true)}
        />
        <p className="text-center text-sm">{backLink}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6" aria-describedby={state.error ? "forgot-error" : undefined}>
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
      <Button type="submit" size="lg" className="w-full" pending={pending} pendingLabel="Sending code…">
        Email me a code
      </Button>
      <p className="text-center text-sm">{backLink}</p>
    </form>
  );
}
