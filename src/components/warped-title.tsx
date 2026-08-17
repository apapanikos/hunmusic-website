import { warpedTitles, type WarpedTitleKey } from "@/lib/warped-titles";
import { cn } from "@/lib/utils";

type WarpedTitleProps = {
  /** Key into the baked title set — see scripts/generate-warped-titles.mjs. */
  name: WarpedTitleKey;
  /** "end" anchors the title to the right edge of its box. */
  anchor?: "start" | "end";
  /**
   * CSS height for the title. Sized by HEIGHT, not width: these viewBoxes have
   * very different aspect ratios (IKIGAI ~2.6, STAY IN THE LOOP ~7.3), so a
   * shared width would make short words enormous and long ones tiny.
   */
  height: string;
  className?: string;
  /** Renders as a plain <div> when the heading semantics belong to a parent. */
  as?: "h2" | "div";
};

/**
 * A wavy display title, rendered as a static SVG outline.
 *
 * The wave is baked into the glyph outlines at build time (real Béziers, warped
 * point by point) rather than produced by an SVG filter. Filters were tried and
 * rejected — `feDisplacementMap` gives soft, noisy edges where this look needs
 * to be crisp. Vectors stay sharp at any size and cost nothing at runtime.
 *
 * No motion here at all: the wave IS the resting shape, exactly like the poster
 * lettering it's modelled on. Nothing to gate for reduced motion.
 *
 * Semantics: the element carries `aria-label` with the real string and the SVG
 * is aria-hidden, so the document outline reads as ordinary text.
 */
export function WarpedTitle({ name, height, anchor = "start", className, as = "h2" }: WarpedTitleProps) {
  const title = warpedTitles[name];
  const Tag = as;

  return (
    <Tag aria-label={title.text} className={cn("block", className)} style={{ height }}>
      <svg
        aria-hidden
        viewBox={`0 0 ${title.width} ${title.height}`}
        className="block h-full w-auto overflow-visible"
        preserveAspectRatio={anchor === "end" ? "xMaxYMid meet" : "xMinYMid meet"}
      >
        <path d={title.d} className="fill-foreground" />
      </svg>
    </Tag>
  );
}
