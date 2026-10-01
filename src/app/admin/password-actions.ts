"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { newPasswordSchema, resetCodeSchema } from "@/lib/admin/auth-schemas";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

/*
 * Admin password reset with a short-lived one-time code (Supabase Auth
 * recovery OTP; no link, no redirect), in three steps on /admin/forgot-password:
 *
 *   1. requestPasswordReset  → Supabase emails a 6-digit code (valid 10
 *      minutes: auth.email.otp_expiry; template supabase/templates/recovery.html)
 *   2. verifyResetCode       → verifyOtp (type "recovery") starts a short
 *      reset session (cookie) — nothing is changed yet
 *   3. setNewPassword        → updateUser(password) in that session → sign
 *      out → /admin/login?reset=done
 *
 * The request answers the same whether or not the address has an account (no
 * account enumeration); only a failure to send at all (mail server error,
 * sending limit) is reported, as "try again in a minute". A wrong or expired code gets one generic
 * message. Codes, tokens and passwords are never logged.
 */

export interface ResetRequestState {
  sent?: boolean;
  /** The address the code went to (shown on step 2; it's what was typed). */
  email?: string;
  error?: string;
  /** When the code was sent (ms): the page's expiry and resend timers count from it. */
  sentAt?: number;
}

export async function requestPasswordReset(_prev: ResetRequestState, formData: FormData): Promise<ResetRequestState> {
  const email = z.string().trim().toLowerCase().max(254).pipe(z.email()).safeParse(formData.get("email"));
  if (!email.success) return { error: "Enter a valid email address." };
  if (!isSupabaseConfigured()) return { error: "Password reset isn't available right now." };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email.data);
  if (error) {
    console.warn("[admin] password reset code request failed", { code: error.code ?? error.status, status: error.status });
    // Sending failed (mail server problem) or a sending limit was hit: say so,
    // instead of showing "code sent" for an email that never left. This says
    // nothing about whether the address has an account.
    if (!error.status || error.status === 429 || error.status >= 500) {
      return { error: "We couldn't send a code just now. Please wait a minute and try again." };
    }
  }
  // Otherwise the same answer either way, so unknown addresses can't be told apart.
  return { sent: true, email: email.data, sentAt: Date.now() };
}

export interface VerifyCodeState {
  verified?: boolean;
  error?: string;
}

export async function verifyResetCode(_prev: VerifyCodeState, formData: FormData): Promise<VerifyCodeState> {
  const parsed = resetCodeSchema.safeParse({ email: formData.get("email"), code: formData.get("code") });
  if (!parsed.success) return { error: `Enter the 6-digit code from the email.` };
  if (!isSupabaseConfigured()) return { error: "Password reset isn't available right now." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    email: parsed.data.email,
    token: parsed.data.code,
    type: "recovery",
  });
  if (error || !data.user) {
    console.warn("[admin] reset code rejected", { code: error?.code ?? error?.status ?? "no user" });
    return { error: "That code is wrong or has expired. Check the email, or send a new code." };
  }
  console.info("[admin] reset code accepted", { userId: data.user.id });
  return { verified: true };
}

export interface NewPasswordState {
  error?: string;
  fieldErrors?: { password?: string; confirm?: string };
  /** The reset session is gone (expired, or the page was opened directly). */
  restart?: boolean;
}

export async function setNewPassword(_prev: NewPasswordState, formData: FormData): Promise<NewPasswordState> {
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
    return { error: "Your reset session has ended. Start again to get a new code.", restart: true };
  }
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    console.warn("[admin] password update failed", { code: error.code ?? error.status });
    if (error.code === "same_password") {
      return { error: "Choose a password you haven't used for this account.", fieldErrors: { password: "Choose a different password." } };
    }
    if (error.code === "weak_password") {
      return { error: "That password is too easy to guess.", fieldErrors: { password: "Choose a stronger password." } };
    }
    return { error: "The password couldn't be updated. Try again, or start again with a new code." };
  }
  // End the short reset session: the admin signs in again with the new password.
  await supabase.auth.signOut();
  console.info("[admin] password updated with a reset code", { userId: data.claims.sub });
  redirect("/admin/login?reset=done");
}
