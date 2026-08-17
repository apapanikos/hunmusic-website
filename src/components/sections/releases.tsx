import Image from "next/image";

import { ActionChip, actionChipClass } from "@/components/block";
import { StickyTitle } from "@/components/block-title";
import { Reveal } from "@/components/motion/reveal";
import { NotifyButton } from "@/components/sections/notify-button";
import { hasListenableRelease, releaseMeta, releases, type Release } from "@/data/releases";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * RELEASES — a vertical stack of image-forward blocks, one per record.
 *
 * This replaced the pair of embedded players. Embeds put two competing pieces
 * of third-party chrome, and two other brands' colours, in the middle of a page
 * whose whole argument is hun's own artwork. A block per release with a single
 * way out — the release's smart link, where the fan picks their own platform —
 * keeps the page editorial and the artwork the loudest thing on it. No players,
 * no play counts: that's the point, not an omission.
 *
 * Everything per-release lives in src/data/releases.ts. This file only knows how
 * to draw one.
 *
 * The section owns ONE sticky title bar for the whole stack. Per-block titles
 * are in-flow instead, and alternate sides — which is also why they can't be
 * sticky: the pinned bar is anchored right by design, and a stack of six of
 * them would fight each other at every seam.
 */
export function Releases() {
  return (
    <section
      id="releases"
      className="relative w-full scroll-mt-14 border-t border-border lg:scroll-mt-0"
    >
      <StickyTitle
        index="01"
        label={site.releases.eyebrow}
        title="releases"
        height="clamp(2.5rem, 6.5vw, 5.5rem)"
      />

      {/* The intro carries the section's fallback accent, so the rail has
          something to reflect in the gap between the hero and the first block.
          It's a short element and the observer scores by visible height, so any
          real block outranks it the moment one is on screen. */}
      <div className="rail-clear" data-accent={site.accents.releases} data-nav-target="#releases">
        <div className="mx-auto max-w-6xl px-6 pt-8">
          <Reveal blur={false} className="mt-2">
            <p className="max-w-xl text-[0.95rem] leading-relaxed text-muted-foreground">
              {hasListenableRelease ? site.releases.body : site.releases.bodyUpcomingOnly}
            </p>
          </Reveal>
        </div>
      </div>

      <div className="mt-12 sm:mt-16">
        {releases.map((release, index) => (
          <ReleaseBlock key={release.slug} release={release} index={index} featured={index === 0} />
        ))}
      </div>
    </section>
  );
}

type ReleaseBlockProps = {
  release: Release;
  index: number;
  /** Only the top block honours `embedUrl`. */
  featured: boolean;
};

/**
 * One release.
 *
 * Desktop is a 12-column grid with the artwork and the text deliberately
 * OVERLAPPING — artwork on columns 5–12, text on 1–7 (mirrored on even blocks),
 * both on row 1. The oversized title runs off onto the cover instead of sitting
 * politely beside it, which is what stops a stack of these reading as a
 * repeating template.
 *
 * Mobile drops the alternation entirely: artwork full-bleed on top, title and
 * action below, every block identical. Alternating on a single column would
 * only produce ragged right-aligned text with nothing to balance it.
 *
 * `data-accent` is what the left glass rail reflects while this block is the
 * one filling the viewport; `data-nav-target` keeps the nav's "Releases" item
 * lit across the whole stack rather than blanking on a block-level id. See
 * site-nav.tsx.
 */
function ReleaseBlock({ release, index, featured }: ReleaseBlockProps) {
  // Odd blocks (1st, 3rd, …) carry the title on the left, even on the right.
  const titleSide = index % 2 === 0 ? "left" : "right";
  const right = titleSide === "right";

  const statusLabel =
    release.status === "upcoming" ? site.releases.upcomingLabel : site.releases.outNowLabel;
  const embedUrl = featured ? release.embedUrl : undefined;

  return (
    <article
      id={release.slug}
      data-accent={release.accent}
      data-nav-target="#releases"
      className="relative scroll-mt-14 border-t border-border py-14 first:border-t-0 first:pt-0 sm:py-20 lg:scroll-mt-0"
    >
      {/* items-start, not items-center: the text column is much shorter than a
          square sleeve now that the catalogue carries no paragraph, and centred
          it floated in the middle of the cover with no relationship to it. Top
          alignment gives every block one shared horizontal — sleeve top, status
          label, title — however tall the copy beside it runs. */}
      <div className="relative w-full px-6 lg:grid lg:grid-cols-12 lg:items-start">
        {/* ── ARTWORK ── bleeds to the viewport edge on its side, and under the
            rail text when that's the left one — the rail sits over artwork
            everywhere else on the page too.

            Square at every size, and not by default: these are real sleeves
            with the title and hun's mark set into the bottom-left corner, so a
            wider frame would crop the artist's own typography off the piece. */}
        <div
          className={cn(
            "relative -mx-6 aspect-square overflow-hidden lg:col-span-8 lg:row-start-1 lg:mx-0",
            right ? "lg:col-start-1 lg:-ml-6" : "lg:col-start-5 lg:-mr-6"
          )}
        >
          <Image
            src={release.artworkSrc}
            alt={release.artworkAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 68vw"
            className="object-cover"
            style={{
              objectPosition: release.focus ?? "50% 50%",
              // Only the featured block drifts. Every cover breathing at once
              // would be motion for its own sake, and six animated full-bleed
              // images is a real cost on a laptop.
              animation: featured ? "cover-drift 40s ease-in-out infinite" : undefined,
            }}
          />

          {/* The calm zone the title and copy sit on — desktop only, since on
              mobile nothing overlaps the artwork.

              The mid stops are heavier than they look like they need to be, and
              that's measured, not taste: an oversized title crossing the cream
              highlight on the Thisaugust sleeve landed at ~2.8:1 against white
              with the old 0.55 stop, under the 3:1 that AA asks of large text.
              At 0.72 the same spot is ~4.2:1, and the far side of the cover is
              still untouched. */}
          <div
            aria-hidden
            className="absolute inset-0 hidden lg:block"
            style={{
              background: `linear-gradient(to ${right ? "left" : "right"}, rgb(11 11 13 / 0.94) 0%, rgb(11 11 13 / 0.72) 32%, rgb(11 11 13 / 0.3) 58%, transparent 80%)`,
            }}
          />
        </div>

        {/* ── TEXT ── */}
        <div
          className={cn(
            // --title-max-w caps how far a title may run: nearly the full
            // column on a phone, two thirds of the viewport on desktop, where
            // overrunning onto the cover is the point.
            "relative z-10 mt-8 [--title-max-w:84vw] lg:row-start-1 lg:col-span-7 lg:mt-0 lg:[--title-max-w:64vw]",
            right
              ? "lg:col-start-6 lg:pl-8 lg:text-right"
              : // pl-16 clears the desktop rail.
                "lg:col-start-1 lg:pr-8 lg:pl-16"
          )}
        >
          <Reveal blur={false} y={16}>
            {/* Status only, no index. The blocks sit UNDER the section's own
                "01 — RELEASES" bar, and a second 01/02 series inside it reads
                as a contradiction rather than as a track listing. */}
            <p className="block-index frost-text text-foreground/80">{statusLabel}</p>

            {/*
              Live Bebas, NOT one of the baked wavy outlines.

              The wave stays on the section headings and the wordmark, where it's
              identity; a song title is information, and warping four of them in
              a row turned reading the discography into work. Bebas at this size
              is still the loudest thing in the block.

              Live type also wraps, which is what makes a 29-character title
              possible at all — the baked outlines were single-line vectors and
              had to shrink to fit. The box is wider than the text column on
              purpose: the title still runs onto the cover.
            */}
            <h3
              className={cn(
                "block-title mt-4 text-[clamp(3rem,10vw,8.5rem)] text-foreground",
                right && "ml-auto text-right"
              )}
              style={{
                maxWidth: "var(--title-max-w)",
                // Sits partly on artwork; keeps the edge readable over a
                // near-white pool as well as a void.
                textShadow: "0 2px 16px rgb(0 0 0 / 0.75)",
              }}
            >
              {release.title}
            </h3>

            {release.tagline ? (
              <p
                className={cn(
                  "frost-text mt-5 max-w-md text-[clamp(1rem,2vw,1.3rem)] leading-snug text-foreground/85",
                  right && "lg:ml-auto"
                )}
              >
                {release.tagline}
              </p>
            ) : null}

            {release.description && !release.hideDescription ? (
              <p
                className={cn(
                  "frost-text mt-4 max-w-md text-[0.92rem] leading-relaxed text-foreground/70",
                  // Flush RIGHT as a block, but set left-aligned inside it: a
                  // one-line tagline reads fine right-aligned, five lines of
                  // ragged-left body copy do not.
                  right && "lg:ml-auto lg:text-left"
                )}
              >
                {release.description}
              </p>
            ) : null}

            <div
              className={cn(
                "mt-8 flex flex-wrap items-center gap-x-8 gap-y-4",
                right && "lg:justify-end"
              )}
            >
              <ReleaseAction release={release} />

              {/* No per-platform links beside it, deliberately: the smart link
                  IS the platform picker, and a Spotify link next to it just
                  pre-empts that choice for everyone who uses something else. */}
              <p className="frost-text font-ui text-[0.66rem] tracking-[0.24em] text-foreground/60 uppercase">
                {releaseMeta(release)}
              </p>
            </div>
          </Reveal>
        </div>
      </div>

      {embedUrl ? (
        <div className="rail-clear">
          <div className="mx-auto mt-10 max-w-3xl px-6">
            <Reveal delay={0.1} y={18}>
              <EmbedPanel title={release.title} src={embedUrl} />
            </Reveal>
          </div>
        </div>
      ) : null}
    </article>
  );
}

/**
 * The block's one action.
 *
 * Anything upcoming sends people to the existing mailing-list form rather than
 * to a link that doesn't exist yet — one form on the page, never two. Anything
 * released goes out to its smart link, in a new tab: that page is a hand-off to
 * Spotify / Apple / SoundCloud, and taking the site's tab with it would strand
 * anyone who wanted to come back.
 *
 * A released track with no smart link yet renders no action at all — better a
 * quiet block than a "+ Listen" that goes nowhere.
 */
function ReleaseAction({ release }: { release: Release }) {
  if (release.status === "upcoming" && !release.smartLink) {
    return <NotifyButton label={site.releases.notifyCta} className={actionChipClass} />;
  }

  if (!release.smartLink) return null;

  return (
    <ActionChip
      href={release.smartLink}
      target="_blank"
      rel="noreferrer noopener"
      // Several identical "Listen" links on one page — the accessible name has
      // to say which record each one opens.
      aria-label={`${site.releases.listenCta} to ${release.title}`}
    >
      {site.releases.listenCta}
    </ActionChip>
  );
}

/**
 * OPTIONAL inline player for the featured block — off unless that release sets
 * `embedUrl`. Kept deliberately plain: an embed brings its own colour and
 * chrome, so it gets a neutral frame rather than the full-bleed treatment.
 *
 * Lazy-loaded; a third-party player is a few hundred KB and this is well below
 * the fold. `color-scheme: dark` is set on the wrapper so the frame doesn't
 * paint a white document canvas behind a player that hasn't loaded yet.
 */
function EmbedPanel({ title, src }: { title: string; src: string }) {
  return (
    <div className="glass overflow-hidden rounded-xl" style={{ colorScheme: "dark" }}>
      <iframe
        src={src}
        title={`${title} player`}
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        className="block h-[400px] w-full border-0"
      />
    </div>
  );
}
