// The site's route list, in one place, because two consumers need it: the sitemap
// and the route prerenderer. Duplicating it is how a new page ends up indexed but
// not prerendered, or the reverse.

import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * `indexed: false` means the route is prerendered (so it answers 200) but stays
 * out of the sitemap — /notes sets noIndex on itself while it has no posts, and
 * /thanks is a form destination nobody should arrive at from search.
 */
export const STATIC_ROUTES = [
  { path: "/", priority: "1.0", changefreq: "monthly", indexed: true },
  { path: "/about", priority: "0.8", changefreq: "monthly", indexed: true },
  { path: "/services", priority: "0.8", changefreq: "monthly", indexed: true },
  { path: "/projects", priority: "0.9", changefreq: "weekly", indexed: true },
  { path: "/lab", priority: "0.8", changefreq: "monthly", indexed: true },
  { path: "/cv", priority: "0.9", changefreq: "monthly", indexed: true },
  { path: "/uses", priority: "0.5", changefreq: "monthly", indexed: true },
  { path: "/notes", priority: "0.7", changefreq: "weekly", indexed: false },
  { path: "/thanks", priority: "0.1", changefreq: "yearly", indexed: false },
];

/** Slugs read straight out of the data file, so there is no second list. */
export async function projectSlugs() {
  const source = await readFile(resolve(root, "src/data/projects.ts"), "utf8");
  return [...source.matchAll(/^\s{4}slug:\s*"([^"]+)",\s*$/gm)].map((match) => match[1]);
}

/** Every route the app can serve, static pages plus one per project. */
export async function allRoutes() {
  const slugs = await projectSlugs();
  return [
    ...STATIC_ROUTES,
    ...slugs.map((slug) => ({
      path: `/projects/${slug}`,
      priority: "0.7",
      changefreq: "monthly",
      indexed: true,
    })),
  ];
}

export { root };
