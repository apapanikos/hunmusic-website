"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "framer-motion";

/**
 * `reducedMotion="user"` makes Framer Motion drop every transform and layout
 * animation when the OS asks for reduced motion, keeping only opacity/colour
 * fades — which are safe and stop the page from flashing unstyled content.
 *
 * Doing it here rather than branching on `useReducedMotion()` inside each
 * component matters: the hook returns `false` during SSR and `true` on the
 * client for these users, so any component that changed its *rendered output*
 * based on it would hydrate mismatched. Components below may read the hook to
 * decide behaviour (whether to attach a pointer handler, how far to parallax),
 * never to decide what to render on the first pass.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
