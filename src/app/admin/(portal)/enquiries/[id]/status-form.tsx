"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { enquiryStatusLabels, enquiryStatuses, type EnquiryStatus } from "@/lib/enquiry-status";
import { updateEnquiryStatus, type StatusState } from "../../../actions";

export function StatusForm({ id, status }: { id: string; status: EnquiryStatus }) {
  const [state, action, pending] = useActionState<StatusState, FormData>(updateEnquiryStatus, {});
  const current = state.status ?? status;

  return (
    <form action={action} className="mt-4 space-y-4">
      <input type="hidden" name="id" value={id} />
      {/* shadcn Select; `name` makes Radix submit the value with the form. */}
      <Select key={current} name="status" defaultValue={current}>
        <SelectTrigger id="enquiry-status" aria-label="Enquiry status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {enquiryStatuses.map((value) => (
            <SelectItem key={value} value={value}>
              {enquiryStatusLabels[value]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
