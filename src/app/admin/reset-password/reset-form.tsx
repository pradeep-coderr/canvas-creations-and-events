"use client";

import { useActionState, useState } from "react";
import { Check, CircleAlert, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { cn } from "@/lib/utils";
import { updatePassword, type NewPasswordState } from "../password-actions";

/** Live checklist for the same rules the server enforces. */
const rules = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { label: "Contains a letter", test: (v: string) => /[A-Za-z]/.test(v) },
  { label: "Contains a number", test: (v: string) => /\d/.test(v) },
];

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState<NewPasswordState, FormData>(updatePassword, {});
  const fe = state.fieldErrors ?? {};
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const mismatch = confirm.length > 0 && confirm !== password;

  return (
    <form action={action} noValidate className="space-y-6">
      <Field data-invalid={fe.password ? true : undefined}>
        <FieldLabel htmlFor="new-password">New password</FieldLabel>
        <PasswordInput
          id="new-password"
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={fe.password ? true : undefined}
          aria-describedby={fe.password ? "new-password-rules new-password-error" : "new-password-rules"}
        />
        <ul id="new-password-rules" className="grid gap-1.5 text-sm" aria-label="Password requirements">
          {rules.map((rule) => {
            const met = rule.test(password);
            return (
              <li key={rule.label} className={cn("flex items-center gap-2", met ? "text-foreground" : "text-muted-foreground")}>
                {met ? (
                  <Check aria-hidden="true" className="size-4 text-primary" />
                ) : (
                  <Circle aria-hidden="true" className="size-4" />
                )}
                {rule.label}
                <span className="sr-only">{met ? " (done)" : " (not yet)"}</span>
              </li>
            );
          })}
        </ul>
        {fe.password && (
          <p id="new-password-error" className="text-sm font-medium text-destructive">
            {fe.password}
          </p>
        )}
      </Field>
      <Field data-invalid={fe.confirm || mismatch ? true : undefined}>
        <FieldLabel htmlFor="confirm-password">Confirm new password</FieldLabel>
        <PasswordInput
          id="confirm-password"
          name="confirm"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          aria-invalid={fe.confirm || mismatch ? true : undefined}
          aria-describedby={fe.confirm || mismatch ? "confirm-password-error" : undefined}
        />
        {(fe.confirm || mismatch) && (
          <p id="confirm-password-error" className="text-sm font-medium text-destructive">
            {fe.confirm ?? "The passwords don't match yet."}
          </p>
        )}
      </Field>
      {state.error && (
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
    </form>
  );
}
