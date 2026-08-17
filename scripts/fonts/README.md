# Build-input fonts

These are **not** served to the browser — `next/font` handles the webfonts. These two
files exist only so `scripts/generate-warped-titles.mjs` can read glyph outlines and bake
the wavy display titles into static SVG paths.

| File | Source | Licence |
|---|---|---|
| `BebasNeue-Regular.ttf` | Google Fonts — Bebas Neue | SIL Open Font License 1.1 |
| `Geist-SemiBold.ttf` | Google Fonts — Geist 600 | SIL Open Font License 1.1 |

Both licences permit modification, which is what the warp does. Vendored rather than
fetched at build time so generation is reproducible offline and can't break on a CDN
change.
