"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signIn, type SignInState } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<SignInState, FormData>(signIn, {});

  return (
    <form action={action} className="space-y-6" aria-describedby={state.error ? "login-error" : undefined}>
      <Field>
        <FieldLabel htmlFor="login-email">Email</FieldLabel>
        <Input id="login-email" name="email" type="email" autoComplete="username" required />
      </Field>
      <Field>
        <div className="flex items-baseline justify-between gap-4">
          <FieldLabel htmlFor="login-password">Password</FieldLabel>
          <Link href="/admin/forgot-password" className="text-sm font-semibold underline underline-offset-4">
            Forgot password?
          </Link>
        </div>
        <Input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </Field>
      {state.error && (
        <p id="login-error" role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" pending={pending} pendingLabel="Signing in…">
        Sign in
      </Button>
    </form>
  );
}
