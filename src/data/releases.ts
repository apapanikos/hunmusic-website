/**
 * THE RELEASES. This is the file you edit to put a new track on the page.
 *
 * Adding one:
 *
 *   1. drop the cover in `public/covers/` named by slug (`my-song.jpg`);
 *   2. copy an entry below, fill it in (keep `slug` as the FIRST key and `title`
 *      after it — the title baker parses this file with a regex, see note on
 *      `slug`);
 *   3. run `npm run generate:titles` so the display title gets its wave.
 *
 * Order in the array doesn't matter: `releases` sorts newest-first — anything
 * upcoming without a year leads, then by year descending, ties keeping file
 * order. Paste a new entry wherever it's convenient.
 *
 * Blocks deliberately carry no player and no play count. One action each, out
 * to the release's own smart link, where the fan picks their platform — the
 * page stays editorial and doesn't turn into a dashboard of other people's
 * chrome. (The one exception is `embedUrl`; see below.)
 */

export type Release = {
  /**
   * Stable id. Becomes the block's anchor (`#unwriteme`), the key of its baked
   * warped title (`release-unwriteme` in src/lib/warped-titles.ts) and the
   * cover's filename.
   *
   * Keep it as the first key in the object: scripts/generate-warped-titles.mjs
   * and scripts/check-titles.mjs read this file as text and pair each `slug`
   * with the `title` that follows it.
   */
  slug: string;
  /** Drawn oversized as the block's display title. Uppercase in Bebas. */
  title: string;
  status: "released" | "upcoming";
  /**
   * Release year, or null when nothing is announced — which renders as
   * "Coming soon". Also the sort key.
   */
  year: number | null;
  /** Runtime, `m:ss`. Shown beside the year. Omit if it isn't known. */
  duration?: string;
  /**
   * The per-release smart link — the landing page where the fan chooses
   * Spotify / Apple Music / SoundCloud / YouTube. Linkfire, Feature.fm,
   * Songwhip, Hyperfollow, tr.ee: whichever service, one URL.
   *
   * This is the block's ONLY primary action, deliberately. Empty string = no
   * link yet: the block then falls back to "+ Notify me" (upcoming) or hides
   * the action (released), rather than shipping a link to nowhere.
   */
  smartLink: string;
  /**
   * Direct Spotify link. RECORDED, NOT RENDERED — kept here as the canonical id
   * for the track, for anything that might need it later (structured data, a
   * press kit). Nothing on the page links to it: `smartLink` already lands on a
   * page listing every platform, so a Spotify link beside it would only make
   * the choice for people who use something else.
   */
  spotifyUrl?: string;
  /**
   * Path under /public. Verified at build time by `npm run check:art`.
   *
   * Served locally rather than hotlinked from Spotify's CDN (`i.scdn.co`): that
   * host is for Spotify's own clients, sets its own cache and CORS rules, and
   * can change or drop an image URL when a release is re-delivered. Local files
   * also go through `next/image` without whitelisting a remote host.
   */
  artworkSrc: string;
  /** The artwork is the block — describe it, don't label it "cover art". */
  artworkAlt: string;
  /**
   * CSS object-position. Only bites when a piece isn't square: the frame is
   * square so real covers show uncropped, type and all.
   */
  focus?: string;
  /**
   * The colour this block hands the glass rail as it scrolls through — sampled
   * from the cover itself (most chromatic pixel, weighted by brightness), not
   * picked by feel.
   */
  accent: string;
  tagline?: string;
  description?: string;
  /**
   * OPTIONAL, and off unless set: an inline Spotify or SoundCloud embed on the
   * FEATURED (top) block only. Every other block ignores it. Set it only when a
   * release is worth the third-party chrome — the smart link is the default.
   */
  embedUrl?: string;
};

const RELEASES: readonly Release[] = [
  {
    slug: "ikigai",
    title: "IKIGAI",
    status: "upcoming",
    year: null,
    // Upcoming and unlinked — the block shows "+ Notify me" instead. Paste the
    // pre-save / smart link here the moment it exists and it becomes "+ Listen".
    smartLink: "", // TODO: pre-save link, then the smart link on release day
    // ▼ Swap for the final cover when it lands.
    artworkSrc: "/art/ikigai-cover.jpg",
    artworkAlt:
      "Cover artwork for IKIGAI: a rainbow gradient sweeping through black voids and pools of near-white light.",
    focus: "50% 50%",
    // The one accent NOT sampled from its cover: magenta is the page's own
    // identity colour (selection, footer rule), and IKIGAI is the page's record.
    accent: "#FF3DA5",
    tagline: "the reason you keep going",
    description:
      "IKIGAI — the quiet overlap between what you love, what you're good at, and what the world needs. Ambient light stretched over a future-bass skeleton, breaking into a melodic dubstep surge. Vocals run through the whole of it, crystallised into glassy shards in the quiet passages and torn into something gnarlier as it builds. A search, set to sound.",
  },
  {
    slug: "unwriteme",
    title: "unwriteme",
    status: "released",
    year: 2026,
    duration: "4:37",
    smartLink: "https://tr.ee/iE_Iqv2PDG",
    spotifyUrl: "https://open.spotify.com/track/3ijZKh1rJXHlh9WYvsCLYJ",
    artworkSrc: "/covers/unwriteme.jpg",
    artworkAlt:
      "Cover for unwriteme: a scan-lined, glitched swirl in mint and pink, the title set small at the bottom left.",
    accent: "#78B9B5",
    description:
      "A song about rethinking life's obstacles and reimagining the way we see life, carried through emotion rather than narrative — built around a repetitive, intense main vocal loop FX that holds the tension, before a final outro drop breaks away from the rest of the track and releases it.",
  },
  {
    slug: "get-you-tough-get-you-tender",
    title: "Get you Tough. Get you Tender",
    status: "released",
    year: 2021,
    duration: "4:16",
    smartLink: "https://tr.ee/uyok_c85iP",
    spotifyUrl: "https://open.spotify.com/track/0B4OYDHALPtTCzTprcpXE4",
    artworkSrc: "/covers/get-you-tough-get-you-tender.jpg",
    artworkAlt:
      "Cover for Get you Tough. Get you Tender: a tall panel of pale iridescent light on near-black, the title set twice — once solid, once ghosted beneath it.",
    accent: "#A6D9F9",
    description:
      "Parallel synth layers and grooves move in tandem, dressed in ear candy throughout, anchored by a simple, looping vocal FX motif.",
  },
  {
    slug: "thisaugust",
    title: "Thisaugust",
    status: "released",
    year: 2020,
    duration: "3:46",
    smartLink: "https://tr.ee/tgChztEdSE",
    spotifyUrl: "https://open.spotify.com/track/266xqRsgBvXQkAy7fSwklj",
    artworkSrc: "/covers/thisaugust.jpg",
    artworkAlt:
      "Cover for Thisaugust: dense smeared reds and corals shot through with teal, like paint dragged across glass.",
    accent: "#CF222D",
    description:
      "Set in the same sonic world as Ofyouandme., but pushed further — more tension threaded through the arrangement, with tempo and mood shifting underneath the listener as the track unfolds.",
  },
  {
    slug: "ofyouandme",
    title: "Ofyouandme.",
    status: "released",
    year: 2020,
    duration: "3:56",
    smartLink: "https://tr.ee/bfls0rlo-6",
    spotifyUrl: "https://open.spotify.com/track/7bbesP3nGc3zO8Ne38kblF",
    artworkSrc: "/covers/ofyouandme.jpg",
    artworkAlt:
      "Cover for Ofyouandme.: turquoise and magenta paint strokes over black, swelling into orange down the right side.",
    accent: "#1DCAB1",
    description:
      "Melodic synths and lead lines drift over syncopated drum grooves, opening into ambient breaks with layered vocal FX — a track that moves between tension and release without ever settling.",
  },
];

/** Sort key: unannounced-upcoming first, then newest year down. */
function rank(release: Release): number {
  return release.year ?? Number.POSITIVE_INFINITY;
}

/**
 * The stack, newest first. Copied before sorting so the source array stays as
 * written; `Array.prototype.sort` is stable, so entries sharing a year hold
 * their file order (which is what keeps Thisaugust above Ofyouandme.).
 */
export const releases: readonly Release[] = [...RELEASES].sort((a, b) => rank(b) - rank(a));

/**
 * The block's meta line: "2026 · 4:37", "2020", or "Coming soon".
 *
 * A year rather than a full date — that's the granularity a discography needs,
 * and it sidesteps the timezone trap where a bare ISO date renders as the
 * previous day west of Greenwich.
 */
export function releaseMeta(release: Release): string {
  const year = release.year === null ? "Coming soon" : String(release.year);
  return release.duration ? `${year} · ${release.duration}` : year;
}

