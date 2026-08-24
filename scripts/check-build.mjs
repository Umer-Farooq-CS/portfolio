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

// 4. The sitemap must carry absolute URLs on the real origin.
const sitemap = await read("dist/sitemap.xml");
if (!sitemap) {
  failures.push("dist/sitemap.xml is missing.");
} else if (!/<loc>https?:\/\/[^<]+<\/loc>/.test(sitemap)) {
  failures.push("sitemap.xml has no absolute <loc> URLs — VITE_SITE_URL resolved to blank.");
}

// 5. Every route must have a real index.html, or Pages answers 404 for it and
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
    "404 fallback, social card and sitemap all present",
);
