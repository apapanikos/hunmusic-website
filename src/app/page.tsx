import { ScrollProgress } from "@/components/scroll-progress";
import { SiteNav } from "@/components/site-nav";
import { About } from "@/components/sections/about";
import { Hero } from "@/components/sections/hero";
import { Releases } from "@/components/sections/releases";
import { SiteFooter } from "@/components/sections/site-footer";
import { Subscribe } from "@/components/sections/waitlist";

/**
 * One page, stacked full-bleed blocks, hard hairline seams. The filter-nav on
 * top scrolls to blocks — no routes. Section ids are stable (#top #releases
 * #about #subscribe): the nav, the skip link and the notify buttons all anchor
 * to them. Each release inside #releases also has its own id (its slug), so a
 * single record can be linked to directly.
 */
export default function Page() {
  return (
    <>
      <ScrollProgress />
      <SiteNav />
      <a
        href="#subscribe"
        className="sr-only focus:not-sr-only focus:fixed focus:top-16 focus:left-4 focus:z-[80] focus:bg-foreground focus:px-5 focus:py-2 focus:text-sm focus:text-background"
      >
        Skip to mailing list
      </a>

      <main className="flex flex-1 flex-col">
        <Hero />
        <Releases />
        <About />
        <Subscribe />
      </main>

      <SiteFooter />
    </>
  );
}
