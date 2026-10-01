"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { resetWithCodeSchema } from "@/lib/admin/auth-schemas";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

/*
 * Admin password reset with a short-lived one-time code (Supabase Auth
 * recovery OTP; no link, no redirect):
 *
 *   /admin/forgot-password
 *     1. requestPasswordReset → Supabase emails a 6-digit code (valid
 *        10 minutes: auth.email.otp_expiry; template supabase/templates/recovery.html)
 *     2. resetPasswordWithCode → verifyOtp (type "recovery") starts a short
 *        session → updateUser(password) → sign out → /admin/login?reset=done
 *
 * The request always answers the same, whether or not the address has an
 * account (no account enumeration). A wrong or expired code gets one generic
 * message. Codes, tokens and passwords are never logged.
 */

export interface ResetRequestState {
  sent?: boolean;
  /** The address the code went to (shown on step 2; it's what was typed). */
  email?: string;
  error?: string;
  /** Changes on every successful request, so the page can restart its resend timer. */
  sentAt?: number;
}

export async function requestPasswordReset(_prev: ResetRequestState, formData: FormData): Promise<ResetRequestState> {
  const email = z.string().trim().toLowerCase().max(254).pipe(z.email()).safeParse(formData.get("email"));
  if (!email.success) return { error: "Enter a valid email address." };
  if (!isSupabaseConfigured()) return { error: "Password reset isn't available right now." };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email.data);
  // Same answer either way (rate limits and unknown addresses included).
  if (error) console.warn("[admin] password reset code request failed", { code: error.code ?? error.status });
  return { sent: true, email: email.data, sentAt: Date.now() };
}

export interface ResetWithCodeState {
  error?: string;
  fieldErrors?: { code?: string; password?: string; confirm?: string };
}

export async function resetPasswordWithCode(_prev: ResetWithCodeState, formData: FormData): Promise<ResetWithCodeState> {
  const parsed = resetWithCodeSchema.safeParse({
    email: formData.get("email"),
    code: formData.get("code"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    const fieldErrors: ResetWithCodeState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key === "code" || key === "password" || key === "confirm") fieldErrors[key] ??= issue.message;
    }
    return { error: "Check the highlighted fields.", fieldErrors };
  }
  if (!isSupabaseConfigured()) return { error: "Password reset isn't available right now." };

  const { email, code, password } = parsed.data;
  const supabase = await createClient();
  const { data, error: verifyError } = await supabase.auth.verifyOtp({ email, token: code, type: "recovery" });
  if (verifyError || !data.user) {
    console.warn("[admin] reset code rejected", { code: verifyError?.code ?? verifyError?.status ?? "no user" });
    return {
      error: "That code is wrong or has expired.",
      fieldErrors: { code: "That code is wrong or has expired. Check the email, or send a new code." },
    };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    console.warn("[admin] password update failed", { code: error.code ?? error.status });
    await supabase.auth.signOut();
    return {
      error:
        error.code === "same_password"
          ? "Choose a password you haven't used for this account. Send a new code and try again."
          : error.code === "weak_password"
            ? "That password is too easy to guess. Send a new code and choose a stronger one."
            : "The password couldn't be updated. Send a new code and try again.",
    };
  }
  // End the short reset session: the admin signs in again with the new password.
  await supabase.auth.signOut();
  console.info("[admin] password updated with a reset code", { userId: data.user.id });
  redirect("/admin/login?reset=done");
}
