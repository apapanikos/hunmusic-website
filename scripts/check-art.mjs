/**
 * Fails the build if any artwork or video path referenced in src/lib/art.ts or
 * src/data/releases.ts is missing from public/, or differs from the real
 * filename in case.
 *
 * macOS is case-insensitive, Vercel builds on case-sensitive Linux. A file
 * saved as `About-Photo.JPG` and referenced as `about-photo.jpg` works
 * perfectly on a Mac and 404s the moment it deploys. This turns that into a
 * build failure locally instead of a broken image in production.
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
/** Every file that names an asset: the art set, and the release covers. */
const sourceFiles = ["src/lib/art.ts", "src/data/releases.ts"];
const publicDir = join(root, "public");

const source = sourceFiles.map((file) => readFileSync(join(root, file), "utf8")).join("\n");
// Every "/..." string literal that looks like an asset path.
const referenced = [...source.matchAll(/["'](\/[^"']+\.(?:jpg|jpeg|png|webp|avif|mp4|webm))["']/gi)].map(
  (m) => m[1]
);

if (referenced.length === 0) {
  console.error(`check-art: no artwork paths found in ${sourceFiles.join(" or ")} — did the format change?`);
  process.exit(1);
}

const problems = [];

for (const ref of new Set(referenced)) {
  const onDisk = join(publicDir, ref);

  if (!existsSync(onDisk)) {
    problems.push(`missing: public${ref}`);
    continue;
  }

  // existsSync is case-insensitive on macOS, so compare against the real
  // directory listing to catch a case mismatch that would break on Linux.
  const actual = readdirSync(dirname(onDisk));
  const want = basename(ref);
  if (!actual.includes(want)) {
    const near = actual.find((f) => f.toLowerCase() === want.toLowerCase());
    problems.push(
      near
        ? `case mismatch: referenced "${want}" but the file is "${near}" — this breaks on Vercel`
        : `missing: public${ref}`
    );
  }
}

if (problems.length > 0) {
  console.error("\ncheck-art failed:\n" + problems.map((p) => `  • ${p}`).join("\n") + "\n");
  process.exit(1);
}

console.log(`check-art: ${new Set(referenced).size} artwork path(s) OK`);
