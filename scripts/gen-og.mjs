// Generates public/og-portfolio.png (1200x630) — the social card that was
// referenced in index.html but never existed, so every share rendered blank.
//
// Run locally and commit the result: `node scripts/gen-og.mjs`. Fonts come from
// the system, so generating in CI would render differently across runners.

import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = resolve(root, "public/og-portfolio.png");

const INK = "#0b0d10";
const PAPER = "#e9eaec";
const GRAPHITE = "#5a6169";
const THERMAL = "#ff5a1f";

// Measured-vs-ideal speedup curve — the site's signature figure, drawn as paths
// so it needs no font and no runtime.
const curve = () => {
  const x0 = 720;
  const y0 = 470;
  const w = 380;
  const h = 250;
  const points = [1, 1.95, 2.8, 3.6, 4.3, 4.9, 5.4, 6.4];
  const step = w / (points.length - 1);
  const scale = h / 8;
  const measured = points
    .map((value, index) => `${index === 0 ? "M" : "L"} ${x0 + index * step} ${y0 - value * scale}`)
    .join(" ");
  const dots = points
    .map(
      (value, index) =>
        `<circle cx="${x0 + index * step}" cy="${y0 - value * scale}" r="5" fill="${THERMAL}" />`,
    )
    .join("");
  return `
    <line x1="${x0}" y1="${y0}" x2="${x0 + w}" y2="${y0}" stroke="${GRAPHITE}" stroke-width="1.5" />
    <line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y0 - h}" stroke="${GRAPHITE}" stroke-width="1.5" />
    <!-- ideal: speedup == worker count, so it starts at 1x, not at 0 -->
    <path d="M ${x0} ${y0 - scale} L ${x0 + w} ${y0 - points.length * scale}" stroke="${GRAPHITE}"
          stroke-width="2" stroke-dasharray="6 6" fill="none" />
    <path d="${measured}" stroke="${THERMAL}" stroke-width="3.5" fill="none"
          stroke-linecap="round" stroke-linejoin="round" />
    ${dots}
  `;
};

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${INK}" />

  <!-- column ticks: the grid, exposed -->
  ${Array.from({ length: 13 }, (_, i) => {
    const x = 80 + i * ((1200 - 160) / 12);
    return `<line x1="${x}" y1="72" x2="${x}" y2="88" stroke="${GRAPHITE}" stroke-width="1" opacity="0.5" />`;
  }).join("")}

  <!-- Supplied UF identity, reduced directly from the tightly cropped vector master. -->
  <svg x="80" y="146" width="88" height="44" viewBox="0 0 421 209">
    <path fill="${PAPER}"
          d="M53 0h42L44 89c-8 14-10 29-7 44 5 24 23 39 47 39 22 0 41-10 53-29L225 0h42L163 179c-15 19-36 29-58 30H82c-27-1-49-11-64-28C4 164-2 137 1 111c1-11 3-20 7-29L53 0ZM277 0h144l-19 38H256l21-38ZM232 77h103l-21 37H212l20-37Z" />
  </svg>

  <text x="188" y="196" fill="${PAPER}" font-family="Segoe UI, Arial, sans-serif"
        font-size="72" font-weight="700" letter-spacing="-1">Umer Farooq</text>

  <text x="80" y="272" fill="${PAPER}" font-family="Segoe UI, Arial, sans-serif"
        font-size="34" font-weight="600" opacity="0.92">I make slow systems fast,</text>
  <text x="80" y="316" fill="${PAPER}" font-family="Segoe UI, Arial, sans-serif"
        font-size="34" font-weight="600" opacity="0.92">and hard systems runnable.</text>

  <text x="80" y="392" fill="${GRAPHITE}" font-family="Consolas, Menlo, monospace"
        font-size="20" letter-spacing="1.6">HPC · GPU · QUANTUM SIMULATION · VERIFIED AI</text>
  <text x="80" y="424" fill="${GRAPHITE}" font-family="Consolas, Menlo, monospace"
        font-size="20" letter-spacing="1.6">ISLAMABAD, PKT</text>

  <line x1="80" y1="500" x2="620" y2="500" stroke="${GRAPHITE}" stroke-width="1" opacity="0.4" />
  <text x="80" y="540" fill="${THERMAL}" font-family="Consolas, Menlo, monospace"
        font-size="22" letter-spacing="1.2">speedup 6.4x</text>
  <text x="250" y="540" fill="${GRAPHITE}" font-family="Consolas, Menlo, monospace"
        font-size="22" letter-spacing="1.2">efficiency 80%</text>

  ${curve()}
  <text x="720" y="510" fill="${GRAPHITE}" font-family="Consolas, Menlo, monospace"
        font-size="17" letter-spacing="1.2">WORKERS 1 -&gt; 8</text>
</svg>
`;

await mkdir(dirname(out), { recursive: true });
const info = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(out);
console.log(`og-portfolio.png  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(1)} KB`);
