"use client";

import { startTransition, useActionState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { signInSchema, type SignInValues } from "@/lib/admin/auth-schemas";
import { signIn, type SignInState } from "../actions";

/**
 * Sign-in (React Hook Form + Zod in the browser; the server action checks
 * again). Messages appear under each field and focus moves to the first
 * problem. After a wrong password the email stays and the password is
 * cleared and focused.
 */
export function LoginForm({ next = "/admin" }: { next?: string }) {
  const [state, action, pending] = useActionState<SignInState, FormData>(signIn, {});
  const {
    register,
    handleSubmit,
    resetField,
    setFocus,
    formState: { errors },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
    shouldFocusError: true,
  });

  useEffect(() => {
    if (!state.error) return;
    resetField("password");
    setFocus("password");
  }, [state, resetField, setFocus]);

  const onSubmit = handleSubmit((values) => {
    const data = new FormData();
    data.set("email", values.email);
    data.set("password", values.password);
    data.set("next", next);
    startTransition(() => action(data));
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6" aria-describedby={state.error ? "login-error" : undefined}>
      <Field data-invalid={errors.email ? true : undefined}>
        <FieldLabel htmlFor="login-email">Email</FieldLabel>
        <div className="relative">
          <Mail
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="login-email"
            type="email"
            autoComplete="username"
            inputMode="email"
            placeholder="you@example.com"
            aria-required
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "login-email-error" : undefined}
            className="pl-10"
            {...register("email")}
          />
        </div>
        {errors.email && <FieldError id="login-email-error">{errors.email.message}</FieldError>}
      </Field>
      <Field data-invalid={errors.password ? true : undefined}>
        <FieldLabel htmlFor="login-password">Password</FieldLabel>
        <PasswordInput
          id="login-password"
          autoComplete="current-password"
          aria-required
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={errors.password ? "login-password-error" : undefined}
          {...register("password")}
        />
        {errors.password && <FieldError id="login-password-error">{errors.password.message}</FieldError>}
        <div className="flex justify-end">
          <Link
            href="/admin/forgot-password"
            className="text-sm font-semibold text-emphasis underline-offset-4 hover:underline focus-visible:underline"
          >
            Forgot password?
          </Link>
        </div>
      </Field>
      {state.error && (
        <p
          id="login-error"
          role="alert"
          className="flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm font-medium text-destructive"
        >
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {state.error}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" pending={pending} pendingLabel="Signing in…">
        Sign in
      </Button>
    </form>
  );
}
