/**
 * A 180×180 tile of monochrome fractal noise, as a data URI.
 *
 * Shared by the page-wide grain layer and the hero's dither. Encoding it once
 * here means both reference an identical texture, so the two never read as two
 * different grains sitting on top of each other.
 *
 * It's a tile rather than one full-viewport filtered rect on purpose: the
 * browser rasterises `feTurbulence` once at 180×180 and the compositor repeats
 * it, instead of running the turbulence across every pixel on screen.
 */
const NOISE_TILE = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`;

export const NOISE_URL = `url("data:image/svg+xml;utf8,${encodeURIComponent(NOISE_TILE)}")`;
