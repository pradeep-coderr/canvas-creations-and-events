"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { updatePassword, type NewPasswordState } from "../password-actions";

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState<NewPasswordState, FormData>(updatePassword, {});
  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} noValidate className="space-y-6">
      <Field data-invalid={fe.password ? true : undefined}>
        <FieldLabel htmlFor="new-password">New password</FieldLabel>
        <Input
          id="new-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          aria-invalid={fe.password ? true : undefined}
          aria-describedby={fe.password ? "new-password-hint new-password-error" : "new-password-hint"}
        />
        <FieldDescription id="new-password-hint">At least 8 characters, with letters and numbers.</FieldDescription>
        {fe.password && (
          <p id="new-password-error" className="text-sm font-medium text-destructive">
            {fe.password}
          </p>
        )}
      </Field>
      <Field data-invalid={fe.confirm ? true : undefined}>
        <FieldLabel htmlFor="confirm-password">Confirm new password</FieldLabel>
        <Input
          id="confirm-password"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          aria-invalid={fe.confirm ? true : undefined}
          aria-describedby={fe.confirm ? "confirm-password-error" : undefined}
        />
        {fe.confirm && (
          <p id="confirm-password-error" className="text-sm font-medium text-destructive">
            {fe.confirm}
          </p>
        )}
      </Field>
      {state.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" pending={pending} pendingLabel="Updating password…">
        Update password
      </Button>
    </form>
  );
}
