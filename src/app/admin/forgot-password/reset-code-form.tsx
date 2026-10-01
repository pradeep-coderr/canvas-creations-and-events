"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Circle, CircleAlert, MailCheck, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeInput } from "@/components/ui/code-input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import {
  PASSWORD_MIN,
  RESET_CODE_LENGTH,
  resetWithCodeSchema,
  type ResetWithCodeValues,
} from "@/lib/admin/auth-schemas";
import { cn } from "@/lib/utils";
import { resetPasswordWithCode, type ResetWithCodeState } from "../password-actions";

const RESEND_AFTER_SECONDS = 60;

const rules = [
  { label: `At least ${PASSWORD_MIN} characters`, test: (v: string) => v.length >= PASSWORD_MIN },
  { label: "Contains a letter", test: (v: string) => /[A-Za-z]/.test(v) },
  { label: "Contains a number", test: (v: string) => /\d/.test(v) },
];

/**
 * Step 2 of "Forgot password": the 6-digit code from the email and a new
 * password, in one form. "Send a new code" is available after a short wait
 * (Supabase also limits how often codes are sent).
 */
export function ResetCodeForm({
  email,
  sentAt,
  resending,
  onResend,
  onChangeEmail,
}: {
  email: string;
  sentAt: number;
  resending: boolean;
  onResend: () => void;
  onChangeEmail: () => void;
}) {
  const [state, action, pending] = useActionState<ResetWithCodeState, FormData>(resetPasswordWithCode, {});
  const headingRef = useRef<HTMLHeadingElement>(null);
  const {
    control,
    register,
    handleSubmit,
    setError,
    setFocus,
    resetField,
    formState: { errors },
  } = useForm<ResetWithCodeValues>({
    resolver: zodResolver(resetWithCodeSchema),
    defaultValues: { email, code: "", password: "", confirm: "" },
    mode: "onTouched",
    shouldFocusError: false,
  });
  const [password] = useWatch({ control, name: ["password"] });

  // Countdown until a new code may be sent.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const wait = Math.max(0, RESEND_AFTER_SECONDS - Math.floor((now - sentAt) / 1000));

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  // Server answers: show them on the fields; a wrong code clears the boxes.
  useEffect(() => {
    const fe = state.fieldErrors;
    if (!fe) return;
    if (fe.code) {
      resetField("code");
      setError("code", { message: fe.code });
      requestAnimationFrame(() => document.getElementById("reset-code")?.focus());
    }
    if (fe.password) setError("password", { message: fe.password });
    if (fe.confirm) setError("confirm", { message: fe.confirm });
  }, [state, setError, resetField]);

  const onSubmit = handleSubmit(
    (values) => {
      const data = new FormData();
      data.set("email", values.email);
      data.set("code", values.code.replace(/\s/g, ""));
      data.set("password", values.password);
      data.set("confirm", values.confirm);
      startTransition(() => action(data));
    },
    (invalid) => {
      // Focus the first problem in reading order (the code boxes aren't a single input).
      if (invalid.code) document.getElementById("reset-code")?.focus();
      else if (invalid.password) setFocus("password");
      else if (invalid.confirm) setFocus("confirm");
    },
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div className="space-y-3 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface-blush">
          <MailCheck aria-hidden="true" className="size-5 text-primary" />
        </span>
        <h2 ref={headingRef} tabIndex={-1} className="font-display text-display-sm font-title outline-none">
          Enter your code
        </h2>
        <p role="status" className="text-sm text-muted-foreground">
          If an admin account uses <span className="font-semibold break-all text-foreground">{email}</span>, we&apos;ve
          emailed it a {RESET_CODE_LENGTH}-digit code. It expires in 10 minutes. Check your spam folder too.
        </p>
      </div>

      <input type="hidden" {...register("email")} />

      <Field data-invalid={errors.code ? true : undefined}>
        <FieldLabel id="reset-code-label" htmlFor="reset-code">
          {RESET_CODE_LENGTH}-digit code
        </FieldLabel>
        <Controller
          control={control}
          name="code"
          render={({ field }) => (
            <CodeInput
              id="reset-code"
              length={RESET_CODE_LENGTH}
              value={field.value}
              onChange={field.onChange}
              invalid={!!errors.code}
              labelledBy="reset-code-label"
              describedBy={errors.code ? "reset-code-error" : undefined}
            />
          )}
        />
        {errors.code && <FieldError id="reset-code-error">{errors.code.message}</FieldError>}
      </Field>

      <Field data-invalid={errors.password ? true : undefined}>
        <FieldLabel htmlFor="new-password">New password</FieldLabel>
        <PasswordInput
          id="new-password"
          autoComplete="new-password"
          aria-required
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={errors.password ? "new-password-rules new-password-error" : "new-password-rules"}
          {...register("password")}
        />
        <ul id="new-password-rules" className="grid gap-1.5 text-sm" aria-label="Password requirements">
          {rules.map((rule) => {
            const met = rule.test(password ?? "");
            return (
              <li key={rule.label} className={cn("flex items-center gap-2", met ? "text-foreground" : "text-muted-foreground")}>
                {met ? <Check aria-hidden="true" className="size-4 text-primary" /> : <Circle aria-hidden="true" className="size-4" />}
                {rule.label}
                <span className="sr-only">{met ? " (done)" : " (not yet)"}</span>
              </li>
            );
          })}
        </ul>
        {errors.password && <FieldError id="new-password-error">{errors.password.message}</FieldError>}
      </Field>

      <Field data-invalid={errors.confirm ? true : undefined}>
        <FieldLabel htmlFor="confirm-password">Confirm new password</FieldLabel>
        <PasswordInput
          id="confirm-password"
          autoComplete="new-password"
          aria-required
          aria-invalid={errors.confirm ? true : undefined}
          aria-describedby={errors.confirm ? "confirm-password-error" : undefined}
          {...register("confirm")}
        />
        {errors.confirm && <FieldError id="confirm-password-error">{errors.confirm.message}</FieldError>}
      </Field>

      {state.error && !state.fieldErrors?.code && (
        <p
          role="alert"
          className="flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm font-medium text-destructive"
        >
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" pending={pending} pendingLabel="Updating password…">
        Update password
      </Button>

      <div className="flex flex-col items-center gap-2 text-sm sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          pending={resending}
          pendingLabel="Sending…"
          aria-disabled={wait > 0 || undefined}
          onClick={() => wait === 0 && !resending && onResend()}
        >
          <RotateCw data-icon="inline-start" aria-hidden="true" />
          {wait > 0 ? `Send a new code in ${wait}s` : "Send a new code"}
        </Button>
        <button
          type="button"
          onClick={onChangeEmail}
          className="font-semibold text-emphasis underline-offset-4 hover:underline focus-visible:underline"
        >
          Use a different email
        </button>
      </div>
    </form>
  );
}
