"use client";

import { useState } from "react";
import { sendTestEnquiryEmail, type EmailTest } from "@/app/admin/(portal)/settings/actions";
import { Button } from "@/components/ui/button";
import { describeActionFailure } from "@/lib/admin/action-error";
import { formatShortDateTime } from "@/lib/datetime";
import type { EmailStatus } from "@/lib/email/config";

/*
 * Enquiry email notifications (super admins): whether they're set up on this
 * deployment, and a real test through the same Resend path as enquiries. The
 * API key is never shown; recipients are masked.
 */
export function EmailPanel({ status, lastTest: initialTest }: { status: EmailStatus; lastTest: EmailTest }) {
  const [busy, setBusy] = useState(false);
  const [lastTest, setLastTest] = useState(initialTest);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const test = async () => {
    setBusy(true);
    setResult(null);
    try {
      const sent = await sendTestEnquiryEmail();
      setLastTest(sent.lastTest);
      setResult({ ok: sent.ok, text: sent.message });
    } catch (error) {
      setResult({ ok: false, text: describeActionFailure(error).text });
    } finally {
      setBusy(false);
    }
  };

  const rows: [string, string][] = [
    ["Email notifications", status.configured ? "Configured" : "Not configured"],
    ["Sender", status.sender ?? "Not set"],
    [
      "Recipients",
      status.recipients.length ? `${status.recipients.length} set (${status.recipients.join(", ")})` : "Not set",
    ],
    [
      "Last test",
      lastTest ? `${lastTest.ok ? "Sent" : "Failed"} · ${formatShortDateTime(lastTest.at)}` : "Never tested",
    ],
  ];

  return (
    <div className="grid gap-5">
      <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-medium break-words" data-email-status={label}>
              {value}
            </dd>
          </div>
        ))}
      </dl>
      {lastTest && !lastTest.ok && <p className="text-sm text-destructive">{lastTest.detail}</p>}
      {!status.configured && (
        <p className="max-w-prose text-sm text-muted-foreground">
          Enquiries are still saved and shown in the admin; only the email is skipped. Missing on the server:{" "}
          {status.missing.join(", ")}.
        </p>
      )}
      <div>
        <Button
          type="button"
          variant="secondary"
          pending={busy}
          pendingLabel="Sending…"
          aria-disabled={!status.configured || busy || undefined}
          onClick={() => status.configured && !busy && void test()}
        >
          Send test enquiry email
        </Button>
      </div>
      <p role={result && !result.ok ? "alert" : "status"} className={`text-sm empty:hidden ${result && !result.ok ? "font-medium text-destructive" : "text-muted-foreground"}`}>
        {result?.text}
      </p>
      <p className="max-w-prose text-xs text-muted-foreground">
        The test uses clearly marked sample details and doesn&apos;t create an enquiry. Real enquiry emails have the
        visitor&apos;s email as Reply-To, so replying answers them directly.
      </p>
    </div>
  );
}
