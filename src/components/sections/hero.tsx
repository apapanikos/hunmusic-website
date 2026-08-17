import { AmbientVideo } from "@/components/atmosphere/ambient-video";
import { NOISE_URL } from "@/components/atmosphere/noise";
import { HeroContent } from "@/components/sections/hero-content";
import { ScrollCue } from "@/components/sections/scroll-cue";
import { wordmarkArtwork } from "@/lib/art";
import { site } from "@/lib/site";

/**
 * Full-viewport opening: the wordmark filled with artwork, over a near-black
 * field. Server-rendered shell — only the wordmark block ships JS.
 *
 * The same piece runs blurred behind the mark at low opacity — as video, over a
 * still of itself — so the type sits in a wash of its own colour that actually
 * moves, instead of on flat black.
 */
export function Hero() {
  return (
    <section
      id="top"
      // The colour the left rail reflects while this block fills the viewport —
      // see site-nav.tsx.
      data-accent={site.accents.top}
      className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden"
    >
      {/*
        The blurred field: the artwork actually moving, behind the mark.

        The still is the element's own background and the video layers over it
        (see AmbientVideo) — so reduced motion, a failed fetch and a slow
        connection all degrade to the still with no branching in the markup.

        Three things here are deliberate:

        1. Nothing transforms this element. It used to carry a `scale` keyframe,
           which made the background look pixelated — the compositor rasterises
           a blurred layer once and then scales that raster, so a transform
           magnifies the blur's own low-resolution bitmap into visible blocks.
           The still's drift animates `background-position` instead, which
           re-reads the source rather than stretching a cached raster.

        2. It's inset well past the section bounds. `cover` on a box larger than
           the viewport gives the position drift slack to move within, and keeps
           the blur's soft edges away from any visible boundary.

        3. The blur and opacity live here, on the wrapper, so they apply to the
           still and the video identically — the handover between them is
           invisible.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-[18%] overflow-hidden opacity-[0.26] blur-[70px]"
        style={{
          backgroundImage: `url(${wordmarkArtwork.src})`,
          backgroundSize: "cover",
          backgroundPosition: "50% 50%",
          animation: "field-drift 52s ease-in-out infinite",
        }}
      >
        <AmbientVideo />
      </div>

      {/*
        Dither. A heavy blur across a dark gradient bands badly in 8-bit — broad
        blotchy steps where the colour should be continuous. The page-wide grain
        can't fix that because it blends with `soft-light`, which barely moves
        near-black. This is the same noise tile at straight alpha, which does
        reach the darks and breaks the steps up.

        It sits below the wordmark: this element is `z-index: auto`, and
        HeroContent is z-60, so the dither only ever touches the field behind
        the type.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{ backgroundImage: NOISE_URL, backgroundRepeat: "repeat" }}
      />

      {/* Vignette — pins the eye to the mark and keeps the edges black. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 75% at 50% 45%, transparent 25%, var(--background) 88%)",
        }}
      />

      <HeroContent />
      <ScrollCue />
    </section>
  );
}
