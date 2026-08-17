/**
 * Fails the build if a display title in src/lib/site.ts no longer matches the
 * baked path in src/lib/warped-titles.ts.
 *
 * The wavy titles are pre-warped vector outlines, so changing the copy without
 * regenerating would silently ship the OLD word — the page would say one thing
 * in the DOM's aria-label and draw another. This turns that into a build error.
 *
 * Song titles aren't checked here because they aren't baked: release blocks set
 * them in live Bebas, so the DOM and the drawing can't disagree.
 *
 * Fix by running: npm run generate:titles
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const site = readFileSync(join(root, "src/lib/site.ts"), "utf8");
const baked = readFileSync(join(root, "src/lib/warped-titles.ts"), "utf8");

/** Which site.ts value each fixed baked key must equal. */
const PAIRS = [
  { key: "releases", label: "site.releases.title", re: /releases:\s*\{[\s\S]*?title:\s*"([^"]+)"/ },
  { key: "stayInTheLoop", label: "site.subscribe.title", re: /subscribe:\s*\{[\s\S]*?title:\s*"([^"]+)"/ },
  { key: "hun", label: "site.artist", re: /artist:\s*"([^"]+)"/ },
];

/** The text the baked path actually draws, or undefined if there's no bake. */
function bakedText(key) {
  return baked.match(new RegExp(`"?${key}"?:\\s*\\{\\s*text:\\s*"([^"]+)"`))?.[1];
}

const problems = [];

for (const { key, label, re } of PAIRS) {
  const want = site.match(re)?.[1];
  if (!want) {
    problems.push(`could not read ${label} from site.ts — did the shape change?`);
    continue;
  }
  const got = bakedText(key);
  if (!got) {
    problems.push(`no baked title for "${key}" — run: npm run generate:titles`);
    continue;
  }
  // Bebas is uppercase-only, so the baked text is the upper-cased copy.
  if (got !== want && got !== want.toUpperCase()) {
    problems.push(`${label} is "${want}" but the baked path draws "${got}" — run: npm run generate:titles`);
  }
}

if (problems.length > 0) {
  console.error("\ncheck-titles failed:\n" + problems.map((p) => `  • ${p}`).join("\n") + "\n");
  process.exit(1);
}

console.log(`check-titles: ${PAIRS.length} display title(s) in sync`);
