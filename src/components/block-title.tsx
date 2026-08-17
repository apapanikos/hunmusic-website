import type { ReactNode } from "react";

import { BlockLabel } from "@/components/block";
import { WarpedTitle } from "@/components/warped-title";
import type { WarpedTitleKey } from "@/lib/warped-titles";
import { cn } from "@/lib/utils";

type StickyTitleProps = {
  index: string;
  label: string;
  /** Key of a baked wavy title — see scripts/generate-warped-titles.mjs. */
  title?: WarpedTitleKey;
  /** CSS height for the title — see WarpedTitle on why height, not width. */
  height?: string;
  /** Escape hatch for a heading that isn't one of the baked titles. */
  children?: ReactNode;
};

/**
 * The sticky block title — the Skrillex placement: the small index label sits
 * top-left near the rail, the oversized wavy title is anchored to the RIGHT edge
 * of the viewport and bleeds slightly past it (the bar's own overflow-hidden does
 * the clipping — safe here, because the clip is on the sticky element itself,
 * not an ancestor of it).
 *
 * The bar pins under the mobile bar (`top-14`) or the viewport top on desktop
 * (`lg:top-0`, where the edge rail replaces the top bar), and hands off
 * naturally at the seam. No JavaScript: `position: sticky` stops sticking
 * exactly when the block's bottom edge reaches the bar.
 *
 * The bar is `.glass-bar` — low-tint frost, so whatever scrolls beneath
 * refracts through it. Solid fallback and prefers-reduced-transparency
 * handling live in the recipe (globals.css).
 *
 * Still true, learned the hard way: no `overflow-hidden` on any ANCESTOR of
 * this bar, and never wrap it in `Reveal` — both silently kill the pinning.
 */
export function StickyTitle({ index, label, title, height = "clamp(2.75rem, 7vw, 6rem)", children }: StickyTitleProps) {
  return (
    <div className="glass-bar sticky top-14 z-20 overflow-hidden lg:top-0">
      <div className="relative px-6 pt-5 pb-4 lg:pl-16">
        <BlockLabel index={index} label={label} className="frost-text text-foreground/85" />
        <div className={cn("mt-2 flex justify-end", title && "translate-x-[1%]")}>
          {title ? (
            <WarpedTitle name={title} height={height} anchor="end" />
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}
