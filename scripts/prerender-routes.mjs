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

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { PROFILE_LABELS, PROFILE_ROUTE_PATHS, allRoutes, projectSlugs, root } from "./routes.mjs";

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

/**
 * Project titles and descriptions come from the data file, the same place the
 * pages read them — and composed the way ProjectDetailPage composes them
 * ("subtitle — first description bullet"), so the prerendered head and the
 * runtime head say the same thing rather than one being a truncated version.
 *
 * Parsed per entry rather than with one pattern, because the fields between
 * subtitle and description vary from project to project.
 */
async function projectMeta() {
  const source = await readFile(resolve(root, "src/data/projects.ts"), "utf8");
  const meta = new Map();

  for (const chunk of source.split(/^\s{4}slug: "/m).slice(1)) {
    const slug = chunk.slice(0, chunk.indexOf('"'));
    const title = chunk.match(/^\s{4}title:\s*"([^"]+)",/m)?.[1];
    const subtitle = chunk.match(/^\s{4}subtitle:\s*"([^"]+)",/m)?.[1];
    const firstBullet = chunk.match(/^\s{4}description:\s*\[\s*\n\s+"([^"]+)"/m)?.[1];
    if (!title || !subtitle) continue;
    meta.set(slug, {
      title,
      description: firstBullet ? `${subtitle} — ${firstBullet}` : subtitle,
    });
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

/**
 * Replaces a whole <meta> element, whatever its attribute layout.
 *
 * index.html wraps the long description tags across several lines, and the first
 * version of this script matched only single-line tags — so titles were rewritten
 * per route while all three description tags silently kept the homepage text.
 * Matching the element rather than a line avoids that whole class of miss.
 */
function setMeta(html, attr, name, content) {
  const element = new RegExp(`<meta\s+${attr}="${name}"[\s\S]*?/>`);
  const replacement = `<meta ${attr}="${name}" content="${escape(content)}" />`;
  return element.test(html)
    ? html.replace(element, replacement)
    : html.replace("</head>", `    ${replacement}
  </head>`);
}

/** Rewrites the head so this file describes its own route, not the homepage. */
function withMeta(html, { path, title, description }) {
  const canonical = `${SITE_URL}${path === "/" ? "/" : `${path}/`}`;
  const fullTitle = path === "/" ? `Umer Farooq — ${SUFFIX}` : `${title} — Umer Farooq`;

  let out = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(fullTitle)}</title>`);

  out = setMeta(out, "name", "description", description);
  out = setMeta(out, "property", "og:title", fullTitle);
  out = setMeta(out, "property", "og:description", description);
  out = setMeta(out, "property", "og:url", canonical);
  out = setMeta(out, "name", "twitter:title", fullTitle);
  out = setMeta(out, "name", "twitter:description", description);

  // The shell has no canonical — useDocumentMeta adds it at runtime — so insert one.
  out = out.replace("</head>", `    <link rel="canonical" href="${canonical}" />
  </head>`);
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

/**
 * A profile-prefixed inner page or project detail has no metadata of its own —
 * it falls back to the bare route's title/description (prefixed with the
 * profile's full name) and, critically, to the bare route's canonical URL, so
 * the ~90 profile-prefixed pages consolidate onto the same handful of
 * canonical write-ups instead of reading as duplicate content.
 *
 * A profile's own home route (e.g. "/development") is a direct hit in
 * routeMeta — it has real, distinct copy and canonicalizes to itself.
 */
function resolveMeta(path) {
  if (routeMeta[path]) return { meta: routeMeta[path], canonicalPath: path, prefixLabel: null };

  for (const profilePath of PROFILE_ROUTE_PATHS) {
    const prefix = `/${profilePath}/`;
    if (!path.startsWith(prefix)) continue;
    const bareRest = path.slice(prefix.length); // "about" or "projects/qcanvas"
    const barePath = `/${bareRest}`;
    const bareMeta = routeMeta[barePath] ?? projects.get(bareRest.replace(/^projects\//, ""));
    if (bareMeta) {
      return { meta: bareMeta, canonicalPath: barePath, prefixLabel: PROFILE_LABELS[profilePath] };
    }
  }

  const projectMetaEntry = projects.get(path.replace("/projects/", ""));
  if (projectMetaEntry) return { meta: projectMetaEntry, canonicalPath: path, prefixLabel: null };

  return null;
}

let written = 0;
for (const route of routes) {
  const resolved = resolveMeta(route.path);
  if (!resolved) {
    console.error(`no metadata for route ${route.path} — add it to src/data/route-meta.json`);
    process.exit(1);
  }

  const { meta, canonicalPath, prefixLabel } = resolved;
  const title = prefixLabel ? `${prefixLabel} — ${meta.title}` : meta.title;
  const html = withMeta(shell, { path: canonicalPath, title, description: meta.description });
  const target = route.path === "/" ? shellPath : join(dist, route.path, "index.html");
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, html, "utf8");
  written++;
}

// 404.html must stay the generic shell: it answers for unknown paths, so it can't
// claim to be any particular route.
await writeFile(join(dist, "404.html"), withMeta(shell, {
  path: "/",
  title: "Page not found",
  description: routeMeta["/"].description,
}).replace(/<title>[^<]*<\/title>/, "<title>Page not found — Umer Farooq</title>"), "utf8");

console.log(
  `prerendered ${written} routes with their own title, description and canonical`,
);
