"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { requestPasswordReset, type ResetRequestState } from "../password-actions";

export function ForgotPasswordForm({ invalidLink }: { invalidLink: boolean }) {
  const [state, action, pending] = useActionState<ResetRequestState, FormData>(requestPasswordReset, {});
  const doneRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (state.sent) doneRef.current?.focus();
  }, [state.sent]);

  if (state.sent) {
    return (
      <div className="space-y-6">
        <p ref={doneRef} tabIndex={-1} role="status" className="outline-none">
          If an account exists for that address, a password reset link has been sent. Check your inbox (and spam
          folder), then open the link on this device.
        </p>
        <Link href="/admin/login" className="inline-block font-semibold underline underline-offset-4">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={action} noValidate className="space-y-6" aria-describedby={state.error ? "forgot-error" : undefined}>
      {invalidLink && (
        <p role="alert" className="border-l-2 border-destructive pl-3 text-sm">
          That reset link has expired or was already used. Request a new one below.
        </p>
      )}
      <Field>
        <FieldLabel htmlFor="forgot-email">Email address</FieldLabel>
        <Input id="forgot-email" name="email" type="email" autoComplete="username" required aria-invalid={state.error ? true : undefined} />
      </Field>
      {state.error && (
        <p id="forgot-error" role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" pending={pending} pendingLabel="Sending reset link…">
        Send reset link
      </Button>
      <p className="text-center text-sm">
        <Link href="/admin/login" className="font-semibold underline underline-offset-4">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
