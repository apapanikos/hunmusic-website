"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

import { fieldVideo } from "@/lib/art";

/**
 * The moving artwork behind the wordmark.
 *
 * Layered *over* a still of the same piece rather than replacing it, which is
 * what makes every fallback path correct without branching the markup:
 *
 *  - reduced motion  → never plays, stays transparent, the still shows through
 *  - video fails/404 → never fires `playing`, same outcome
 *  - slow connection → still shows immediately, video fades in when ready
 *
 * `autoPlay` is deliberately NOT set as an attribute. `useReducedMotion()`
 * returns false during SSR and true on the client for those users, so an
 * attribute driven by it would hydrate mismatched. Playback is started from an
 * effect instead — the server and the client render identical markup, and the
 * decision happens after mount where it's safe.
 *
 * The fade is on opacity only, so `MotionConfig reducedMotion="user"` has
 * nothing to strip and this never sits at opacity 0 by accident.
 */
export function AmbientVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video || reduced) return;

    // play() rejects on autoplay-policy refusals and on any decode error. Both
    // just mean "keep showing the still", so swallow it rather than logging
    // noise for something the page already handles.
    void video.play().catch(() => {});
  }, [reduced]);

  return (
    <video
      ref={ref}
      aria-hidden
      muted
      loop
      playsInline
      preload="metadata"
      disablePictureInPicture
      onPlaying={() => setPlaying(true)}
      className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ease-out"
      style={{ opacity: playing ? 1 : 0 }}
    >
      <source src={fieldVideo.src} type="video/mp4" />
    </video>
  );
}
