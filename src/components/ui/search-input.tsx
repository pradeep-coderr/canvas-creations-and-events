"use client";

import { useRef } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A search box with a magnifier icon and our own clear button (the browser's
 * built-in one is hidden in globals.css, so it looks the same everywhere).
 */
export function SearchInput({
  value,
  onValueChange,
  onClear,
  className,
  inputClassName,
  ...props
}: Omit<React.ComponentProps<"input">, "type" | "value" | "onChange"> & {
  value: string;
  onValueChange: (value: string) => void;
  /** After clearing (e.g. reload the list); the box is emptied either way. */
  onClear?: () => void;
  inputClassName?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className={cn("relative", className)}>
      <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className={cn(
          "h-10 w-full rounded-lg border border-border bg-surface-ivory pr-10 pl-9 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
          inputClassName,
        )}
        {...props}
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            onValueChange("");
            onClear?.();
            // The button disappears with the text: keep the keyboard in the box.
            inputRef.current?.focus();
          }}
          className="absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
