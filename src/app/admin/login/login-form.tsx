"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { CircleAlert, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { signIn, type SignInState } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<SignInState, FormData>(signIn, {});
  const passwordRef = useRef<HTMLInputElement>(null);
  // After a failed attempt the email stays filled in; the cursor goes back
  // to the (cleared) password so it can simply be typed again.
  useEffect(() => {
    if (state.error && state.email) passwordRef.current?.focus();
  }, [state]);

  return (
    <form action={action} className="space-y-6" aria-describedby={state.error ? "login-error" : undefined}>
      <Field>
        <FieldLabel htmlFor="login-email">Email</FieldLabel>
        <div className="relative">
          <Mail
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="login-email"
            name="email"
            type="email"
            autoComplete="username"
            inputMode="email"
            placeholder="you@example.com"
            required
            defaultValue={state.email}
            key={state.email ?? ""}
            className="pl-10"
          />
        </div>
      </Field>
      <Field>
        <FieldLabel htmlFor="login-password">Password</FieldLabel>
        <PasswordInput
          ref={passwordRef}
          id="login-password"
          name="password"
          autoComplete="current-password"
          required
        />
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
