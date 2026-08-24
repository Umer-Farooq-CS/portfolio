// Writes a real index.html at every route path, so GitHub Pages answers 200
// instead of falling back to 404.html.
//
// Why this matters: a single-page app on Pages normally relies on 404.html, which
// Pages serves with an HTTP 404 status. The app boots and the page looks fine to a
// person, but every route except / reports "not found" to anything that reads
// status codes — crawlers, link checkers, social scrapers. The per-page titles,
// canonicals and JSON-LD this site sets are wasted if the response says 404.
//
// This is not server-side rendering: the HTML is identical and the content is
// still client-rendered. It only fixes the status code and makes each route a real
// URL that can be crawled. 404.html stays for genuinely unknown paths.

import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { allRoutes, root } from "./routes.mjs";

const dist = resolve(root, "dist");
const shell = join(dist, "index.html");

try {
  await readFile(shell, "utf8");
} catch {
  console.error("dist/index.html is missing — run `npm run build` first.");
  process.exit(1);
}

const routes = await allRoutes();
let written = 0;

for (const route of routes) {
  if (route.path === "/") continue; // already dist/index.html
  const target = join(dist, route.path, "index.html");
  await mkdir(dirname(target), { recursive: true });
  await copyFile(shell, target);
  written++;
}

// A trailing-slash-free deep link like /projects/qcanvas is what Pages actually
// receives; it serves <path>/index.html for it, which is what we just wrote.
await writeFile(
  join(dist, ".prerendered"),
  routes.map((route) => route.path).join("\n") + "\n",
  "utf8",
);

console.log(`prerendered ${written} routes (plus / and 404.html) — Pages will answer 200 for each`);
