import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /*
     * Local escape hatch for macOS checkouts on a non-HFS volume (an exFAT
     * external drive, say).
     *
     * On those filesystems macOS writes an AppleDouble `._<name>` sidecar
     * beside every file. Next's image optimizer lists `.next/cache/images`,
     * picks up the 4 KB sidecar instead of the real cached image, and serves it
     * with a 200 and `Content-Type: image/jpeg`. The first request (a cache
     * MISS) looks perfect; every request after it is a HIT and returns
     * undecodable bytes, so images silently turn into broken glyphs.
     *
     * Cleaning the sidecars fixes it until the next cache write, which makes it
     * recur constantly. Setting NEXT_IMAGE_UNOPTIMIZED=1 in .env.local skips
     * the optimizer — and therefore its cache — entirely.
     *
     * Deliberately opt-in and env-driven: Vercel builds on Linux, never sets
     * this, and keeps full image optimization in production.
     */
    unoptimized: process.env.NEXT_IMAGE_UNOPTIMIZED === "1",
  },

  /**
   * www → apex, permanently.
   *
   * Both hostnames are attached to the Vercel project, so without this they'd
   * each serve the whole site: two URLs for every page, splitting how search
   * engines and any shared link see it. `site.url` (and therefore every og:url)
   * names the apex, so the apex is what should answer.
   *
   * Kept here rather than in the dashboard's redirect setting so it lives in the
   * repo, where it's visible and survives a project being recreated.
   */
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.hunmusic.com" }],
        destination: "https://hunmusic.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
