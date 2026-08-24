// Generate browser and install icons from the tightly cropped vector master.
// The original logo.jpg is intentionally kept as a source reference only; no
// raster pixels or font glyphs are embedded in the production identity.

import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = resolve(root, "public");
const lightMaster = await readFile(resolve(root, "src/assets/brand/uf-logo-light.svg"), "utf8");
const markPath = lightMaster.match(/<path\s+fill="[^"]+"\s+d="([^"]+)"/)?.[1];

if (!markPath) throw new Error("The UF vector master is missing its canonical path.");

const INK = "#0b0d10";
const PAPER = "#f7f8f9";
const HAIRLINE = "#c9cdd2";
const DARK_HAIRLINE = "#23272d";

function faviconSvg({ background, foreground, border }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect x=".5" y=".5" width="31" height="31" rx="5" fill="${background}" stroke="${border}"/>
  <path fill="${foreground}" d="${markPath}" transform="translate(2 9.05) scale(.0665083)"/>
</svg>
`;
}

function installSvg(size, { background, foreground, markWidth, radius }) {
  const markHeight = markWidth * (209 / 421);
  const x = (size - markWidth) / 2;
  const y = (size - markHeight) / 2;
  const scale = markWidth / 421;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="${background}"/>
  <path fill="${foreground}" d="${markPath}" transform="translate(${x} ${y}) scale(${scale})"/>
</svg>`;
}

function encodeIco(frames) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(frames.length, 4);

  const directory = Buffer.alloc(frames.length * 16);
  let offset = header.length + directory.length;
  frames.forEach(({ size, png }, index) => {
    const entry = index * 16;
    directory[entry] = size === 256 ? 0 : size;
    directory[entry + 1] = size === 256 ? 0 : size;
    directory[entry + 2] = 0;
    directory[entry + 3] = 0;
    directory.writeUInt16LE(1, entry + 4);
    directory.writeUInt16LE(32, entry + 6);
    directory.writeUInt32LE(png.length, entry + 8);
    directory.writeUInt32LE(offset, entry + 12);
    offset += png.length;
  });

  return Buffer.concat([header, directory, ...frames.map(({ png }) => png)]);
}

const lightFavicon = faviconSvg({
  background: PAPER,
  foreground: INK,
  border: HAIRLINE,
});
const darkFavicon = faviconSvg({
  background: INK,
  foreground: PAPER,
  border: DARK_HAIRLINE,
});

await Promise.all([
  writeFile(resolve(publicDir, "favicon-light-v3.svg"), lightFavicon),
  writeFile(resolve(publicDir, "favicon-dark-v3.svg"), darkFavicon),
  writeFile(resolve(publicDir, "favicon.svg"), lightFavicon),
]);

const standard512 = installSvg(512, {
  background: PAPER,
  foreground: INK,
  markWidth: 384,
  radius: 88,
});
const maskable512 = installSvg(512, {
  background: INK,
  foreground: PAPER,
  markWidth: 360,
  radius: 0,
});

await Promise.all([
  sharp(Buffer.from(installSvg(180, {
    background: PAPER,
    foreground: INK,
    markWidth: 135,
    radius: 31,
  }))).png().toFile(resolve(publicDir, "apple-touch-icon-v3.png")),
  sharp(Buffer.from(installSvg(192, {
    background: PAPER,
    foreground: INK,
    markWidth: 144,
    radius: 33,
  }))).png().toFile(resolve(publicDir, "icon-192-v3.png")),
  sharp(Buffer.from(standard512)).png().toFile(resolve(publicDir, "icon-512-v3.png")),
  sharp(Buffer.from(maskable512)).png().toFile(resolve(publicDir, "maskable-icon-512-v3.png")),
]);

const icoFrames = await Promise.all(
  [16, 32, 48].map(async (size) => ({
    size,
    png: await sharp(Buffer.from(lightFavicon)).resize(size, size).png().toBuffer(),
  })),
);
const ico = encodeIco(icoFrames);
await Promise.all([
  writeFile(resolve(publicDir, "favicon-v3.ico"), ico),
  writeFile(resolve(publicDir, "favicon.ico"), ico),
]);

console.log("brand assets → light/dark SVG, 16/32/48 ICO, 180/192/512 PNG, maskable 512 PNG");
