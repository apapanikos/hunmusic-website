/**
 * Bakes the wavy display titles into static SVG paths.
 *
 * The look is genuine glyph distortion — each stroke bends as a real Bézier —
 * rather than an SVG filter. `feDisplacementMap` was tried first and rejected:
 * it produces soft, noisy edges, where the reference is crisp with smooth
 * regular waves. Warping the outlines instead gives vector-sharp results at any
 * size and costs nothing at runtime, because the work happens here.
 *
 * The warp is a horizontal displacement that varies with Y:
 *
 *     x' = x + amp * sin((y / height) * 2π * waves + phase)
 *
 * so vertical stems undulate as they descend and the wave runs continuously
 * across the whole word.
 *
 * Critical detail: every segment is subdivided, INCLUDING straight lines.
 * Bebas Neue's stems are two-point lines, so warping them without subdividing
 * just moves the endpoints and shears the letter instead of curving it.
 *
 * Run with `npm run generate:titles` after changing any display title in
 * src/lib/site.ts. `npm run check:titles` (wired into prebuild) fails the build
 * if the copy and the baked paths drift apart.
 */
import opentype from "opentype.js";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const FONTS = {
  bebas: opentype.parse(readFileSync(join(root, "scripts/fonts/BebasNeue-Regular.ttf")).buffer),
  geist: opentype.parse(readFileSync(join(root, "scripts/fonts/Geist-SemiBold.ttf")).buffer),
};

/**
 * The fixed titles. Keys are referenced from components; `text` must match the
 * copy in site.ts (check:titles enforces it).
 *
 * The block titles share amp 16 / 1.5 waves. The lowercase brand mark runs
 * gentler (11 / 1.2) — it's an identity, not a poster, and the round bowls of
 * h/u/n distort faster than Bebas's flat stems.
 */
const TITLES = [
  { key: "releases", font: "bebas", text: "RELEASES", amp: 16, waves: 1.5 },
  { key: "stayInTheLoop", font: "bebas", text: "STAY IN THE LOOP", amp: 16, waves: 1.5 },
  { key: "hun", font: "geist", text: "hun", amp: 11, waves: 1.2 },
];

/*
 * Song titles are NOT baked. They render as live Bebas in the release blocks —
 * the wave belongs to the section headings and the wordmark, where it reads as
 * identity rather than as an obstacle between a reader and a track name. Live
 * type also wraps, which single-line vector outlines can't.
 */
const ALL = TITLES;

/** Font units between sampled points. Small enough that the warp reads as a curve. */
const STEP = 4;
const FONT_SIZE = 200;

const lerp = (a, b, t) => a + (b - a) * t;
const quad = (p0, p1, p2, t) => ({
  x: lerp(lerp(p0.x, p1.x, t), lerp(p1.x, p2.x, t), t),
  y: lerp(lerp(p0.y, p1.y, t), lerp(p1.y, p2.y, t), t),
});
const cubic = (p0, p1, p2, p3, t) => {
  const a = { x: lerp(lerp(p0.x, p1.x, t), lerp(p1.x, p2.x, t), t), y: lerp(lerp(p0.y, p1.y, t), lerp(p1.y, p2.y, t), t) };
  const b = { x: lerp(lerp(p1.x, p2.x, t), lerp(p2.x, p3.x, t), t), y: lerp(lerp(p1.y, p2.y, t), lerp(p2.y, p3.y, t), t) };
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
};

function flatten(path) {
  const out = [];
  let cur = null;
  let start = null;
  const steps = (p0, p1, min = 2) => Math.max(min, Math.ceil(Math.hypot(p1.x - p0.x, p1.y - p0.y) / STEP));

  for (const c of path.commands) {
    if (c.type === "M") {
      cur = { x: c.x, y: c.y };
      start = cur;
      out.push(["M", cur]);
    } else if (c.type === "L") {
      const p0 = cur;
      const p1 = { x: c.x, y: c.y };
      const n = steps(p0, p1);
      for (let i = 1; i <= n; i++) out.push(["L", { x: lerp(p0.x, p1.x, i / n), y: lerp(p0.y, p1.y, i / n) }]);
      cur = p1;
    } else if (c.type === "Q") {
      const p0 = cur;
      const p2 = { x: c.x, y: c.y };
      const n = steps(p0, p2, 8);
      for (let i = 1; i <= n; i++) out.push(["L", quad(p0, { x: c.x1, y: c.y1 }, p2, i / n)]);
      cur = p2;
    } else if (c.type === "C") {
      const p0 = cur;
      const p3 = { x: c.x, y: c.y };
      const n = steps(p0, p3, 10);
      for (let i = 1; i <= n; i++) out.push(["L", cubic(p0, { x: c.x1, y: c.y1 }, { x: c.x2, y: c.y2 }, p3, i / n)]);
      cur = p3;
    } else if (c.type === "Z") {
      out.push(["Z"]);
      cur = start;
    }
  }
  return out;
}

function bake({ font, text, amp, waves, phase = 0 }) {
  const path = FONTS[font].getPath(text, 0, 0, FONT_SIZE);
  const bb = path.getBoundingBox();
  const height = bb.y2 - bb.y1;

  let d = "";
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;

  for (const cmd of flatten(path)) {
    if (cmd[0] === "Z") {
      d += "Z";
      continue;
    }
    const p = cmd[1];
    const x = p.x + amp * Math.sin(((p.y - bb.y1) / height) * Math.PI * 2 * waves + phase);
    const y = p.y;
    x0 = Math.min(x0, x);
    x1 = Math.max(x1, x);
    y0 = Math.min(y0, y);
    y1 = Math.max(y1, y);
    d += `${cmd[0]}${x.toFixed(2)} ${y.toFixed(2)}`;
  }

  // Normalise to a viewBox anchored at 0,0 so consumers never juggle offsets.
  const shifted = d.replace(/([ML])(-?\d+\.?\d*) (-?\d+\.?\d*)/g, (_, c, px, py) =>
    `${c}${(Number(px) - x0).toFixed(2)} ${(Number(py) - y0).toFixed(2)}`
  );

  return { d: shifted, width: Number((x1 - x0).toFixed(2)), height: Number((y1 - y0).toFixed(2)) };
}

const entries = ALL.map((t) => {
  const { d, width, height } = bake(t);
  // Keys are quoted because the release keys contain hyphens. `keyof typeof`
  // is unaffected — they're still literal keys.
  return `  ${JSON.stringify(t.key)}: {\n    text: ${JSON.stringify(t.text)},\n    width: ${width},\n    height: ${height},\n    d: ${JSON.stringify(d)},\n  },`;
});

const out = `/**
 * GENERATED FILE — do not edit by hand.
 *
 * Wavy display titles baked to static SVG paths by
 * scripts/generate-warped-titles.mjs. Regenerate with:
 *
 *     npm run generate:titles
 *
 * \`text\` is the source string each path was built from; check:titles compares
 * it against the copy in site.ts so the two can't silently drift.
 */

export type WarpedTitle = {
  text: string;
  /** viewBox width of the warped outline. */
  width: number;
  /** viewBox height of the warped outline. */
  height: number;
  /** Path data, anchored at 0,0. */
  d: string;
};

export const warpedTitles = {
${entries.join("\n")}
} as const satisfies Record<string, WarpedTitle>;

export type WarpedTitleKey = keyof typeof warpedTitles;
`;

writeFileSync(join(root, "src/lib/warped-titles.ts"), out);
console.log(`generate:titles — baked ${ALL.length} titles`);
for (const t of ALL) console.log(`  ${t.key.padEnd(22)} "${t.text}"`);
