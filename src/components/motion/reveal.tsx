"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

/** Shared easing — a long, decelerating curve. Everything on the page uses it. */
export const EASE = [0.16, 1, 0.3, 1] as const;

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Seconds. Stagger siblings by hand rather than with a variants tree. */
  delay?: number;
  /** Travel distance in px. Set 0 for a pure fade. */
  y?: number;
  /** Blur-in adds weight; drop it on large blocks where it costs too much. */
  blur?: boolean;
};

/**
 * Fade + rise + defocus as an element scrolls into view. Fires once.
 *
 * The rise is a transform, so `MotionConfig reducedMotion="user"` drops it
 * automatically for anyone who asked for reduced motion — they get the fade
 * alone. Nothing here branches on the hook, which keeps SSR and hydration
 * identical for every visitor.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 18,
  blur = true,
}: RevealProps) {
  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y, filter: blur ? "blur(8px)" : "blur(0px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-10% 0px -12% 0px" }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
