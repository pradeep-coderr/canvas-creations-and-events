import { enquiryStatusLabels, type EnquiryStatus } from "@/lib/enquiry-status";
import { cn } from "@/lib/utils";

// "New" stands out; later stages are quieter; archived is muted.
const tone: Record<EnquiryStatus, string> = {
  new: "border-primary bg-primary text-primary-foreground",
  contacted: "border-primary/40 text-primary",
  quoted: "border-primary/40 text-primary",
  booked: "border-highlight-strong bg-surface-ivory text-foreground",
  completed: "border-border text-foreground",
  archived: "border-border text-muted-foreground",
};

export function StatusBadge({ status }: { status: EnquiryStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-sm border px-2 py-0.5 text-xs font-semibold whitespace-nowrap",
        tone[status],
      )}
    >
      {enquiryStatusLabels[status]}
    </span>
  );
}
