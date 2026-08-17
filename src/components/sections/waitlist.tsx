import { Action } from "@/components/block";
import { StickyTitle } from "@/components/block-title";
import { Reveal } from "@/components/motion/reveal";
import { WaitlistForm } from "@/components/sections/waitlist-form";
import { site } from "@/lib/site";

/**
 * Signup. The one thing the page asks for, as its own bold block.
 *
 * Deliberately the only block with no artwork in it. Everything above has
 * something to look at; this one is where the page stops showing and starts
 * asking. Copy and input sit on flat black, where contrast is never in
 * question.
 *
 * The contact line lives here too — if someone scrolled this far without
 * signing up, mail is the other door.
 */
export function Subscribe() {
  return (
    <section
      id="subscribe"
      // Near-white: the one block with no artwork, so the rail clears.
      data-accent={site.accents.subscribe}
      className="relative w-full scroll-mt-14 border-t border-border pb-20 sm:pb-28 lg:scroll-mt-0"
    >
      <StickyTitle index="03" label={site.subscribe.eyebrow} title="stayInTheLoop" height="clamp(2.25rem, 5.8vw, 5rem)" />

      <div className="rail-clear relative">
        {/* Faint bloom so the glass panel has light to catch — this block has
            no artwork, and frost over flat black reads as a dead grey slab. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
          style={{
            background:
              "radial-gradient(60% 100% at 50% 0%, color-mix(in srgb, var(--blue) 7%, transparent), transparent 75%)",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="mx-auto mt-12 max-w-2xl">
            <Reveal y={16}>
              <div className="glass rounded-2xl p-7 text-center sm:p-10">
                <p className="mx-auto max-w-md text-[0.95rem] leading-relaxed text-balance text-muted-foreground">
                  {site.subscribe.body}
                </p>

                <div className="mt-8 w-full">
                  <WaitlistForm />
                </div>

                <div className="mt-10">
                  <Action href={`mailto:${site.footer.email}`}>
                    {site.subscribe.contactLabel} —{" "}
                    {/* The address escapes the uppercase styling: an email shown
                        in caps invites someone to read it back wrong. */}
                    <span className="normal-case">{site.footer.email}</span>
                  </Action>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
