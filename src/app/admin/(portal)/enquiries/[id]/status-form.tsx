"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { enquiryStatusLabels, enquiryStatuses, type EnquiryStatus } from "@/lib/enquiry-status";
import { updateEnquiryStatus, type StatusState } from "../../../actions";

export function StatusForm({ id, status }: { id: string; status: EnquiryStatus }) {
  const [state, action, pending] = useActionState<StatusState, FormData>(updateEnquiryStatus, {});

  return (
    <form action={action} className="mt-4 space-y-4">
      <input type="hidden" name="id" value={id} />
      <label htmlFor="enquiry-status" className="sr-only">
        Enquiry status
      </label>
      <select
        id="enquiry-status"
        name="status"
        defaultValue={state.status ?? status}
        key={state.status ?? status}
        className="h-11 w-full rounded-md border border-input bg-background px-3 text-base text-foreground hover:border-foreground/45 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 focus-visible:outline-none"
      >
        {enquiryStatuses.map((value) => (
          <option key={value} value={value}>
            {enquiryStatusLabels[value]}
          </option>
        ))}
      </select>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Saving…" : "Update status"}
      </Button>
      <p role="status" aria-live="polite" className="min-h-5 text-sm">
        {state.ok && state.status && (
          <span className="text-muted-foreground">Status updated to {enquiryStatusLabels[state.status]}.</span>
        )}
        {state.error && <span className="font-medium text-destructive">{state.error}</span>}
      </p>
    </form>
  );
}
