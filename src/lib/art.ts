/**
 * The artwork set.
 *
 * Every image here is hun's own work. Drop new pieces into `public/art/`, add an
 * entry below, and point `heroPiece` at whichever should fill the wordmark —
 * nothing else needs to change.
 *
 * Each entry needs an `alt`: these are the visual identity, not decoration, and
 * a screen-reader user should get some sense of what the page looks like.
 */

export type ArtPiece = {
  /** Path under /public. */
  src: string;
  alt: string;
  /**
   * Where the interesting part sits, as a CSS object-position. Lets a piece be
   * cropped into a wide band or a tall column without losing its subject.
   */
  focus?: string;
};

export const artPieces: readonly ArtPiece[] = [
  {
    src: "/art/ikigai-cover.jpg",
    alt: "Abstract gradient artwork: a rainbow sweep through deep black voids and pools of near-white light.",
    focus: "50% 50%",
  },
];

/**
 * The still that fills the wordmark, and backs the blurred field behind it.
 *
 * A frame lifted from `fieldVideo`'s 4K master, so it carries genuine detail at
 * 2400px with 4:4:4 chroma. That combination is the whole point: the mark
 * magnifies this to roughly 1.4x on a retina desktop, which is near enough to
 * native that neither the gradient nor the film grain breaks up.
 *
 * An earlier version resolved the grain out by downsampling to 420px and
 * scaling back up. It removed the grain, but it also removed the *resolution* —
 * an effective 8x magnification — and that softness was the "pixelation" that
 * survived two rounds of fixes aimed at the wrong layer.
 *
 * It's the LCP image, so it's preloaded in layout.tsx.
 */
export const wordmarkArtwork = {
  src: "/art/ikigai-wordmark.jpg",
  alt: "Abstract gradient artwork in the colours of the IKIGAI cover.",
  focus: "50% 50%",
} as const;

/**
 * The moving version of the same piece, behind the wordmark.
 *
 * 720p on purpose. It renders under a 70px blur, so resolution buys nothing —
 * and film grain is expensive to compress, which is why the 4K master is 9.8MB
 * for ten seconds. At 720p it's half a megabyte. The clip loops seamlessly
 * (first and last frames differ by ~2/255), so it needs no crossfade.
 *
 * Deliberately not used inside the letterforms: H.264 is 4:2:0, so its colour
 * is half-resolution, and magnified through the type it would land softer than
 * the 4:4:4 still above.
 */
export const fieldVideo = {
  src: "/art/field.mp4",
} as const;

/**
 * The piece filling the wordmark — the IKIGAI cover.
 *
 * It has the widest tonal range of the set: near-black voids through saturated
 * mid-tones to off-white. That's what makes each letterform pick up a different
 * colour *and* value as the image drifts, instead of reading as flat coloured
 * text. Its sweep is horizontal too, which is the only direction a three-letter
 * mark can really show movement in.
 *
 * It also fronts the IKIGAI release block, but the wordmark crops in hard
 * (190–230% background-size), so what shows through the letters is a moving
 * detail rather than the same picture twice.
 */
export const heroPiece: ArtPiece = artPieces[0];

/**
 * Portrait for the about section. Shown in full colour.
 *
 * The previous portrait was desaturated because its pink duotone introduced a
 * second colour story competing with the artwork. This one doesn't have that
 * problem — its blue and red are the palette: the deep field sits on `--blue`
 * (#2B5CE6) and the rim light on `--signal` (#F5254E), both sampled from the
 * IKIGAI cover. Draining it would throw away the one photo that already belongs
 * to the page's colour world.
 *
 * It's also a dark image, so it dissolves into the black background far more
 * naturally than the high-key original did.
 */
export const portrait = {
  src: "/art/about-photo.jpg",
  alt: "Portrait of hun in a beanie under blue and red light, the motion of the shot smearing his features.",
} as const;

/*
 * Release covers do NOT live here.
 *
 * Each release owns its artwork — src, alt, focus and the accent it lends the
 * rail — in src/data/releases.ts, alongside its title, date and smart link.
 * Splitting a record's cover from the record itself only ever meant editing two
 * files to add one song. `npm run check:art` verifies the paths in both.
 */
