import Image from "next/image";

import { Action } from "@/components/block";
import { StickyTitle } from "@/components/block-title";
import { Reveal } from "@/components/motion/reveal";
import { portrait } from "@/lib/art";
import { site } from "@/lib/site";

/**
 * About: copy on black, portrait bleeding off the edge.
 *
 * Not a centred headshot. The image runs off the left of the viewport and is
 * masked so its right and bottom edges dissolve into the page black — it reads
 * as something the page is standing in front of rather than a framed photo.
 *
 * The portrait is shown untouched — its blue and red are already the page's
 * palette, see the note on `portrait` in lib/art.ts. The only thing on it is the
 * shared global grain, which lands from the page-level layer like everything else.
 *
 * One action for the block: + Instagram.
 */
export function About() {
  return (
    // No overflow-hidden here — it would break the sticky title. Horizontal
    // overflow from the portrait bleed is backstopped by body's overflow-x-hidden.
    <section
      id="about"
      data-accent={site.accents.about}
      className="relative w-full scroll-mt-14 border-t border-border pb-20 sm:pb-24 lg:scroll-mt-0"
    >
      {/* The lowercase brand mark, warped from Geist rather than Bebas — the
          display face has no lowercase and would set the name as "HUN". */}
      <StickyTitle index="02" label={site.about.eyebrow} title="hun" height="clamp(2.75rem, 7.5vw, 6rem)" />

      <div className="rail-clear">
      <div className="mx-auto mt-10 grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-20 lg:px-0">
        {/* Runs off the left edge at every size — the negative margin cancels the
            section padding on small screens so it never becomes a boxed photo. */}
        <Reveal y={24} className="-ml-6 lg:-ml-[8vw]">
          <div className="relative aspect-[10/11] w-[86%] max-w-md lg:w-full lg:max-w-none">
            <Image
              src={portrait.src}
              alt={portrait.alt}
              fill
              sizes="(max-width: 1024px) 90vw, 40vw"
              className="object-cover object-top"
              style={{
                // Dissolve into the background instead of ending on a hard edge.
                maskImage:
                  "linear-gradient(to right, black 55%, transparent 100%), linear-gradient(to bottom, black 60%, transparent 100%)",
                maskComposite: "intersect",
                WebkitMaskImage:
                  "linear-gradient(to right, black 55%, transparent 100%), linear-gradient(to bottom, black 60%, transparent 100%)",
                WebkitMaskComposite: "source-in",
              }}
            />
          </div>
        </Reveal>

        <div className="lg:pr-6">
          <div className="space-y-5">
            {site.about.body.map((paragraph, index) => (
              <Reveal key={paragraph} delay={0.1 + index * 0.06} blur={false}>
                <p className="max-w-prose text-[0.95rem] leading-relaxed text-muted-foreground">
                  {paragraph}
                </p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.28} blur={false} y={10} className="mt-10">
            <Action href={site.about.followUrl} target="_blank" rel="noreferrer noopener">
              {site.about.followLabel}
            </Action>
          </Reveal>
        </div>
      </div>
      </div>
    </section>
  );
}
