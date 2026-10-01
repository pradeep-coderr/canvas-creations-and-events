"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * One-time code input: one box per digit, in a labelled group.
 *   - typing a digit moves to the next box; Backspace on an empty box goes back
 *   - ←/→, Home/End move between boxes
 *   - pasting (or the phone's "fill code from email") fills every box
 *   - numeric keypad on phones; autocomplete="one-time-code" on the first box
 * The value is a string of digits, with a space for an empty box in the middle
 * (shorter than `length` while typing).
 */
export function CodeInput({
  length = 6,
  value,
  onChange,
  id,
  invalid,
  describedBy,
  labelledBy,
  autoFocus,
  disabled,
  readOnly,
}: {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  /** Id for the first box (so a <label htmlFor> focuses it). */
  id: string;
  invalid?: boolean;
  describedBy?: string;
  labelledBy?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  /** While a check is running: unchangeable but still focusable. */
  readOnly?: boolean;
}) {
  const refs = React.useRef<(HTMLInputElement | null)[]>([]);
  // Empty boxes are kept as spaces inside the value, so clearing a middle box
  // doesn't shift the digits after it (trailing spaces are trimmed).
  const digits = Array.from({ length }, (_, i) => (value[i] && value[i] !== " " ? value[i] : ""));
  const emit = (next: string[]) => onChange(next.map((c) => c || " ").join("").replace(/\s+$/, ""));
  const focusBox = (i: number) => {
    const box = refs.current[Math.max(0, Math.min(length - 1, i))];
    box?.focus();
    box?.select();
  };

  const setFrom = (start: number, text: string) => {
    const incoming = text.replace(/\D/g, "");
    if (!incoming) return;
    const next = digits.slice();
    for (let k = 0; k < incoming.length && start + k < length; k++) next[start + k] = incoming[k];
    emit(next);
    focusBox(Math.min(start + incoming.length, length - 1));
  };

  return (
    <div role="group" aria-labelledby={labelledBy} aria-describedby={describedBy} className="flex items-center gap-2 sm:gap-2.5">
      {digits.map((d, i) => (
        <React.Fragment key={i}>
        {/* A dash after the first half (e.g. 123 – 456) makes the code easier to read. */}
        {i === Math.ceil(length / 2) && length > 4 && (
          <span aria-hidden="true" className="h-0.5 w-3 shrink-0 rounded-full bg-border" />
        )}
        <input
          ref={(el) => {
            refs.current[i] = el;
          }}
          id={i === 0 ? id : `${id}-${i + 1}`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={length}
          value={d}
          autoFocus={autoFocus && i === 0}
          aria-label={`Digit ${i + 1} of ${length}`}
          aria-invalid={invalid || undefined}
          disabled={disabled}
          readOnly={readOnly}
          aria-busy={readOnly || undefined}
          onFocus={(e) => e.target.select()}
          onChange={(e) => {
            const typed = e.target.value.replace(/\D/g, "");
            if (!typed) {
              const next = digits.slice();
              next[i] = "";
              emit(next);
              return;
            }
            setFrom(i, typed.length > 1 && d && typed.startsWith(d) ? typed.slice(1) : typed);
          }}
          onPaste={(e) => {
            e.preventDefault();
            setFrom(0, e.clipboardData.getData("text"));
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !d && i > 0) {
              e.preventDefault();
              const next = digits.slice();
              next[i - 1] = "";
              emit(next);
              focusBox(i - 1);
            } else if (e.key === "ArrowLeft") {
              e.preventDefault();
              focusBox(i - 1);
            } else if (e.key === "ArrowRight") {
              e.preventDefault();
              focusBox(i + 1);
            } else if (e.key === "Home") {
              e.preventDefault();
              focusBox(0);
            } else if (e.key === "End") {
              e.preventDefault();
              focusBox(length - 1);
            }
          }}
          className={cn(
            "h-14 w-full min-w-0 rounded-lg border border-input bg-background text-center font-mono text-2xl font-semibold text-foreground tabular-nums caret-primary shadow-xs transition-[border-color,box-shadow,background-color] duration-200 outline-none hover:border-foreground/45 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60 read-only:opacity-70 sm:h-16 sm:text-3xl",
            d && !invalid && "border-foreground/40 bg-surface-ivory",
            invalid && "border-destructive ring-3 ring-destructive/15",
          )}
        />
        </React.Fragment>
      ))}
    </div>
  );
}
