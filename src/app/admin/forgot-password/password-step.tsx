"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Circle, CircleAlert, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { PASSWORD_MIN, newPasswordSchema, type NewPasswordValues } from "@/lib/admin/auth-schemas";
import { cn } from "@/lib/utils";
import { setNewPassword, type NewPasswordState } from "../password-actions";

const rules = [
  { label: `${PASSWORD_MIN}+ characters`, test: (v: string) => v.length >= PASSWORD_MIN },
  { label: "A letter", test: (v: string) => /[A-Za-z]/.test(v) },
  { label: "A number", test: (v: string) => /\d/.test(v) },
];

/** A simple, honest strength guide: the rules, then length and variety. */
function strength(v: string) {
  if (!v) return { score: 0, label: "" };
  let score = rules.filter((r) => r.test(v)).length; // 0–3
  if (v.length >= 12) score++;
  if (/[^A-Za-z0-9]/.test(v) || (/[a-z]/.test(v) && /[A-Z]/.test(v))) score++;
  const level = score <= 2 ? 1 : score === 3 ? 2 : score === 4 ? 3 : 4;
  return { score: level, label: ["", "Weak", "Fair", "Good", "Strong"][level] };
}

/** Step 3: the new password, only after the code was accepted. */
export function PasswordStep({ onRestart }: { onRestart: () => void }) {
  const [state, action, pending] = useActionState<NewPasswordState, FormData>(setNewPassword, {});
  const headingRef = useRef<HTMLHeadingElement>(null);
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<NewPasswordValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: "", confirm: "" },
    mode: "onTouched",
    shouldFocusError: true,
  });
  const [password] = useWatch({ control, name: ["password"] });
  const meter = strength(password ?? "");

  useEffect(() => headingRef.current?.focus(), []);
  useEffect(() => {
    if (state.fieldErrors?.password) setError("password", { message: state.fieldErrors.password });
    if (state.fieldErrors?.confirm) setError("confirm", { message: state.fieldErrors.confirm });
  }, [state, setError]);

  const onSubmit = handleSubmit((values) => {
    const data = new FormData();
    data.set("password", values.password);
    data.set("confirm", values.confirm);
    startTransition(() => action(data));
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div className="space-y-3 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface-blush">
          <ShieldCheck aria-hidden="true" className="size-5 text-primary" />
        </span>
        <h2 ref={headingRef} tabIndex={-1} className="font-display text-display-sm font-title outline-none">
          Choose a new password
        </h2>
        <p className="text-sm text-muted-foreground">Code accepted. Pick something you haven&apos;t used here before.</p>
      </div>

      <Field data-invalid={errors.password ? true : undefined}>
        <FieldLabel htmlFor="new-password">New password</FieldLabel>
        <PasswordInput
          id="new-password"
          autoComplete="new-password"
          aria-required
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={errors.password ? "new-password-guide new-password-error" : "new-password-guide"}
          {...register("password")}
        />
        {errors.password && <FieldError id="new-password-error">{errors.password.message}</FieldError>}
        <div id="new-password-guide" className="space-y-3 rounded-lg bg-surface-ivory p-3">
          <div className="flex items-center gap-3">
            <div aria-hidden="true" className="grid flex-1 grid-cols-4 gap-1.5">
              {[1, 2, 3, 4].map((n) => (
                <span
                  key={n}
                  className={cn(
                    "h-1.5 rounded-full transition-colors",
                    n <= meter.score
                      ? meter.score === 1
                        ? "bg-destructive"
                        : meter.score === 2
                          ? "bg-highlight"
                          : "bg-primary"
                      : "bg-border",
                  )}
                />
              ))}
            </div>
            <span className="w-14 text-right text-xs font-semibold text-muted-foreground">
              {meter.label ? (
                <>
                  <span className="sr-only">Strength: </span>
                  {meter.label}
                </>
              ) : null}
            </span>
          </div>
          <ul className="grid grid-cols-1 gap-1.5 text-sm sm:grid-cols-3" aria-label="Password requirements">
            {rules.map((rule) => {
              const met = rule.test(password ?? "");
              return (
                <li key={rule.label} className={cn("flex items-center gap-1.5", met ? "text-foreground" : "text-muted-foreground")}>
                  {met ? <Check aria-hidden="true" className="size-4 text-primary" /> : <Circle aria-hidden="true" className="size-3.5" />}
                  {rule.label}
                  <span className="sr-only">{met ? " (done)" : " (not yet)"}</span>
                </li>
              );
            })}
          </ul>
        </div>
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

      {state.error && !state.fieldErrors && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm font-medium text-destructive"
        >
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>
            {state.error}
            {state.restart && (
              <>
                {" "}
                <button type="button" onClick={onRestart} className="font-semibold underline underline-offset-4">
                  Start again
                </button>
              </>
            )}
          </span>
        </div>
      )}

      <Button type="submit" size="lg" className="w-full" pending={pending} pendingLabel="Saving password…">
        Save new password
      </Button>
    </form>
  );
}
