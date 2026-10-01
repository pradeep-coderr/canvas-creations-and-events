"use client";

import * as React from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Password field with a lock icon, a show/hide button and a Caps Lock
 * warning. The toggle is a real button (keyboard and screen readers: "Show
 * password" / "Hide password", aria-pressed) and never submits the form.
 * Showing the password switches the input to type="text" only while asked.
 */
export function PasswordInput({
  className,
  id,
  ...props
}: Omit<React.ComponentProps<"input">, "type">) {
  const [visible, setVisible] = React.useState(false);
  const [capsLock, setCapsLock] = React.useState(false);
  const capsId = `${id}-caps`;
  const describedBy = [props["aria-describedby"], capsLock ? capsId : null].filter(Boolean).join(" ") || undefined;

  const checkCaps = (event: React.KeyboardEvent<HTMLInputElement>) =>
    setCapsLock(event.getModifierState?.("CapsLock") ?? false);

  return (
    <div>
      <div className="relative">
        <LockKeyhole
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          {...props}
          id={id}
          type={visible ? "text" : "password"}
          aria-describedby={describedBy}
          onKeyDown={(e) => {
            checkCaps(e);
            props.onKeyDown?.(e);
          }}
          onKeyUp={(e) => {
            checkCaps(e);
            props.onKeyUp?.(e);
          }}
          onBlur={(e) => {
            setCapsLock(false);
            props.onBlur?.(e);
          }}
          className={cn("pr-12 pl-10", className)}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          aria-controls={id}
          className="absolute top-1/2 right-1 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          {visible ? <EyeOff aria-hidden="true" className="size-4.5" /> : <Eye aria-hidden="true" className="size-4.5" />}
        </button>
      </div>
      {capsLock && (
        <p id={capsId} className="mt-2 text-xs font-medium text-emphasis">
          Caps Lock is on.
        </p>
      )}
    </div>
  );
}
