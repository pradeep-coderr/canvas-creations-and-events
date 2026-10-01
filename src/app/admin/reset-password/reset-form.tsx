"use client";

import { startTransition, useActionState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, CircleAlert, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { PASSWORD_MIN, newPasswordSchema, type NewPasswordValues } from "@/lib/admin/auth-schemas";
import { cn } from "@/lib/utils";
import { updatePassword, type NewPasswordState } from "../password-actions";

/** Live checklist for the same rules the schema (and server) enforce. */
const rules = [
  { label: `At least ${PASSWORD_MIN} characters`, test: (v: string) => v.length >= PASSWORD_MIN },
  { label: "Contains a letter", test: (v: string) => /[A-Za-z]/.test(v) },
  { label: "Contains a number", test: (v: string) => /\d/.test(v) },
];

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState<NewPasswordState, FormData>(updatePassword, {});
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, touchedFields, isSubmitted },
  } = useForm<NewPasswordValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: "", confirm: "" },
    mode: "onTouched",
    shouldFocusError: true,
  });
  const [password, confirm] = useWatch({ control, name: ["password", "confirm"] });
  // While typing the confirmation, say early that it doesn't match yet.
  const mismatchHint = !errors.confirm && confirm.length > 0 && confirm !== password && (touchedFields.confirm || isSubmitted);
  const passwordError = errors.password?.message ?? state.fieldErrors?.password;
  const confirmError = errors.confirm?.message ?? state.fieldErrors?.confirm ?? (mismatchHint ? "The passwords don't match yet." : undefined);

  const onSubmit = handleSubmit((values) => {
    const data = new FormData();
    data.set("password", values.password);
    data.set("confirm", values.confirm);
    startTransition(() => action(data));
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <Field data-invalid={passwordError ? true : undefined}>
        <FieldLabel htmlFor="new-password">New password</FieldLabel>
        <PasswordInput
          id="new-password"
          autoComplete="new-password"
          aria-required
          aria-invalid={passwordError ? true : undefined}
          aria-describedby={passwordError ? "new-password-rules new-password-error" : "new-password-rules"}
          {...register("password")}
        />
        <ul id="new-password-rules" className="grid gap-1.5 text-sm" aria-label="Password requirements">
          {rules.map((rule) => {
            const met = rule.test(password);
            return (
              <li key={rule.label} className={cn("flex items-center gap-2", met ? "text-foreground" : "text-muted-foreground")}>
                {met ? <Check aria-hidden="true" className="size-4 text-primary" /> : <Circle aria-hidden="true" className="size-4" />}
                {rule.label}
                <span className="sr-only">{met ? " (done)" : " (not yet)"}</span>
              </li>
            );
          })}
        </ul>
        {passwordError && <FieldError id="new-password-error">{passwordError}</FieldError>}
      </Field>
      <Field data-invalid={confirmError ? true : undefined}>
        <FieldLabel htmlFor="confirm-password">Confirm new password</FieldLabel>
        <PasswordInput
          id="confirm-password"
          autoComplete="new-password"
          aria-required
          aria-invalid={confirmError ? true : undefined}
          aria-describedby={confirmError ? "confirm-password-error" : undefined}
          {...register("confirm")}
        />
        {confirmError && <FieldError id="confirm-password-error">{confirmError}</FieldError>}
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
