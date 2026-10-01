"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { CircleAlert, Clock, MailCheck, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeInput } from "@/components/ui/code-input";
import { RESEND_AFTER_SECONDS, RESET_CODE_LENGTH, RESET_CODE_TTL_SECONDS } from "@/lib/admin/auth-schemas";
import { cn } from "@/lib/utils";
import { verifyResetCode, type VerifyCodeState } from "../password-actions";

const mmss = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

/** Re-renders every second while mounted (for the countdowns). */
function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

/**
 * Step 2: the 6-digit code. Checked automatically once all six digits are in
 * (or with "Verify code"). Two visible timers: the code's expiry (10 min)
 * and when a new code may be sent (60 s). Countdowns aren't announced every
 * second; screen readers get the expiry once, and the button says when it's
 * ready.
 */
export function CodeStep({
  email,
  sentAt,
  resending,
  resendError,
  onResend,
  onVerified,
  onChangeEmail,
}: {
  email: string;
  sentAt: number;
  resending: boolean;
  /** Why the last "Send a new code" didn't go out (the earlier code still works). */
  resendError?: string;
  onResend: () => void;
  onVerified: () => void;
  onChangeEmail: () => void;
}) {
  const [code, setCode] = useState("");
  // The server's answer is handled where it arrives: move on, or clear the
  // boxes and put the cursor back for another try.
  const [state, action, pending] = useActionState<VerifyCodeState, FormData>(async (prev, data) => {
    const result = await verifyResetCode(prev, data);
    if (result.verified) onVerified();
    else if (result.error) {
      setCode("");
      requestAnimationFrame(() => document.getElementById("reset-code")?.focus());
    }
    return result;
  }, {});
  const [localError, setLocalError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const now = useNow();

  const elapsed = Math.max(0, Math.floor((now - sentAt) / 1000));
  const expiresIn = Math.max(0, RESET_CODE_TTL_SECONDS - elapsed);
  const resendIn = Math.max(0, RESEND_AFTER_SECONDS - elapsed);
  const expired = expiresIn === 0;
  const complete = /^\d{6}$/.test(code);

  useEffect(() => headingRef.current?.focus(), []);

  const verify = (value: string) => {
    if (pending || expired) return;
    setLocalError(null);
    const data = new FormData();
    data.set("email", email);
    data.set("code", value);
    startTransition(() => action(data));
  };

  const error = localError ?? (state.error && !code ? state.error : null);

  return (
    <div className="space-y-6">
      <div className="space-y-3 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface-blush">
          <MailCheck aria-hidden="true" className="size-5 text-primary" />
        </span>
        <h2 ref={headingRef} tabIndex={-1} className="font-display text-display-sm font-title outline-none">
          Check your email
        </h2>
        <p className="text-sm text-muted-foreground">
          If an admin account uses <span className="font-semibold break-all text-foreground">{email}</span>, we&apos;ve
          sent it a {RESET_CODE_LENGTH}-digit code. Check your spam folder too.
        </p>
      </div>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (!complete) {
            setLocalError(`Enter all ${RESET_CODE_LENGTH} digits of the code.`);
            document.getElementById("reset-code")?.focus();
            return;
          }
          verify(code);
        }}
        className="space-y-5"
      >
        <div className="mx-auto max-w-sm">
          <p id="reset-code-label" className="sr-only">
            {RESET_CODE_LENGTH}-digit code from the email
          </p>
          <CodeInput
            id="reset-code"
            length={RESET_CODE_LENGTH}
            value={code}
            onChange={(v) => {
              setCode(v);
              setLocalError(null);
              // Check automatically as soon as the sixth digit is in.
              if (/^\d{6}$/.test(v) && v !== code) verify(v);
            }}
            invalid={!!error}
            labelledBy="reset-code-label"
            describedBy={["reset-code-expiry", error ? "reset-code-error" : ""].filter(Boolean).join(" ")}
            autoFocus
            disabled={expired}
            readOnly={pending}
          />
        </div>

        {/* Expiry timer */}
        <p
          id="reset-code-expiry"
          className={cn(
            "mx-auto flex w-fit items-center gap-2 rounded-full px-3 py-1 text-sm font-medium tabular-nums",
            expired
              ? "bg-destructive/10 text-destructive"
              : expiresIn <= 60
                ? "bg-surface-blush text-emphasis"
                : "bg-muted text-muted-foreground",
          )}
        >
          <Clock aria-hidden="true" className="size-4" />
          {expired ? (
            "This code has expired"
          ) : (
            <>
              <span aria-hidden="true">Code expires in {mmss(expiresIn)}</span>
              <span className="sr-only">The code expires {RESET_CODE_TTL_SECONDS / 60} minutes after it was sent.</span>
            </>
          )}
        </p>

        {error && (
          <p
            id="reset-code-error"
            role="alert"
            className="flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm font-medium text-destructive"
          >
            <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {error}
          </p>
        )}

        {expired ? (
          <Button type="button" size="lg" className="w-full" pending={resending} pendingLabel="Sending…" onClick={onResend}>
            <RotateCw data-icon="inline-start" aria-hidden="true" />
            Send a new code
          </Button>
        ) : (
          <Button type="submit" size="lg" className="w-full" pending={pending} pendingLabel="Checking code…">
            Verify code
          </Button>
        )}
      </form>

      {resendError && !resending && (
        <p role="alert" className="flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm font-medium text-destructive">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {resendError}
        </p>
      )}

      <div className="flex flex-col items-center gap-3 border-t border-border pt-5 text-sm sm:flex-row sm:justify-between">
        {!expired && (
          <p className="text-muted-foreground">
            Didn&apos;t get it?{" "}
            {resendIn > 0 ? (
              <span className="font-medium text-foreground tabular-nums">
                Resend in <span aria-hidden="true">{mmss(resendIn)}</span>
                <span className="sr-only">about a minute</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={onResend}
                disabled={resending}
                className="font-semibold text-emphasis underline-offset-4 hover:underline focus-visible:underline disabled:opacity-60"
              >
                {resending ? "Sending…" : "Send a new code"}
              </button>
            )}
          </p>
        )}
        <button
          type="button"
          onClick={onChangeEmail}
          className="font-semibold text-emphasis underline-offset-4 hover:underline focus-visible:underline"
        >
          Use a different email
        </button>
      </div>
    </div>
  );
}
