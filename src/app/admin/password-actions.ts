"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

/*
 * Admin password reset with the existing Supabase Auth (no new provider).
 *
 *   /admin/forgot-password → requestPasswordReset → Supabase emails a link
 *   → /admin/auth/confirm (verifies the one-time code, starts a recovery
 *     session) → /admin/reset-password → updatePassword → /admin/login
 *
 * The request always answers with the same message, whether or not the
 * address has an account (no account enumeration). Errors and tokens are
 * logged by code only, never shown.
 */

export interface ResetRequestState {
  sent?: boolean;
  error?: string;
}

const PASSWORD_MIN = 8;

/** Where the emailed link returns to: this deployment's own origin. */
async function origin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") || host?.startsWith("127.0.0.1") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function requestPasswordReset(_prev: ResetRequestState, formData: FormData): Promise<ResetRequestState> {
  const email = z.string().trim().max(254).pipe(z.email()).safeParse(formData.get("email"));
  if (!email.success) return { error: "Enter a valid email address." };
  if (!isSupabaseConfigured()) return { error: "Password reset isn't available right now." };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email.data, {
    redirectTo: `${await origin()}/admin/auth/confirm?next=/admin/reset-password`,
  });
  // Same answer either way (rate limits and unknown addresses included).
  if (error) console.warn("[admin] password reset request failed", { code: error.code ?? error.status });
  return { sent: true };
}

export interface NewPasswordState {
  error?: string;
  fieldErrors?: { password?: string; confirm?: string };
}

const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(PASSWORD_MIN, `Use at least ${PASSWORD_MIN} characters.`)
      .max(72, "Use 72 characters or fewer.")
      .refine((v) => /[A-Za-z]/.test(v) && /[0-9]/.test(v), "Use both letters and numbers."),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "The passwords don't match." });

export async function updatePassword(_prev: NewPasswordState, formData: FormData): Promise<NewPasswordState> {
  const parsed = newPasswordSchema.safeParse({ password: formData.get("password"), confirm: formData.get("confirm") });
  if (!parsed.success) {
    const fieldErrors: NewPasswordState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] === "confirm" ? "confirm" : "password";
      fieldErrors[key] ??= issue.message;
    }
    return { error: "Check the highlighted fields.", fieldErrors };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) {
    return { error: "This reset link has expired. Request a new one from the sign-in page." };
  }
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    console.warn("[admin] password update failed", { code: error.code ?? error.status });
    return {
      error:
        error.code === "same_password"
          ? "Choose a password you haven't used for this account."
          : error.code === "weak_password"
            ? "That password is too easy to guess. Choose a stronger one."
            : "The password couldn't be updated. Request a new reset link and try again.",
    };
  }
  // Sign out the recovery session: the admin signs in again with the new password.
  await supabase.auth.signOut();
  console.info("[admin] password updated", { userId: data.claims.sub });
  redirect("/admin/login?reset=done");
}
