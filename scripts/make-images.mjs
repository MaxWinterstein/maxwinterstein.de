// Regenerates the two raster assets that can't be SVG:
//   public/og.png               — 1200x630 social preview (a picture of the site)
//   public/apple-touch-icon.png — 180x180 iOS home-screen icon
//
// Both are committed, so this only needs re-running when the palette or the
// name/tagline in src/config.ts changes:  npm run images
//
// librsvg (inside sharp) resolves fonts through fontconfig and ignores CSS
// @font-face, so we fetch JetBrains Mono once into scripts/.fonts/ (gitignored)
// and point fontconfig at it. That keeps the output byte-identical on any
// machine instead of depending on whatever fonts happen to be installed.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { site, CANONICAL_DOMAIN } from "../src/config.ts";

const FONT_TAG = "v2.304";
const FONT_BASE = `https://cdn.jsdelivr.net/gh/JetBrains/JetBrainsMono@${FONT_TAG}/fonts/ttf`;
const FONTS = ["JetBrainsMono-Regular.ttf", "JetBrainsMono-Bold.ttf"];
const FAMILY = "JetBrains Mono";
const ADVANCE = 0.6; // JetBrains Mono advance width, in em

const fontDir = new URL("../scripts/.fonts/", import.meta.url);
await mkdir(fontDir, { recursive: true });

for (const file of FONTS) {
  const target = new URL(file, fontDir);
  try {
    await readFile(target);
  } catch {
    const res = await fetch(`${FONT_BASE}/${file}`);
    if (!res.ok) throw new Error(`could not fetch ${file}: HTTP ${res.status}`);
    await writeFile(target, Buffer.from(await res.arrayBuffer()));
    console.log(`fetched ${file}`);
  }
}

const dir = decodeURIComponent(fontDir.pathname).replace(/\/$/, "");
const confPath = new URL("fonts.conf", fontDir);
await writeFile(
  confPath,
  `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd">
<fontconfig>
  <dir>${dir}</dir>
  <cachedir>${dir}/.cache</cachedir>
</fontconfig>
`,
);

// Must be set before sharp initialises librsvg/fontconfig.
process.env.FONTCONFIG_FILE = decodeURIComponent(confPath.pathname);
const { default: sharp } = await import("sharp");

const C = {
  bg: "#161c2e",
  term: "#1b2233",
  bar: "#222a3d",
  border: "#333d52",
  muted: "#8b949e",
  green: "#3fb950",
  blue: "#58a6ff",
  cyan: "#39c5cf",
  white: "#f0f6fc",
};

const esc = (s) =>
  String(s).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );

const HOST = esc(CANONICAL_DOMAIN);
const PROMPT_TEXT = `guest@${CANONICAL_DOMAIN}:~$ `;

/** A `guest@host:~$ <cmd>` prompt line. `xml:space="preserve"` keeps the space
 *  before the command (SVG trims leading whitespace in a tspan otherwise), so
 *  the markup has to stay on one line — a newline here would become a space. */
const prompt = (x, y, size, cmd) =>
  `<text x="${x}" y="${y}" font-family="${FAMILY}" font-size="${size}" xml:space="preserve">` +
  `<tspan fill="${C.green}">guest@${HOST}</tspan>` +
  `<tspan fill="${C.blue}">:~</tspan>` +
  `<tspan fill="${C.muted}">$</tspan>` +
  (cmd ? `<tspan fill="${C.white}"> ${esc(cmd)}</tspan>` : "") +
  `</text>`;

// Cursor sits one prompt-width along the last line.
const cursorX = 130 + PROMPT_TEXT.length * ADVANCE * 26;

const og =
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="a" cx="12%" cy="0%" r="75%">
      <stop offset="0" stop-color="#78b4ff" stop-opacity=".20" />
      <stop offset="1" stop-color="#78b4ff" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="b" cx="100%" cy="100%" r="75%">
      <stop offset="0" stop-color="#b496ff" stop-opacity=".18" />
      <stop offset="1" stop-color="#b496ff" stop-opacity="0" />
    </radialGradient>
  </defs>

  <rect width="1200" height="630" fill="${C.bg}" />
  <rect width="1200" height="630" fill="url(#a)" />
  <rect width="1200" height="630" fill="url(#b)" />

  <rect x="90" y="95" width="1020" height="440" rx="18" fill="${C.term}"
        stroke="${C.border}" stroke-width="2" />
  <path d="M90 113a18 18 0 0 1 18-18h984a18 18 0 0 1 18 18v36H90z" fill="${C.bar}" />
  <line x1="90" y1="149" x2="1110" y2="149" stroke="${C.border}" stroke-width="2" />
  <circle cx="126" cy="122" r="8" fill="#ff5f56" />
  <circle cx="152" cy="122" r="8" fill="#ffbd2e" />
  <circle cx="178" cy="122" r="8" fill="#27c93f" />
  <text x="600" y="130" text-anchor="middle" font-family="${FAMILY}" font-size="19"
        fill="${C.muted}">guest@${HOST}: ~</text>
` +
  prompt(130, 218, 26, "whoami") +
  `<text x="130" y="279" font-family="${FAMILY}" font-size="46" font-weight="700"
        fill="${C.white}">${esc(site.name)}</text>
` +
  prompt(130, 352, 26, "cat role.txt") +
  `<text x="130" y="403" font-family="${FAMILY}" font-size="32"
        fill="${C.cyan}">${esc(site.tagline)}</text>
` +
  prompt(130, 474, 26, "") +
  `<rect x="${cursorX.toFixed(1)}" y="455" width="${(ADVANCE * 26).toFixed(1)}" height="26"
        fill="${C.green}" />
</svg>`;

const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="${C.term}" stroke="${C.border}" stroke-width="2" />
  <path d="M16 22l10 10-10 10" fill="none" stroke="${C.green}" stroke-width="5"
        stroke-linecap="round" stroke-linejoin="round" />
  <line x1="34" y1="44" x2="48" y2="44" stroke="${C.green}" stroke-width="5"
        stroke-linecap="round" />
</svg>`;

const out = new URL("../public/", import.meta.url);

for (const [file, svg] of [
  ["og.png", og],
  ["apple-touch-icon.png", icon],
]) {
  const buf = await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(new URL(file, out), buf);
  console.log(`public/${file} -> ${buf.length} bytes`);
}
