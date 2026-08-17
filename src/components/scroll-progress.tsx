"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Hairline progress bar pinned to the top of the viewport.
 *
 * Kept for reduced-motion visitors too: it moves only in direct response to
 * their own scrolling, which is position feedback rather than animation.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.3 });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-50 h-px origin-left bg-gradient-to-r from-violet via-indigo to-cyan"
    />
  );
}
