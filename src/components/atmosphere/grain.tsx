import { NOISE_URL } from "@/components/atmosphere/noise";

/**
 * Global film grain — the signature that makes UI and artwork read as one
 * material rather than photos pasted onto a website.
 *
 * One fixed layer above everything, including the images. Because it sits over
 * the artwork and the portrait too, nothing needs grain applied per-asset.
 *
 * Blends with `soft-light`, not `overlay`. Overlay scales hard with the base
 * luminance, so on the brightest thing on the page — the wordmark's near-white
 * letterforms — it turned into coarse visible speckle that read as the artwork
 * being low-resolution. Soft-light applies the same texture far more gently at
 * the top of the range, so the letters stay clean and the gradients keep their
 * saturation, while midtones still get grain.
 *
 * Neither blend does much to near-black, so the hero carries its own
 * straight-alpha dither for the darks; see hero.tsx.
 *
 * Static, so reduced motion needs no special handling.
 */
export function Grain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50 opacity-[0.22] mix-blend-soft-light"
      style={{ backgroundImage: NOISE_URL, backgroundRepeat: "repeat" }}
    />
  );
}
