"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * The nav, twice from one state: bare rotated text down the left edge on
 * desktop (Skrillex-style — no panel, no background, just type on the page),
 * and a glass top bar on mobile. Anchors, not routes — smooth scrolling is the
 * global CSS `scroll-behavior` (which reduced motion flips to instant), so JS
 * here does exactly two jobs:
 *
 *  1. an IntersectionObserver tracks the active block — the active item gets
 *     the "+" prefix plus `aria-current`, with the "+" space reserved so
 *     nothing shifts;
 *  2. the active block picks the accent the edge reflects. With the glass
 *     panel gone, the reflection lives in the active item's "+" and a soft
 *     text glow — one animated CSS variable (`--rail-accent`, 1.6s ease),
 *     consumed statically. A colour crossfade is non-vestibular, so it runs
 *     under reduced motion too.
 *
 * What it observes is every `[data-accent]` element, and it reads the colour
 * straight off the attribute. That used to be a lookup from the element's id
 * into `site.accents`, which assumed one accent per nav section — no longer
 * true now that the releases stack is several blocks, each contributing its own
 * artwork's colour while sharing one nav item. An element may name that item
 * with `data-nav-target`; without it, its own id is used.
 *
 * Reading order mirrors the reference: items run down the edge in page order
 * with the brand at the bottom; each label is `writing-mode: vertical-rl`
 * rotated 180°, so the text reads bottom-to-top along the edge.
 *
 * z-[70]: above the hero content (z-60) so the links stay clickable over the
 * full-bleed blocks. Text over artwork carries `frost-text` for edge contrast.
 */
export function SiteNav() {
  const [active, setActive] = useState<string>("#top");
  const [accent, setAccent] = useState<string>(site.accents.top);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const blocks = Array.from(document.querySelectorAll<HTMLElement>("[data-accent]"));

    const observer = new IntersectionObserver(
      (entries) => {
        // Of the blocks on screen, the one covering the most viewport wins —
        // plain "last intersecting" flickers between two blocks at the seam.
        //
        // Scored by visible HEIGHT, not by intersectionRatio: ratio is relative
        // to each element's own size, so a short block fully in view (1.0)
        // outranks a tall one filling most of the screen (0.6). That never came
        // up while every block was roughly a viewport tall, and started
        // mattering the moment the releases stack mixed block heights.
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRect.height - a.intersectionRect.height);

        const block = visible[0]?.target;
        if (!(block instanceof HTMLElement)) return;

        setActive(block.dataset.navTarget ?? `#${block.id}`);
        setAccent(block.dataset.accent ?? site.accents.top);
      },
      { rootMargin: "-15% 0px -35% 0px", threshold: [0, 0.1, 0.35, 0.6] }
    );

    blocks.forEach((el) => observer.observe(el));

    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      {/* Desktop: rotated text on the page edge. No panel. */}
      <motion.nav
        aria-label="Sections"
        animate={{ "--rail-accent": accent } as Record<string, string>}
        transition={{ duration: 1.6, ease: "easeInOut" }}
        style={{ "--rail-accent": site.accents.top } as React.CSSProperties}
        className="fixed top-0 bottom-0 left-0 z-[70] hidden w-14 flex-col items-center justify-between py-6 lg:flex"
      >
        <div className="flex flex-col items-center gap-8">
          {site.nav.map((item) => {
            const isActive = active === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "rotate-180 font-ui text-[0.64rem] tracking-[0.26em] uppercase transition-colors duration-300 [writing-mode:vertical-rl]",
                  // Inactive stays brighter than the usual muted grey: these
                  // labels sit over raw artwork with no bar behind them, and
                  // grey vanished into the near-white pools.
                  isActive ? "text-foreground" : "text-foreground/65 hover:text-foreground"
                )}
                // A dark halo rather than frost-text's soft shadow — it has to
                // hold on both the white pools and the black voids.
                style={{
                  textShadow: isActive
                    ? "0 1px 5px rgb(0 0 0 / 0.9), 0 0 16px color-mix(in srgb, var(--rail-accent) 55%, transparent)"
                    : "0 1px 5px rgb(0 0 0 / 0.9), 0 0 12px rgb(0 0 0 / 0.55)",
                }}
              >
                <span
                  aria-hidden
                  className={cn("transition-opacity duration-300", isActive ? "opacity-100" : "opacity-0")}
                  style={{ color: "var(--rail-accent)", textShadow: "none" }}
                >
                  +{" "}
                </span>
                {item.label}
              </a>
            );
          })}
        </div>

        <a
          href="#top"
          className="rotate-180 text-[1rem] font-semibold tracking-[-0.02em] text-foreground [writing-mode:vertical-rl]"
          style={{ textShadow: "0 1px 5px rgb(0 0 0 / 0.9), 0 0 12px rgb(0 0 0 / 0.55)" }}
        >
          hun
        </a>
      </motion.nav>

      {/* Mobile: glass top bar, one row, horizontal-scroll fallback. */}
      <motion.header
        animate={{ "--rail-accent": accent } as Record<string, string>}
        transition={{ duration: 1.6, ease: "easeInOut" }}
        style={{ "--rail-accent": site.accents.top } as React.CSSProperties}
        className={cn(
          "glass-bar fixed inset-x-0 top-0 z-[70] transition-shadow duration-500 lg:hidden",
          !scrolled && "shadow-none"
        )}
      >
        <nav
          aria-label="Sections"
          className="flex h-14 items-center justify-between gap-3 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <a href="#top" className="shrink-0 text-[1.05rem] font-semibold tracking-[-0.03em] text-foreground">
            hun
          </a>
          <div className="flex shrink-0 items-center gap-2.5">
            {site.nav.map((item) => {
              const isActive = active === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "flex items-baseline gap-1 font-ui text-[0.53rem] tracking-[0.04em] uppercase transition-colors duration-300",
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span
                    aria-hidden
                    className={cn("transition-opacity duration-300", isActive ? "opacity-100" : "opacity-0")}
                    style={{ color: "var(--rail-accent)" }}
                  >
                    +
                  </span>
                  {item.label}
                </a>
              );
            })}
          </div>
        </nav>
      </motion.header>
    </>
  );
}
