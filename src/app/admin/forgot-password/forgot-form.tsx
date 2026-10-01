"use client";

import { startTransition, useActionState, useCallback, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CircleAlert, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { forgotSchema, type ForgotValues } from "@/lib/admin/auth-schemas";
import { requestPasswordReset, type ResetRequestState } from "../password-actions";
import { CodeStep } from "./code-step";
import { PasswordStep } from "./password-step";
import { ResetSteps, type ResetStep } from "./reset-steps";

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
 * Forgot password in three steps on one page:
 *   1. email → a 6-digit code is emailed
 *   2. the code (CodeStep: expiry + resend timers, checked automatically)
 *   3. a new password (PasswordStep)
 */
export function ForgotPasswordForm() {
  // A failed *resend* keeps the code step (and the code already sent) and
  // just adds the error; a failed first request stays on the email step.
  const [state, action, pending] = useActionState<ResetRequestState, FormData>(async (prev, data) => {
    const result = await requestPasswordReset(prev, data);
    return result.error && prev.sent && prev.email === String(data.get("email") ?? "").trim().toLowerCase()
      ? { ...prev, error: result.error }
      : result;
  }, {});
  const [changingEmail, setChangingEmail] = useState(false);
  const [verified, setVerified] = useState(false);
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
    setVerified(false);
    send(values.email);
  });
  const onVerified = useCallback(() => setVerified(true), []);

  const codeSent = Boolean(state.sent && state.email && state.sentAt && !changingEmail);
  const step: ResetStep = !codeSent ? "email" : verified ? "password" : "code";

  return (
    <div>
      <ResetSteps current={step} />

      {step === "password" ? (
        <PasswordStep
          onRestart={() => {
            setVerified(false);
            setChangingEmail(true);
          }}
        />
      ) : step === "code" ? (
        <CodeStep
          key={state.sentAt}
          email={state.email!}
          sentAt={state.sentAt!}
          resending={pending}
          onResend={() => send(state.email!)}
          resendError={state.error}
          onVerified={onVerified}
          onChangeEmail={() => setChangingEmail(true)}
        />
      ) : (
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
        </form>
      )}

      <p className="mt-6 text-center text-sm">{backLink}</p>
    </div>
  );
}
