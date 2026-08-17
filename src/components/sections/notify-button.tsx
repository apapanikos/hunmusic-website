"use client";

import type { MouseEvent } from "react";
import { useReducedMotion } from "framer-motion";

import { actionButtonClass } from "@/components/block";
import { Magnetic } from "@/components/motion/magnetic";

/**
 * "+ Notify me" — sends people to the one mailing-list form rather than
 * introducing a second capture. Used by the hero and the release block.
 *
 * It's a real anchor to `#subscribe`, so it still works with JS disabled and
 * gets the browser's native link behaviour. The click handler is an
 * enhancement on top: it scrolls the section into view and then puts the cursor
 * in the email field, so the visitor can start typing immediately instead of
 * landing near a form they still have to click into.
 *
 * `preventScroll: true` on the focus call matters — focusing an input scrolls
 * it to the top of the viewport, which would undo the smooth scroll and jump
 * past the section heading.
 */
export function NotifyButton({
  label,
  /**
   * The shape. Defaults to the solid slab (hero); the release blocks pass
   * `actionChipClass` so an upcoming release's "+ Notify me" is the same glass
   * chip as every "+ Listen" beside it. A REPLACEMENT, not a merge — the two
   * recipes contradict each other on background, border and text colour.
   */
  className = actionButtonClass,
}: {
  label: string;
  className?: string;
}) {
  const reduced = useReducedMotion();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    const section = document.getElementById("subscribe");
    if (!section) return; // Fall back to the anchor's default behaviour.

    event.preventDefault();
    section.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });

    const input = document.querySelector<HTMLInputElement>("[data-subscribe-input]");
    if (!input) return;

    if (reduced) {
      input.focus({ preventScroll: true });
      return;
    }

    // Wait for the smooth scroll to settle before focusing, so the two don't fight.
    window.setTimeout(() => input.focus({ preventScroll: true }), 700);
  }

  return (
    <Magnetic>
      <a href="#subscribe" onClick={handleClick} className={className}>
        {/* Rotates only inside the chip, which is itself the `group`; the solid
            slab has no group ancestor, so it stays put as it always has. */}
        <span aria-hidden className="transition-transform duration-300 group-hover:rotate-90">
          +
        </span>
        {label}
      </a>
    </Magnetic>
  );
}
