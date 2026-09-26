"use client";

import { useId, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ContrastCheck } from "@/lib/theme/palette";

/** Accepts "ad4a66", "#AD4A66", " #ad4a66 " → "#ad4a66"; anything else → null. */
function normalizeHex(value: string): string | null {
  const v = value.trim().toLowerCase().replace(/^#?/, "#");
  return /^#[0-9a-f]{6}$/.test(v) ? v : null;
}

/**
 * One colour setting: label + hint, a native colour picker (also the swatch)
 * and the hex value as editable text. Readability problems this colour can
 * fix are listed under it, in words (not colour alone).
 */
export function ColorField({
  name,
  label,
  hint,
  value,
  onChange,
  problems,
  suggestion,
}: {
  name: string;
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  problems: ContrastCheck[];
  /** An accessible alternative to offer, e.g. a readable text colour. */
  suggestion?: { label: string; value: string };
}) {
  const id = useId();
  // Local text so a half-typed hex isn't applied; synced when the value changes elsewhere.
  const [text, setText] = useState(value);
  const [shown, setShown] = useState(value);
  if (value !== shown) {
    setShown(value);
    setText(value);
  }
  const invalid = normalizeHex(text) === null;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const problemId = `${id}-problems`;
  const describedBy = [hintId, invalid ? errorId : null, problems.length ? problemId : null].filter(Boolean).join(" ");

  return (
    <div data-color-field={name} className="flex flex-col gap-2">
      <label htmlFor={`${id}-hex`} className="text-sm font-semibold">
        {label}
      </label>
      <p id={hintId} className="-mt-1 text-sm text-muted-foreground">
        {hint}
      </p>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          aria-label={`${label}: choose a colour`}
          aria-describedby={hintId}
          onChange={(e) => onChange(e.target.value.toLowerCase())}
          className="size-11 shrink-0 cursor-pointer rounded-md border border-input bg-background p-1 [&::-moz-color-swatch]:rounded-sm [&::-moz-color-swatch]:border-0 [&::-webkit-color-swatch]:rounded-sm [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0"
        />
        <Input
          id={`${id}-hex`}
          name={name}
          value={text}
          spellCheck={false}
          autoComplete="off"
          maxLength={7}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onChange={(e) => {
            setText(e.target.value);
            const hex = normalizeHex(e.target.value);
            if (hex) onChange(hex);
          }}
          onBlur={() => setText(value)}
          className="max-w-36 font-mono uppercase"
        />
      </div>
      {invalid && (
        <p id={errorId} className="text-sm text-destructive">
          Use a 6-digit hex colour, like #AD4A66. The last valid colour is kept.
        </p>
      )}
      {problems.length > 0 && (
        <div id={problemId} className="flex flex-col gap-2 border-l-2 border-destructive pl-3 text-sm">
          {problems.map((p) => (
            <p key={p.id} className="flex items-start gap-2">
              <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-destructive" />
              <span>
                <span className="font-semibold">Too hard to read:</span> {p.label} is {p.ratio.toFixed(2)}:1, needs at
                least {p.min}:1.
              </span>
            </p>
          ))}
          {suggestion && (
            <Button type="button" variant="outline" size="sm" className="h-11 self-start" onClick={() => onChange(suggestion.value)}>
              {suggestion.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * A choice from a fixed list, as native radio buttons styled as a segmented
 * control (arrow keys move between options). 44px targets; the selected
 * option is marked by a border, weight and a check, not colour alone.
 */
export function OptionGroup<V extends string>({
  name,
  legend,
  hint,
  value,
  options,
  onChange,
}: {
  name: string;
  legend: string;
  hint?: string;
  value: V;
  options: Record<V, string>;
  onChange: (value: V) => void;
}) {
  const id = useId();
  return (
    <fieldset className="flex min-w-0 flex-col gap-2" aria-describedby={hint ? `${id}-hint` : undefined}>
      <legend className="text-sm font-semibold">{legend}</legend>
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      <div className="mt-1 flex flex-wrap gap-2">
        {(Object.entries(options) as [V, string][]).map(([key, label]) => {
          const checked = key === value;
          return (
            <label
              key={key}
              className={cn(
                "relative inline-flex h-11 cursor-pointer items-center gap-2 rounded-md border px-4 text-sm transition-colors has-focus-visible:ring-2 has-focus-visible:ring-ring has-focus-visible:ring-offset-2",
                checked
                  ? "border-foreground bg-muted font-semibold text-foreground"
                  : "border-input bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground",
              )}
            >
              <input
                type="radio"
                name={name}
                value={key}
                checked={checked}
                onChange={() => onChange(key)}
                className="sr-only"
              />
              {checked && <span aria-hidden="true">✓</span>}
              {label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
