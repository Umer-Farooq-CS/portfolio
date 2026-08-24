// Asserts the built output is actually deployable, then exits non-zero if not.
//
// This exists because of a real regression: an unset repository variable arrives
// in CI as an EMPTY STRING, `??` did not treat that as absent, and the base path
// silently fell back to relative. Relative asset URLs resolve against the current
// route, so /projects/qcanvas requested /projects/assets/index.js, got the SPA
// fallback, and the browser refused to execute HTML as a module — every deep link
// was broken on the live site while the homepage looked perfectly fine.
//
// A unit test cannot catch that: it only manifests in the built HTML.

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { allRoutes, root } from "./routes.mjs";
const failures = [];

async function read(relative) {
  try {
    return await readFile(resolve(root, relative), "utf8");
  } catch {
    return null;
  }
}

async function readBuffer(relative) {
  try {
    return await readFile(resolve(root, relative));
  } catch {
    return null;
  }
}

function pngDimensions(buffer) {
  const signature = Buffer.from("89504e470d0a1a0a", "hex");
  if (!buffer || buffer.length < 24 || !buffer.subarray(0, 8).equals(signature)) return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function icoFrames(buffer) {
  if (
    !buffer ||
    buffer.length < 6 ||
    buffer.readUInt16LE(0) !== 0 ||
    buffer.readUInt16LE(2) !== 1
  ) {
    return null;
  }

  const count = buffer.readUInt16LE(4);
  if (buffer.length < 6 + count * 16) return null;

  const frames = [];
  for (let index = 0; index < count; index++) {
    const entry = 6 + index * 16;
    const bytes = buffer.readUInt32LE(entry + 8);
    const offset = buffer.readUInt32LE(entry + 12);
    if (offset + bytes > buffer.length) return null;
    frames.push({
      width: buffer[entry] || 256,
      height: buffer[entry + 1] || 256,
      bits: buffer.readUInt16LE(entry + 6),
    });
  }
  return frames;
}

function attribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1] ?? null;
}

const html = await read("dist/index.html");
if (!html) {
  console.error("dist/index.html is missing — run `npm run build` first.");
  process.exit(1);
}

// 1. Asset URLs must be absolute, or deep links break.
const relativeAssets = [...html.matchAll(/(?:src|href)="(\.\/[^"]*|(?!\/|https?:)[^":]*assets\/[^"]*)"/g)];
if (relativeAssets.length > 0) {
  failures.push(
    `asset URLs are relative (${relativeAssets.length} found, e.g. ${relativeAssets[0][1]}). ` +
      "Deep links will fail to load. Check the base path resolution in vite.config.ts.",
  );
}

const absolute = [...html.matchAll(/(?:src|href)="(\/[^"]*assets\/[^"]*)"/g)];
if (absolute.length === 0) {
  failures.push("no absolute asset URLs found in dist/index.html — nothing would load.");
}

// 2. The SPA fallback has to exist, or Pages serves its own 404 for every route.
if (!(await read("dist/404.html"))) {
  failures.push("dist/404.html is missing — every route except / would 404 on GitHub Pages.");
}

// 3. The social card must exist, since index.html references it by absolute URL.
if (!(await read("dist/og-portfolio.png"))) {
  failures.push("dist/og-portfolio.png is missing — shares would render a blank card.");
}

// 4. Browser and install icons must stay base-safe and match their declarations.
const linkTags = [...html.matchAll(/<link\b[^>]*>/g)].map((match) => match[0]);
const requiredLinks = [
  { file: "favicon-v3.ico", rel: "icon", sizes: "16x16 32x32 48x48" },
  { file: "favicon-light-v3.svg", rel: "icon", sizes: "any" },
  { file: "apple-touch-icon-v3.png", rel: "apple-touch-icon", sizes: "180x180" },
  { file: "site.webmanifest", rel: "manifest", sizes: null },
];

for (const expected of requiredLinks) {
  const tag = linkTags.find((candidate) => {
    const href = attribute(candidate, "href");
    return attribute(candidate, "rel") === expected.rel && href?.endsWith(`/${expected.file}`);
  });
  if (!tag) {
    failures.push(`head is missing the ${expected.rel} link for ${expected.file}.`);
    continue;
  }
  const href = attribute(tag, "href");
  if (!href?.startsWith("/")) {
    failures.push(`${expected.file} has a non-absolute built href (${href}); deep routes can resolve it incorrectly.`);
  }
  if (expected.sizes && attribute(tag, "sizes") !== expected.sizes) {
    failures.push(`${expected.file} does not declare sizes="${expected.sizes}" in the built head.`);
  }
  if (!(await readBuffer(`dist/${expected.file}`))) {
    failures.push(`dist/${expected.file} is missing.`);
  }
}

const themeFaviconTags = linkTags.filter((tag) => /\bdata-theme-favicon\b/.test(tag));
const svgIconTags = linkTags.filter(
  (tag) => attribute(tag, "rel") === "icon" && attribute(tag, "type") === "image/svg+xml",
);
if (svgIconTags.length !== 1) {
  failures.push(`the built head must contain exactly one SVG favicon link; found ${svgIconTags.length}.`);
}
if (themeFaviconTags.length !== 1) {
  failures.push(`the built head must contain exactly one data-theme-favicon link; found ${themeFaviconTags.length}.`);
} else {
  const tag = themeFaviconTags[0];
  if (
    attribute(tag, "type") !== "image/svg+xml" ||
    attribute(tag, "data-light-favicon") !== "favicon-light-v3.svg" ||
    attribute(tag, "data-dark-favicon") !== "favicon-dark-v3.svg"
  ) {
    failures.push("the theme favicon link has incorrect type or light/dark filename metadata.");
  }
}
if (!html.includes("favicon.dataset.darkFavicon") || !html.includes("favicon.dataset.lightFavicon")) {
  failures.push("the prepaint theme script no longer switches the favicon with the resolved theme.");
}
if (html.includes("-v2")) {
  failures.push("the built head still references obsolete v2 icon assets.");
}

const lightSvg = await read("dist/favicon-light-v3.svg");
const darkSvg = await read("dist/favicon-dark-v3.svg");
const forbiddenSvgContent = /<(?:text|image|linearGradient|radialGradient|foreignObject)\b|data:image\//i;
for (const [file, svg] of [
  ["favicon-light-v3.svg", lightSvg],
  ["favicon-dark-v3.svg", darkSvg],
]) {
  if (!svg) {
    failures.push(`dist/${file} is missing.`);
  } else if (forbiddenSvgContent.test(svg)) {
    failures.push(`${file} contains embedded raster, text, gradient, or foreign-object content.`);
  }
}
if (lightSvg && darkSvg && lightSvg === darkSvg) {
  failures.push("light and dark v3 favicons must be distinct SVG assets.");
}

const legacySvg = await read("dist/favicon.svg");
if (!legacySvg || legacySvg !== lightSvg) {
  failures.push("dist/favicon.svg must remain an exact compatibility alias of favicon-light-v3.svg.");
}

const rasterIcons = [
  ["apple-touch-icon-v3.png", 180],
  ["icon-192-v3.png", 192],
  ["icon-512-v3.png", 512],
  ["maskable-icon-512-v3.png", 512],
];
for (const [file, expectedSize] of rasterIcons) {
  const dimensions = pngDimensions(await readBuffer(`dist/${file}`));
  if (!dimensions) {
    failures.push(`dist/${file} is missing or is not a PNG.`);
  } else if (dimensions.width !== expectedSize || dimensions.height !== expectedSize) {
    failures.push(
      `${file} is ${dimensions.width}x${dimensions.height}; expected ${expectedSize}x${expectedSize}.`,
    );
  }
}

const frames = icoFrames(await readBuffer("dist/favicon-v3.ico"));
const frameSummary = frames?.map(({ width, height, bits }) => `${width}x${height}@${bits}`).join(", ");
if (frameSummary !== "16x16@32, 32x32@32, 48x48@32") {
  failures.push(`favicon-v3.ico has unexpected frames (${frameSummary ?? "invalid ICO"}).`);
}
const versionedIco = await readBuffer("dist/favicon-v3.ico");
const legacyIco = await readBuffer("dist/favicon.ico");
if (!versionedIco || !legacyIco || !legacyIco.equals(versionedIco)) {
  failures.push("dist/favicon.ico must remain an exact compatibility alias of favicon-v3.ico.");
}

const manifestText = await read("dist/site.webmanifest");
if (!manifestText) {
  failures.push("dist/site.webmanifest is missing.");
} else {
  try {
    const manifest = JSON.parse(manifestText);
    if (manifest.id !== "./" || manifest.start_url !== "./" || manifest.scope !== "./") {
      failures.push('manifest id, start_url and scope must all be "./" so project and root deployments agree.');
    }
    if (manifest.background_color !== "#e9eaec" || manifest.theme_color !== "#e9eaec") {
      failures.push("manifest launch colors no longer match the app's deliberate light-first render.");
    }

    const expectedIcons = [
      ["./icon-192-v3.png", "192x192", "image/png", "any"],
      ["./icon-512-v3.png", "512x512", "image/png", "any"],
      ["./maskable-icon-512-v3.png", "512x512", "image/png", "maskable"],
    ];
    if (!Array.isArray(manifest.icons) || manifest.icons.length !== expectedIcons.length) {
      failures.push(`manifest must contain exactly ${expectedIcons.length} v3 install icons.`);
    }
    for (const [src, sizes, type, purpose] of expectedIcons) {
      const icon = manifest.icons?.find((candidate) => candidate.src === src);
      if (!icon || icon.sizes !== sizes || icon.type !== type || icon.purpose !== purpose) {
        failures.push(`${src} is missing from the manifest or has incorrect sizes/type/purpose metadata.`);
      }
    }
    if (manifestText.includes("-v2")) {
      failures.push("manifest still references obsolete v2 icon assets.");
    }
  } catch {
    failures.push("dist/site.webmanifest is not valid JSON.");
  }
}

// 5. The sitemap must carry absolute URLs on the real origin.
const sitemap = await read("dist/sitemap.xml");
if (!sitemap) {
  failures.push("dist/sitemap.xml is missing.");
} else if (!/<loc>https?:\/\/[^<]+<\/loc>/.test(sitemap)) {
  failures.push("sitemap.xml has no absolute <loc> URLs — VITE_SITE_URL resolved to blank.");
}

// 6. Every route must have a real index.html, or Pages answers 404 for it and
//    the per-page metadata is never read by anything that checks status codes.
const routes = await allRoutes();
const notPrerendered = [];
for (const route of routes) {
  if (route.path === "/") continue;
  if (!(await read(`dist${route.path}/index.html`))) notPrerendered.push(route.path);
}
if (notPrerendered.length > 0) {
  failures.push(
    `${notPrerendered.length} route(s) are not prerendered, so Pages will 404 them: ` +
      `${notPrerendered.slice(0, 4).join(", ")}${notPrerendered.length > 4 ? ", …" : ""}. ` +
      "Run `npm run prerender` after the build.",
  );
}

if (failures.length > 0) {
  console.error("Build check failed:\n");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(
  `build check passed — ${absolute.length} absolute asset refs, ${routes.length} routes prerendered, ` +
    "404 fallback, browser/PWA icons, social card and sitemap all present",
);
