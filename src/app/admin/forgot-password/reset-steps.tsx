import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type ResetStep = "email" | "code" | "password";
const steps: { key: ResetStep; label: string }[] = [
  { key: "email", label: "Email" },
  { key: "code", label: "Code" },
  { key: "password", label: "New password" },
];

/** "1 Email — 2 Code — 3 New password", with the current step marked (aria-current="step"). */
export function ResetSteps({ current }: { current: ResetStep }) {
  const index = steps.findIndex((s) => s.key === current);
  return (
    <ol aria-label="Password reset steps" className="mb-8 flex items-center gap-2 text-xs font-semibold sm:text-sm">
      {steps.map((step, i) => {
        const done = i < index;
        const active = i === index;
        return (
          <li key={step.key} aria-current={active ? "step" : undefined} className="flex flex-1 items-center gap-2 last:flex-none">
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs transition-colors",
                done && "border-primary bg-primary text-primary-foreground",
                active && "border-primary text-primary ring-3 ring-primary/15",
                !done && !active && "border-border text-muted-foreground",
              )}
            >
              {done ? <Check aria-hidden="true" className="size-3.5" /> : i + 1}
            </span>
            <span className={cn("whitespace-nowrap", active ? "text-foreground" : "text-muted-foreground")}>
              {step.label}
              {done && <span className="sr-only"> (done)</span>}
            </span>
            {i < steps.length - 1 && (
              <span aria-hidden="true" className={cn("h-px flex-1", done ? "bg-primary" : "bg-border")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
