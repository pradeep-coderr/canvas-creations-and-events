"use client";

import { motion } from "motion/react";
import { duration, easeElegant, fadeUp } from "@/lib/motion";

interface RevealProps {
  children: React.ReactNode;
  /** Seconds. For lists, use `index * stagger` from `@/lib/motion`. */
  delay?: number;
  className?: string;
}

/** Fades and lifts its content in once, when it scrolls into view. */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: duration.slow, ease: easeElegant, delay }}
    >
      {children}
    </motion.div>
  );
}
