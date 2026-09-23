import type { Transition, Variants } from "motion/react";

/*
 * Motion principles: slow, elegant, restrained.
 * - Animate opacity and small translations only. No bounce, spin, parallax
 *   or looping/floating elements.
 * - Every animation must remain understandable with reduced motion: the
 *   <MotionProvider> drops transforms for users who ask for it (opacity fades
 *   still run).
 * - Hover effects on primitives use CSS transitions with the same curve
 *   (`ease-elegant` in globals.css), not Motion.
 */

/** Matches `--ease-elegant` in globals.css. */
export const easeElegant = [0.22, 1, 0.36, 1] as const;

export const duration = {
  /** Hovers, small state changes */
  fast: 0.3,
  /** Menus, modals */
  base: 0.5,
  /** Scroll reveals */
  slow: 0.9,
} as const;

export const transition: Transition = {
  duration: duration.base,
  ease: easeElegant,
};

/** Fade + short rise. Use for content entering the viewport. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

/** Plain fade. Use for overlays and backdrops. */
export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

/** Delay between siblings when revealing a list or grid. */
export const stagger = 0.08;
