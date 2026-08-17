# hun — artist site

A single-page home for an electronic music artist, with a mailing-list signup backed by
Kit.

Not a release campaign — there's no record to count down to. The page is a hub: the
wordmark, where to listen, who it is, and a standing "tell me when there's new music".

The artwork is the design. A set of grainy, high-saturation gradient pieces carries all
the colour and geometry; the UI stays restrained around them, and one global grain layer
sits over the whole document so interface and imagery read as a single material.

The structure is a vertical stack of full-bleed blocks — hero, releases, about, signup —
beside a strip of rotated nav text on the desktop page edge (glass top bar on
mobile) whose items anchor-scroll to the blocks (no routes). Section titles anchor to the
RIGHT edge and bleed slightly past it, clipped by their own sticky bar. Each section's oversized title is `position:
sticky` on a frosted bar: it pins while its block scrolls and hands off at the seam with
no JS (see `src/components/block-title.tsx` — and its warning about `overflow-hidden`
ancestors, which silently kill the pinning). Inside the releases stack the per-release
titles are in-flow instead, alternating left and right block by block, oversized enough to
run onto the artwork beside them. Display titles — and the hero wordmark — are wavy: the glyph outlines are warped
point-by-point at build time by `scripts/generate-warped-titles.mjs` and baked into static
SVG paths (`src/lib/warped-titles.ts`). The baker reads the fixed titles from `site.ts`
and one per release from `src/data/releases.ts`, so a new record needs no edit here — just
a regenerate:

```bash
npm run generate:titles
```

`npm run check:titles` runs on `prebuild` and fails the build if the copy and the baked
paths drift apart — otherwise the page would announce one word via `aria-label` and draw
another. A release with no bake *yet* is only a warning: its block falls back to live
Bebas, unwarped but correct.

An SVG-filter approach (`feDisplacementMap`) was tried first and rejected: filters give
soft, noisy edges where this look needs to be crisp. Warping real Béziers stays sharp at
any size and costs nothing at runtime. One trap worth knowing if you touch the generator —
straight line segments must be subdivided before warping, or Bebas's two-point stems just
shear instead of curving. Body text never warps.

The glass is one recipe (`.glass` / `.glass-bar` in globals.css): solid panel by default,
frost under `@supports (backdrop-filter)`, solid again under
`prefers-reduced-transparency`. The full-bleed artwork layers span the whole viewport and
run under the edge nav — only text containers clear it (`.rail-clear`). The edge nav is
the one place chrome takes the artwork's hues: it animates a single CSS variable
(`--rail-accent`, per-section values in `site.accents`) and the active item's "+" and glow
derive from it via `color-mix()`. Everywhere else glass stays near-colourless. Primary
actions carry a "+" prefix; titles set in Bebas Neue. All UI chrome — nav, actions, index labels,
footer — is **Michroma** (`--font-ui`), a squarish Eurostile-descended techno sans, in
wide-tracked uppercase. Body copy stays Geist Sans: Michroma is a display face and
paragraph-length text in it is punishing.

It's a wide face, so the mobile bar carries tighter metrics than the desktop rail
(`site-nav.tsx`) — at default tracking the four items overflow a 390px viewport. If you
swap it, re-check that bar first; it's the tightest constraint on the page.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript strict |
| Styling | Tailwind CSS v4 + shadcn/ui (Base UI primitives) |
| Motion | Framer Motion 13 |
| Mailing list | Kit (ConvertKit) v4 API, called from a Server Action |
| Images | `next/image`, local files in `public/art/` |
| Deploy | Vercel |

Server Components by default. `'use client'` appears only where motion or interactivity
requires it — the hero wordmark, the scroll cue and progress bar, the reveal wrapper, and
the signup form. The grain layer and the wordmark's drift are pure CSS/SVG and ship no
JavaScript at all.

## The artwork

Every image on the page is hun's own work — no placeholders. The IKIGAI cover fills the
wordmark and fronts the IKIGAI release block, and the portrait sits in the about section.
Every other release shows its own sleeve from `public/covers/`, declared beside it in
`src/data/releases.ts`. See
[`public/art/README.md`](public/art/README.md) for the rotation config and export notes.

## Quick start

```bash
npm install
```

Copy the env template and fill in your Kit API key:

```bash
cp .env.example .env.local
```

```bash
npm run dev
```

The page renders fine with no API key configured — the form just returns its error state
on submit, and the reason is logged server-side.

## Environment variables

| Variable | Where it's used | Notes |
|---|---|---|
| `KIT_API_KEY` | Server Action | V4 key from Kit → Settings → Developer → API keys. **Server only** — never prefix with `NEXT_PUBLIC_`, never commit |
| `KIT_FORM_ID` | Server Action | Optional. Attaches new subscribers to a Kit form, which is what fires its welcome email |
| `NEXT_IMAGE_UNOPTIMIZED` | `next.config.ts` | Local-only macOS workaround, see Troubleshooting. Leave unset on Vercel |

`src/lib/newsletter/kit.ts` imports `server-only`, so if the provider module is ever pulled
into a Client Component by mistake, the build fails instead of shipping the key.

## The mailing list

The provider is [Kit](https://kit.com) (formerly ConvertKit), and the entire integration is
one file: [`src/lib/newsletter/kit.ts`](src/lib/newsletter/kit.ts), exposing a single
`subscribeEmail()` returning `subscribed | already | error`.

There's no database. An earlier version wrote addresses to a Postgres table, which stored
them perfectly and could not send anything — and sending is the whole point of a list, along
with unsubscribe links, bounce handling and the legal footers that come with them. Kit's
free tier covers 10k subscribers.

### Setup

1. Create the account and a form at [kit.com](https://kit.com).
2. Settings → Developer → API keys → create a **V4** key.
3. Put it in `.env.local` as `KIT_API_KEY`, and in Vercel under Settings → Environment
   Variables for Production and Preview.
4. Optionally set `KIT_FORM_ID` (from the form's edit URL) so new subscribers get that
   form's welcome email.

### How the status codes map

`POST /v4/subscribers` is an upsert, and its status code carries the one distinction the UI
needs: **201** for a new subscriber, **200** when Kit already knew the address. Those become
the form's "You're in." and "Already on the list." states, so the page tells the truth
without keeping a local copy of the list to check against.

Attaching to a form is a second call (`POST /v4/forms/{id}/subscribers/{subscriber_id}`). If
it fails, the failure is logged and swallowed — the person is already subscribed by then, and
showing them an error would invite a resubmit to fix something that isn't broken.

### Swapping providers

Reimplement `subscribeEmail()` and nothing else changes: the Server Action and the form only
know the three-state result. Buttondown, EmailOctopus and Resend Audiences all fit the same
shape.

## How the signup works

`src/app/actions/join-waitlist.ts` is a Server Action consumed by `useActionState`. It
returns a discriminated union rather than throwing:

| Status | Cause | What the visitor sees |
|---|---|---|
| `success` | Kit returned 201 (new subscriber) | Confirmation panel |
| `duplicate` | Kit returned 200 (address already known) | "Already on the list" — a confirmation, not an error |
| `invalid` | Failed Zod validation | Inline message under the field |
| `error` | Anything else (logged server-side) | Generic retry message |

Being already signed up is a success from the visitor's point of view, so it gets a
confirmation panel too. Neither path reveals whether an address was already stored in a
way the other doesn't, so the form isn't an email-enumeration oracle.

A honeypot field named `company` is hidden off-screen and marked `aria-hidden` with
`tabIndex={-1}`. Bots that fill every field get the success shape back without a write.

**Not included:** rate limiting. Server Actions are POST endpoints reachable by anyone
who can send the request, so a public form like this will eventually get hammered. For
production, put `@upstash/ratelimit` in front of the provider call, keyed on IP. Left out
here because it needs a second service — note that unthrottled submissions also burn
requests against Kit's own rate limit.

## Deploying to Vercel

1. Push the repo to GitHub.
2. In Vercel, **Add New → Project** and import it. The Next.js preset is detected
   automatically; no build settings to change.
3. Under **Settings → Environment Variables**, add `KIT_API_KEY` (and optionally
   `KIT_FORM_ID`) for Production and Preview.
4. Deploy.

Env vars are only read at request time inside the Server Action, so a missing key
surfaces as the form's error state rather than a failed build — check the function logs
in Vercel if submissions start failing.

If you put the site behind a proxy or a custom CDN domain, set
`serverActions.allowedOrigins` in `next.config.ts`; Next rejects Server Action requests
whose `Origin` doesn't match the `Host`.

## Customising

- **Copy** — `src/lib/site.ts`. Artist name, tagline, every section's text, social links,
  the contact address, and all four states of the signup form.
- **Releases** — `src/data/releases.ts`, and nothing else. One object per record: title,
  year, duration, description, cover, accent, and the **smart link** the block's single
  "+ Listen" action opens in a new tab (a Linkfire / Feature.fm / Songwhip / tr.ee page,
  where the fan picks their own platform). `spotifyUrl` is optional and renders as a quiet
  secondary text link — never as the main action, so fans on Apple Music or SoundCloud
  aren't pushed somewhere they don't subscribe. Order in the file doesn't matter — the
  stack sorts newest-first, ties keeping file order. After adding one, run
  `npm run generate:titles` so its display title gets the wave.

  Covers live in `public/covers/`, named by slug, and are **served locally rather than
  hotlinked** from Spotify's CDN (`i.scdn.co`): that host serves Spotify's own clients, on
  its own cache and CORS rules, and can drop or change an image URL when a release is
  re-delivered. Local files also skip whitelisting a remote host for `next/image`. The
  frame is square at every breakpoint because these sleeves carry their own typography in
  the bottom-left corner — a wider crop would cut it off.

  Anything with `status: "upcoming"` and no smart link shows "+ Notify me" instead, which
  scrolls to the one mailing-list form — the page never grows a second capture. A released
  track with no link yet simply shows no action.

  Blocks carry no players and no play counts by design; the artwork and the smart link do
  the work. The one exception is `embedUrl` on the **top** release, which adds an inline
  Spotify or SoundCloud player under that block. It's off unless set.
- **Artwork** — `src/lib/art.ts` holds the piece list, the wordmark still and the
  portrait; release covers are referenced from `src/data/releases.ts` and live in
  `public/covers/`. See [`public/art/README.md`](public/art/README.md).
- **Rail colour** — each block hands the left glass rail an accent through a `data-accent`
  attribute (`site.accents` for the fixed sections, `accent` per release). The nav's
  IntersectionObserver reads it off whichever block fills most of the viewport.
- **Palette** — the tokens at the top of `src/app/globals.css`, all sampled from the
  artwork: `--blue` `#2B5CE6`, `--magenta` `#FF3DA5`, `--acid` `#A6E22E`, `--signal`
  `#F5254E`, `--lilac` `#EFC7EF`, over `#0B0B0D` and `#ECEEF2`. The chromatics are accents
  only — focus rings, the success state, a hairline — so the imagery stays the loud thing.

## Grain

One `position: fixed` layer over the entire document, including the images, at
`mix-blend-mode: overlay` and 18% opacity. That's what makes the UI and the artwork feel
like one material instead of photos pasted onto a website.

It's a 180×180 SVG noise tile encoded as a data URI and repeated, rather than one
full-viewport rect with a filter on it. The tile is rasterised once and the compositor
repeats it; the full-viewport version makes the browser run `feTurbulence` over every
pixel on screen and redo it on every reraster. Same look, far cheaper. Being static, it
needs no reduced-motion handling.

## Motion and accessibility

`MotionConfig reducedMotion="user"` wraps the app, so when the OS asks for reduced motion
Framer Motion drops every transform and layout animation and keeps only opacity fades.
CSS animations (the wordmark drift and the blurred field behind it) are frozen by a
`prefers-reduced-motion` block in `globals.css`, and pointer-driven effects (the magnetic
CTA) check the hook before attaching.

The wordmark's fallback is deliberate rather than incidental: freezing the drift leaves a
still crop of the artwork held inside the letterforms, so reduced-motion visitors get the
same effect without the movement — not a blank or flat-coloured mark.

One subtlety worth knowing if you extend this: `useReducedMotion()` returns `false` during
SSR and `true` on the client for these users, so branching *what you render* on it causes
a hydration mismatch. Components here only ever use it to decide behaviour — whether to
attach a handler, how far to parallax — never to change their first render.

Also handled: a skip link to the signup, `aria-label` on the hero wordmark, described
`alt` text on the artwork (it's the identity, not decoration), a live region for form
messages, visible focus rings, and `aria-invalid` wired to the error state.

## Troubleshooting: broken images on macOS

Only bites when the repo lives on a **non-HFS volume** (an exFAT/FAT external drive, as
here). Vercel and any APFS checkout are unaffected.

macOS writes an AppleDouble `._<name>` sidecar next to every file on those filesystems.
Next's image optimizer lists `.next/cache/images`, picks up the 4 KB sidecar instead of
the real cached image, and serves it with a `Content-Type: image/jpeg` and a 200:

```
raw /art/about-photo.jpg   → 200, 852952 bytes, valid JPEG
optimizer 1st (cache MISS) → 200,  12610 bytes, valid JPEG   ✅
optimizer 2nd (cache HIT)  → 200,   4096 bytes, AppleDouble  ❌
```

The browser can't decode it, `naturalWidth` reads `0`, and you get a broken-image glyph —
with nothing in the network tab to suggest a failure. The first view of any image works
and every view after it breaks, which is what makes it confusing to chase.

**The fix**, already applied in `.env.local`:

```bash
NEXT_IMAGE_UNOPTIMIZED=1
```

`next.config.ts` reads it and skips the optimizer, and therefore its cache, entirely.
It's opt-in and env-driven on purpose: Vercel never sets it, so production keeps full
image optimization. Cleaning the sidecars by hand (`npm run clean:sidecars`) also works
but only until the next cache write, which is why it isn't the real answer.

`distDir` can't be moved outside the project directory, so relocating the cache off the
volume isn't an option. Moving the checkout to the internal drive resolves it completely
— the same sidecars are why `**/._*` sits in the ESLint ignores and `.gitignore`.

### Guarding against the Vercel case-sensitivity trap

`npm run check:art` runs on `prebuild` and fails the build if any path referenced in
`src/lib/art.ts` or `src/data/releases.ts` is missing from `public/`, or differs from the
real filename **in case**.
macOS is case-insensitive and Linux is not, so `About-Photo.JPG` referenced as
`about-photo.jpg` works locally and 404s the moment it deploys. This turns that into a
local build failure instead of a broken image in production.

## Project structure

```
src/
├─ app/
│  ├─ actions/join-waitlist.ts   # 'use server' — the only write path
│  ├─ globals.css                # palette tokens, keyframes, reduced-motion rules
│  ├─ layout.tsx                 # fonts, metadata, grain, MotionConfig
│  └─ page.tsx                   # composes the four sections + footer
├─ components/
│  ├─ atmosphere/grain.tsx       # global noise layer (no JS)
│  ├─ motion/                    # Reveal, Magnetic, MotionProvider
│  ├─ sections/                  # hero, releases, about, subscribe, footer
│  └─ ui/                        # shadcn primitives
├─ data/
│  └─ releases.ts                # THE releases — one object per record
└─ lib/
   ├─ site.ts                    # all copy
   ├─ art.ts                     # artwork set, hero piece, portrait
   └─ newsletter/kit.ts          # the only mailing-list provider code
```
