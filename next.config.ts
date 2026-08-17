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
};

export default nextConfig;
