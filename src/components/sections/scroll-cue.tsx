"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

import { EASE } from "@/components/motion/reveal";

const FADE_RANGE = 160;

/**
 * Hairline at the bottom of the hero with a travelling highlight.
 * Fades out as soon as the visitor starts scrolling — it has done its job.
 *
 * Two nested elements on purpose: a motion value in `style` takes precedence
 * over `animate` for the same property, so the scroll-driven fade and the
 * on-load fade would fight over `opacity` if they shared an element.
 * Outer owns the scroll fade, inner owns the entrance.
 *
 * The travelling highlight is a transform loop, so MotionConfig drops it under
 * reduced motion and the hairline simply sits still.
 */
export function ScrollCue() {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const scrollFade = useTransform(scrollY, (value) =>
    Math.max(0, 1 - Math.min(value, FADE_RANGE) / FADE_RANGE)
  );

  return (
    <motion.div
      aria-hidden
      style={{ opacity: scrollFade }}
      className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.6, ease: EASE }}
        className="relative h-14 w-px overflow-hidden bg-foreground/15"
      >
        <motion.div
          className="absolute inset-x-0 h-5 bg-gradient-to-b from-transparent via-foreground/80 to-transparent"
          initial={{ y: -20 }}
          animate={{ y: 56 }}
          transition={
            reduced
              ? { duration: 0 }
              : { duration: 2.4, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.6 }
          }
        />
      </motion.div>
    </motion.div>
  );
}
