import { z } from "zod";

/*
 * In-browser validation for the admin sign-in and password pages (React Hook
 * Form + Zod), so people see clear messages under each field instead of the
 * browser's own bubbles. The server actions check the same rules again
 * (src/app/admin/actions.ts, password-actions.ts): the browser is never trusted.
 */

const email = z
  .string()
  .trim()
  .min(1, "Enter your email address.")
  .max(254, "Check your email address.")
  .pipe(z.email("Enter a valid email address, e.g. name@example.com."));

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password.").max(200, "That password is too long."),
});
export type SignInValues = z.input<typeof signInSchema>;

export const forgotSchema = z.object({ email });
export type ForgotValues = z.input<typeof forgotSchema>;

export const PASSWORD_MIN = 8;

/** The emailed one-time code: exactly 6 digits. */
export const RESET_CODE_LENGTH = 6;
/** How long a code is valid (Supabase auth.email.otp_expiry; hosted: "Email OTP Expiration"). */
export const RESET_CODE_TTL_SECONDS = 600;
/** How long before "Send a new code" is offered again. */
export const RESEND_AFTER_SECONDS = 60;

/** Step 2: the code from the email. */
export const resetCodeSchema = z.object({
  email,
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, `Enter the ${RESET_CODE_LENGTH}-digit code from the email.`),
});
export type ResetCodeValues = z.input<typeof resetCodeSchema>;

/** Step 3: the new password (after the code was accepted). */
export const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(PASSWORD_MIN, `Use at least ${PASSWORD_MIN} characters.`)
      .max(72, "Use 72 characters or fewer.")
      .refine((v) => /[A-Za-z]/.test(v) && /[0-9]/.test(v), "Use both letters and numbers."),
    confirm: z.string().min(1, "Type the new password again."),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "The passwords don't match." });
export type NewPasswordValues = z.input<typeof newPasswordSchema>;
