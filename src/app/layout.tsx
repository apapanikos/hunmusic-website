import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Geist, Michroma } from "next/font/google";

import { Grain } from "@/components/atmosphere/grain";
import { MotionProvider } from "@/components/motion/motion-provider";
import { heroPiece, wordmarkArtwork } from "@/lib/art";
import { site } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

/**
 * Display face for the block titles (IKIGAI, LISTEN, …) — tall, condensed,
 * uppercase-only, one weight, tiny payload. The lowercase `hun` wordmark
 * deliberately stays in Geist: it's the brand mark, not a section title.
 */
const bebas = Bebas_Neue({ variable: "--font-bebas", subsets: ["latin"], weight: "400" });

/**
 * UI chrome face — nav, actions, index labels. A squarish Eurostile-descended
 * techno sans: flat terminals, generous counters, engineered rather than
 * neutral. Body copy stays Geist; this one is for short uppercase runs only,
 * where its width reads as deliberate instead of exhausting.
 *
 * Single weight (400), which is why chrome sets no font-weight.
 */
const michroma = Michroma({ variable: "--font-michroma", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: `${site.artist} — ${site.tagline.join(", ")}`,
  description: site.description,
  openGraph: {
    title: site.artist,
    description: site.description,
    url: site.url,
    siteName: site.artist,
    type: "profile",
    images: [{ url: heroPiece.src }],
  },
  twitter: {
    card: "summary_large_image",
    title: site.artist,
    description: site.description,
    images: [heroPiece.src],
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0d",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${bebas.variable} ${michroma.variable} h-full antialiased`}
    >
      {/*
        The wordmark's artwork is drawn as an SVG <image> inside a clipPath, so
        next/image never sees it — and it's the LCP element. Preload explicitly.
      */}
      <link rel="preload" as="image" href={wordmarkArtwork.src} fetchPriority="high" />
      <body className="flex min-h-full flex-col overflow-x-hidden">
        <Grain />
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
