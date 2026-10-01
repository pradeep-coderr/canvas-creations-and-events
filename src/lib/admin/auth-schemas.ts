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

export const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(PASSWORD_MIN, `Use at least ${PASSWORD_MIN} characters.`)
      .max(200, "That password is too long.")
      .refine((v) => /[A-Za-z]/.test(v) && /[0-9]/.test(v), "Use both letters and numbers."),
    confirm: z.string().min(1, "Type the new password again."),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "The passwords don't match." });
export type NewPasswordValues = z.input<typeof newPasswordSchema>;
