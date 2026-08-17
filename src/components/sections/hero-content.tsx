"use client";

import { useEffect, useId, useRef } from "react";
import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

import { EASE } from "@/components/motion/reveal";
import { NotifyButton } from "@/components/sections/notify-button";
import { wordmarkArtwork } from "@/lib/art";
import { site } from "@/lib/site";
import { warpedTitles } from "@/lib/warped-titles";

const PARALLAX_RANGE = 700;
const PARALLAX_SHIFT = 80;
const FADE_RANGE = 500;

/**
 * How the artwork sits inside the letterforms, as multiples of the wordmark's
 * viewBox. The image is oversized so the drift never exposes an edge.
 */
const BASE_SCALE = 1.5;
const DRIFT_SCALE = 0.12;
const DRIFT_X = 0.16;
const DRIFT_Y = 0.05;
/** How far the cursor pulls the artwork, in viewBox fractions. */
const POINTER_X = 0.06;
const POINTER_Y = 0.03;

const mark = warpedTitles.hun;

/**
 * The signature effect: the artwork seen through the wordmark.
 *
 * The mark is a pre-warped vector outline (see scripts/generate-warped-titles.mjs)
 * used as an SVG `clipPath`, with the artwork drawn behind it. That replaces the
 * old `background-clip: text` on live text — the letterforms now carry the same
 * liquid wave as the block titles, and being real outlines they stay crisp.
 *
 * Three things still move it:
 *
 *  - a slow autonomous drift, so the mark is never static;
 *  - the cursor, which pulls the artwork around inside the letters;
 *  - scroll, which lifts and dissolves the whole block.
 *
 * The image's x/y/width/height are written as SVG attributes from the animation
 * frame rather than animated as CSS transforms — SVG transform-origin behaviour
 * varies across engines, and attribute writes are unambiguous and cheap.
 *
 * Reduced motion: the drift loop and pointer listener never start, so the mark
 * holds the resting crop. Markup is identical either way, so hydration is safe.
 */
export function HeroContent() {
  const reduced = useReducedMotion();
  const clipId = useId();
  const imageRef = useRef<SVGImageElement>(null);
  const { scrollY } = useScroll();

  const y = useTransform(scrollY, (value) =>
    reduced ? 0 : (Math.min(value, PARALLAX_RANGE) / PARALLAX_RANGE) * PARALLAX_SHIFT
  );
  const opacity = useTransform(scrollY, (value) =>
    reduced ? 1 : 1 - Math.min(value, FADE_RANGE) / FADE_RANGE
  );

  // Raw pointer offset, spring-smoothed so the artwork lags the cursor slightly
  // instead of snapping to it.
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 55, damping: 20, mass: 0.7 });
  const smoothY = useSpring(pointerY, { stiffness: 55, damping: 20, mass: 0.7 });

  // Resting crop — also what the server renders, so the first client frame agrees.
  const restW = mark.width * BASE_SCALE;
  const restH = mark.height * BASE_SCALE;
  const restX = (mark.width - restW) / 2;
  const restY = (mark.height - restH) / 2;

  useEffect(() => {
    if (reduced) return;

    function handleMove(event: PointerEvent) {
      if (event.pointerType !== "mouse") return;
      pointerX.set((event.clientX / window.innerWidth - 0.5) * 2 * POINTER_X);
      pointerY.set((event.clientY / window.innerHeight - 0.5) * 2 * POINTER_Y);
    }

    window.addEventListener("pointermove", handleMove, { passive: true });
    return () => window.removeEventListener("pointermove", handleMove);
  }, [reduced, pointerX, pointerY]);

  useAnimationFrame((time) => {
    const image = imageRef.current;
    if (reduced || !image) return;

    const t = time / 1000;
    // Three incommensurate periods, so the loop never visibly repeats.
    const scale = BASE_SCALE + Math.sin(t * 0.09) * DRIFT_SCALE;
    const w = mark.width * scale;
    const h = mark.height * scale;
    const x = (mark.width - w) / 2 + (Math.sin(t * 0.19) * DRIFT_X + smoothX.get()) * mark.width;
    const yy = (mark.height - h) / 2 + (Math.cos(t * 0.13) * DRIFT_Y + smoothY.get()) * mark.height;

    image.setAttribute("x", x.toFixed(2));
    image.setAttribute("y", yy.toFixed(2));
    image.setAttribute("width", w.toFixed(2));
    image.setAttribute("height", h.toFixed(2));
  });

  return (
    /*
     * z-60 is load-bearing, not arbitrary: it lifts the hero content above the
     * page-wide grain layer, which is `fixed z-50`. The letterforms are the
     * brightest, largest surface on the page, so grain landed on them as coarse
     * speckle that read as the artwork being low-resolution. Everything below
     * z-50 still gets grain — including this section's blurred field, dither and
     * vignette — so the mark reads as crisp type on a textured field.
     *
     * It has to sit on this element rather than on the <h1>. `section#top` has
     * no z-index and so creates no stacking context, which is what lets this
     * compete with the grain in the root stacking context. But the `y` transform
     * below turns *this* element into a stacking context the moment the page
     * scrolls, which would trap any z-index set on a descendant.
     */
    <motion.div
      style={{ y, opacity }}
      className="relative z-[60] flex w-full flex-col items-center px-6 text-center"
    >
      <h1 aria-label={site.artist} className="w-full max-w-[80vw] select-none sm:max-w-[62vw]">
        <svg
          aria-hidden
          viewBox={`0 0 ${mark.width} ${mark.height}`}
          className="block w-full"
          style={{
            // Reveal lives in CSS so the resting state is visible — see globals.css.
            animation: "wordmark-wipe 1.5s cubic-bezier(0.16, 1, 0.3, 1) 0.15s backwards",
          }}
        >
          <defs>
            <clipPath id={clipId}>
              <path d={mark.d} />
            </clipPath>
          </defs>
          <image
            ref={imageRef}
            href={wordmarkArtwork.src}
            x={restX}
            y={restY}
            width={restW}
            height={restH}
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${clipId})`}
          />
        </svg>
      </h1>

      {/* Two lines, broken deliberately rather than left to wrap — the pause
          between them is the point. Rendered as one <p> so it reads as a single
          sentence to a screen reader. */}
      <motion.p
        className="mt-8 max-w-sm text-[0.95rem] leading-relaxed text-muted-foreground"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 1.2, ease: EASE }}
      >
        {site.tagline.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </motion.p>

      <motion.div
        className="mt-10 flex flex-col items-center gap-5 sm:flex-row sm:gap-8"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 1.4, ease: EASE }}
      >
        <NotifyButton label={site.hero.cta} />

        {/* The underline is absolute so it adds no height — otherwise this link
            would sit a few px above the button's optical centre. */}
        <a
          href="#releases"
          className="group relative font-ui text-[0.72rem] tracking-[0.2em] text-muted-foreground uppercase transition-colors duration-300 hover:text-foreground"
        >
          {site.hero.ctaSecondary}
          <span className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-500 ease-out group-hover:scale-x-100" />
        </a>
      </motion.div>
    </motion.div>
  );
}
