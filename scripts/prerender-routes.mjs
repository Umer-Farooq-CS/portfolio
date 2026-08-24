// Writes a real index.html at every route path, with that route's own title,
// description and canonical baked in.
//
// Two problems this solves, both invisible to a person browsing the site:
//
// 1. Status codes. A single-page app on GitHub Pages relies on 404.html, which
//    Pages serves with an HTTP 404. The app boots and the page looks right, but
//    every route except / reported "not found" to anything reading status codes.
//
// 2. Metadata. useDocumentMeta sets the title and canonical from JavaScript, so a
//    social scraper — which never runs JS — saw the generic homepage title on
//    every route. Sharing a project link previewed the wrong page.
//
// This is not server-side rendering: the body is still client-rendered. It fixes
// the status code and the head. 404.html stays for paths that really don't exist.

import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { allRoutes, projectSlugs, root } from "./routes.mjs";

const dist = resolve(root, "dist");
const shellPath = join(dist, "index.html");

const SITE_URL = ((process.env.VITE_SITE_URL || "").trim() ||
  "https://umer-farooq-cs.github.io/portfolio").replace(/\/+$/, "");

let shell;
try {
  shell = await readFile(shellPath, "utf8");
} catch {
  console.error("dist/index.html is missing — run `npm run build` first.");
  process.exit(1);
}

const routeMeta = JSON.parse(await readFile(resolve(root, "src/data/route-meta.json"), "utf8"));

/** Project titles come from the data file, the same place the pages read them. */
async function projectMeta() {
  const source = await readFile(resolve(root, "src/data/projects.ts"), "utf8");
  const meta = new Map();
  // Each entry declares slug, then title, then subtitle, in that order.
  const pattern =
    /^\s{4}slug:\s*"([^"]+)",\s*\n\s{4}title:\s*"([^"]+)",\s*\n\s{4}subtitle:\s*"([^"]+)",/gm;
  for (const [, slug, title, subtitle] of source.matchAll(pattern)) {
    meta.set(slug, { title, description: subtitle });
  }
  return meta;
}

const escape = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const SUFFIX = "HPC, quantum simulation, and AI systems engineer";

/** Rewrites the head so this file describes its own route, not the homepage. */
function withMeta(html, { path, title, description }) {
  const canonical = `${SITE_URL}${path === "/" ? "/" : `${path}/`}`;
  const fullTitle = path === "/" ? `Umer Farooq — ${SUFFIX}` : `${title} — Umer Farooq`;

  let out = html
    .replace(/<title>[^<]*<\/title>/, `<title>${escape(fullTitle)}</title>`)
    .replace(
      /(<meta name="description" content=")[^"]*(")/,
      `$1${escape(description)}$2`,
    )
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escape(fullTitle)}$2`)
    .replace(
      /(<meta property="og:description" content=")[^"]*(")/,
      `$1${escape(description)}$2`,
    )
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${canonical}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${escape(fullTitle)}$2`)
    .replace(
      /(<meta name="twitter:description" content=")[^"]*(")/,
      `$1${escape(description)}$2`,
    );

  // The shell has no canonical (useDocumentMeta adds it at runtime), so insert one.
  out = out.replace("</head>", `    <link rel="canonical" href="${canonical}" />\n  </head>`);
  return out;
}

const routes = await allRoutes();
const projects = await projectMeta();
const slugs = await projectSlugs();

const missing = slugs.filter((slug) => !projects.has(slug));
if (missing.length > 0) {
  console.error(
    `could not read title/subtitle for ${missing.length} project(s): ${missing.join(", ")}.\n` +
      "The field order in src/data/projects.ts probably changed — update the pattern in projectMeta().",
  );
  process.exit(1);
}

let written = 0;
for (const route of routes) {
  const meta =
    routeMeta[route.path] ??
    projects.get(route.path.replace("/projects/", "")) ??
    null;

  if (!meta) {
    console.error(`no metadata for route ${route.path} — add it to src/data/route-meta.json`);
    process.exit(1);
  }

  const html = withMeta(shell, { path: route.path, ...meta });
  const target = route.path === "/" ? shellPath : join(dist, route.path, "index.html");
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, html, "utf8");
  written++;
}

// 404.html must stay the generic shell: it answers for unknown paths, so it can't
// claim to be any particular route.
await copyFile(shellPath, join(dist, "404.html"));
await writeFile(join(dist, "404.html"), withMeta(shell, {
  path: "/",
  title: "Page not found",
  description: routeMeta["/"].description,
}).replace(/<title>[^<]*<\/title>/, "<title>Page not found — Umer Farooq</title>"), "utf8");

console.log(
  `prerendered ${written} routes with their own title, description and canonical`,
);
