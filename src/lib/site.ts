/**
 * Every piece of user-facing copy on the page lives here.
 *
 * This is an artist home, not a release campaign — there's no record to count
 * down to, so nothing here should imply one. The mailing list is a standing
 * "tell me when there's new music", not a waitlist for a specific thing.
 */

export const site = {
  artist: "hun",
  /**
   * Shown under the wordmark. Two lines, lowercase to sit with the mark.
   * This is hun's own line — it says more in five words than a description of
   * the genre would, and it's already the voice used elsewhere.
   */
  tagline: ["synthetic feelings", "noise from the in-between"],
  /**
   * The canonical origin. `metadataBase` in layout.tsx builds every absolute
   * URL from it — og:url, og:image, twitter:image — so a wrong value here is
   * silent: the page looks fine and its link previews render blank.
   */
  url: "https://hunmusic.com",
  description: "hun — synthetic feelings, noise from the in-between. New music, occasionally, in your inbox.",

  /**
   * The filter-nav. Anchors, not routes — every item scrolls to a block on
   * this one page. Labels render in small caps; the active item gains the
   * "+" prefix (see SiteNav).
   */
  nav: [
    { label: "Releases", href: "#releases" },
    { label: "About", href: "#about" },
    { label: "Signup", href: "#subscribe" },
  ],

  /**
   * The accent the glass rail reflects per section — assigned, not sampled at
   * runtime: deterministic, free, and every value is already sampled from the
   * artwork (they're the palette tokens). `subscribe` is deliberately the
   * neutral: it's the one block with no artwork, so the glass clears.
   *
   * The releases stack doesn't appear here — each release block carries its own
   * accent (see src/data/releases.ts), which is the whole point of a stack of
   * different covers. `releases` below is only the fallback for the section's
   * own title bar, before the first block is on screen.
   */
  accents: {
    top: "#2B5CE6",
    releases: "#FF3DA5",
    about: "#F5254E",
    subscribe: "#ECEEF2",
  } as Record<string, string>,

  hero: {
    cta: "Stay in the loop",
    ctaSecondary: "Listen",
  },

  /**
   * The releases stack — the block that replaced the embedded players.
   *
   * Only the section's own chrome lives here. Everything per-release (titles,
   * artwork, dates, smart links) is in src/data/releases.ts, which is the one
   * file to edit when a new track lands.
   */
  releases: {
    eyebrow: "Releases",
    title: "Releases",
    body: "Each one opens where you already listen — Spotify, Apple Music, SoundCloud, wherever.",
    /**
     * Shown instead while nothing listenable is on the page — currently the
     * case, with the back catalogue behind the `hidden` flag in
     * src/data/releases.ts. Swapped automatically, not by hand.
     */
    bodyUpcomingOnly: "What's next, first. The mailing list is where it lands.",
    /** The action on every released block. The "+" is added by the chip. */
    listenCta: "Listen",
    /** Shown instead on anything upcoming — scrolls to the mailing list. */
    notifyCta: "Notify me",
    /** Small status labels in each block's corner. */
    outNowLabel: "Out now",
    upcomingLabel: "Upcoming",
  },

  about: {
    eyebrow: "About",
    /** The block's one action. */
    followUrl: "https://www.instagram.com/hun.sounds/",
    followLabel: "Instagram",
    title: "hun",
    body: [
      "hun works in soft-edged synths and patient arrangements — a low end that arrives once you've stopped waiting for it.",
      "Drums lean textural over rhythmic, grooves left loose at the edges; vocals arrive in layers, folded and blurred until they sit closer to atmosphere than lyric.",
      "Mostly written before the building's fully awake.",
    ],
  },

  subscribe: {
    eyebrow: "Mailing list",
    title: "Stay in the loop",
    body: "Get notified when there's new music. No schedule, no noise — just an email when something's out.",
    placeholder: "you@somewhere.com",
    cta: "Notify me",
    contactLabel: "Contact",
    confirmation: {
      title: "You're in.",
      body: "You'll hear from me when there's something worth sending.",
    },
    duplicate: {
      title: "Already on the list.",
      body: "Nothing more to do — you're set.",
    },
  },

  socials: [
    { label: "Spotify", href: "https://open.spotify.com/artist/4HaH4B6L3IRZo5hBv2cu0l" },
    { label: "SoundCloud", href: "https://soundcloud.com/hunvibes" },
    { label: "Instagram", href: "https://www.instagram.com/hun.sounds/" },
    // Slots for more — add Bandcamp, YouTube, Apple Music here as they exist.
  ],

  footer: {
    note: "Contact & bookings",
    email: "iamhunmusic@gmail.com",
  },
} as const;

export type Site = typeof site;
