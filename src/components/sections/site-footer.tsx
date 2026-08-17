import { Action } from "@/components/block";
import { Reveal } from "@/components/motion/reveal";
import { site } from "@/lib/site";

/** Monochrome close. Social links come from `site.socials` — add slots there as they exist. */
export function SiteFooter() {
  return (
    <footer className="relative w-full border-t border-border pb-12">
      <div className="rail-clear">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal blur={false} y={10} className="pt-10">
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="text-center sm:text-left">
              <p className="text-lg font-semibold tracking-[-0.03em]">{site.artist}</p>
              <p className="mt-2 font-ui text-[0.64rem] tracking-[0.18em] text-muted-foreground uppercase">
                {site.footer.note}
              </p>
              {/* Real address, not lowercased by the uppercase styling above —
                  an email that reads back wrong is worse than no email. */}
              <a
                href={`mailto:${site.footer.email}`}
                className="group relative mt-2 inline-block text-[0.9rem] text-foreground/90 transition-colors hover:text-foreground"
              >
                {site.footer.email}
                <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-100 bg-magenta/60 transition-colors duration-500 group-hover:bg-magenta" />
              </a>
            </div>

            <nav aria-label="Social links">
              <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
                {site.socials.map((social) => (
                  <li key={social.label}>
                    <Action
                      href={social.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-[0.66rem] text-muted-foreground hover:text-foreground"
                    >
                      {social.label}
                    </Action>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </Reveal>

        <p className="mt-12 text-center font-ui text-[0.58rem] tracking-[0.22em] text-muted-foreground/45 uppercase">
          © {new Date().getFullYear()} {site.artist}
        </p>
      </div>
      </div>
    </footer>
  );
}
