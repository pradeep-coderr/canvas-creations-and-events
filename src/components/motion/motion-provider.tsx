"use client";

import { MotionConfig } from "motion/react";
import { transition } from "@/lib/motion";

/**
 * App-wide Motion defaults. `reducedMotion="user"` disables transform and
 * layout animations when the OS "reduce motion" setting is on.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={transition}>
      {children}
    </MotionConfig>
  );
}
