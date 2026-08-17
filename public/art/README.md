# Artwork

Every image here is hun's own work. No placeholders remain.

| File | Used for | Export |
|---|---|---|
| `ikigai-wordmark.jpg` | fills the hero wordmark, and backs the field behind it | 2400px, q88, **4:4:4** — a frame from the 4K clip below |
| `field.mp4` | the moving field behind the wordmark | 720p, crf 32, no audio — from the same 4K clip |
| `ikigai-cover.jpg` | the release panel | 1600px, q72 — from the 6000×4000 master |
| `about-photo.jpg` | the about portrait | 1764×1920, as supplied — shown in full colour |

## Why the wordmark still is what it is

Two properties matter and both were learned the hard way:

**4:4:4 chroma.** A normal JPEG stores colour at half resolution (4:2:0). The wordmark
magnifies its fill past 100%, so half-res colour showed up as mottling in the gradients.
`sharp(...).jpeg({ chromaSubsampling: '4:4:4', mozjpeg: true })` fixes it — and here it came
out *smaller* than the 4:2:0 version, not larger.

**Real resolution.** An earlier version tried to remove the source's film grain by
downsampling to 420px and scaling back to 1600px. It killed the grain, but it also left an
effective 8× magnification, and that softness was the "pixelation" that survived two rounds
of fixes. Don't de-grain by downsampling. At 2400px from a 4K frame, the grain sits near
native scale and reads as film grain, which is the point of the pack.

## The field video

720p is deliberate: it renders under a 70px blur, so resolution buys nothing, and film grain
is expensive to compress — the 4K master is 9.8MB for ten seconds. The clip loops seamlessly
(first and last frames differ by ~2/255), so no crossfade is needed. Strip the audio track;
the source ships with a pointless AAC stream.

Regenerate with:

```
ffmpeg -i SOURCE.mp4 -an -vf scale=1280:-2 -c:v libx264 -profile:v high \
  -pix_fmt yuv420p -crf 32 -preset slow -movflags +faststart public/art/field.mp4
```

Video is **not** used inside the letterforms: H.264 is 4:2:0, so magnified through the type
it lands softer than the still.

The mailing-list section deliberately carries no artwork — it's where the page stops
showing and starts asking.

The portrait needs no treatment: its blue and red already are the palette (`--blue`
#2B5CE6, `--signal` #F5254E), and being a dark image it dissolves into the page black on
its own.

Release covers are shown in a **square** frame at every size, uncropped. That's deliberate:
the sleeves set their title and the `hun.` mark into the bottom-left corner, and the wider
frame this used to have sliced that typography off. `focus` therefore only bites on a piece
that isn't square — like the IKIGAI master, which is wide and crops in from the sides.

## Rotating pieces

The page's own artwork is driven by [`src/lib/art.ts`](../../src/lib/art.ts). Add a file
here, add an entry to `artPieces`, and change `heroPiece` to point at whichever one should
fill the wordmark. Nothing else needs touching.

Release covers are the exception: the files live in `public/covers/` named by slug
(`unwriteme.jpg`), and are declared with their release in
[`src/data/releases.ts`](../../src/data/releases.ts) alongside its title, year and smart
link — so adding a record is one data file plus the image. Keep them local rather than
hotlinking Spotify's CDN; `npm run check:art` verifies the paths in both files.

Each entry needs an `alt` string — these are the visual identity rather than decoration,
so they should be described. `focus` is a CSS `object-position` and controls what stays
visible when a piece is cropped into a thin band or a tall column.

## Picking a piece for the wordmark

The wordmark is only three letters, so the piece needs to do a lot in a small area:

- **Wide tonal range.** Near-black through saturated mid-tones to off-white means each
  letter picks up different colour *and* value. A piece that's uniformly bright makes the
  mark look like flat coloured text.
- **Horizontal movement.** The background drifts side to side, so pieces whose interest
  runs left-to-right show motion; vertically-banded pieces barely change.
- **Some dark mass.** The voids give the letterforms weight against the black field.

## Format

Export at roughly 2000px on the long edge, JPEG quality ~80. These are decorative-scale
images, not prints, and the global grain overlay sits on top of them anyway — heavy files
buy nothing. The portrait is fine at ~1400px wide.

Don't bake extra grain or filtering into the exports: the page applies one shared grain
layer across the whole document so the UI and the art read as the same material.
