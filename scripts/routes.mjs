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
  { path: "/notes", priority: "0.7", changefreq: "weekly", indexed: false },
  { path: "/thanks", priority: "0.1", changefreq: "yearly", indexed: false },
];

/**
 * The three profile URL segments. Node can't import src/data/profiles.ts (the
 * TS source of truth), so this is asserted equal to it in
 * src/test/profiles.test.ts instead of shared — the same trade-off
 * STATIC_ROUTES already makes with the rest of this file.
 */
export const PROFILE_ROUTE_PATHS = ["development", "infrastructure", "solutions"];

/** Full display name per profile, for prerendered page titles. Mirrors PROFILES[].fullLabel. */
export const PROFILE_LABELS = {
  development: "HPC & AI Development",
  infrastructure: "HPC & AI Infrastructure",
  solutions: "Pre-Sales Solution Architect",
};

/** Static inner pages that exist per profile — mirrors the nested :profile block in App.tsx. */
const PROFILE_INNER_PATHS = ["about", "services", "projects", "lab", "cv", "notes"];

/** Slugs read straight out of the data file, so there is no second list. */
export async function projectSlugs() {
  const source = await readFile(resolve(root, "src/data/projects.ts"), "utf8");
  return [...source.matchAll(/^\s{4}slug:\s*"([^"]+)",\s*$/gm)].map((match) => match[1]);
}

/**
 * Every route the app can serve: static pages, one per project, plus the same
 * pages again under each profile prefix.
 *
 * Profile-prefixed inner pages and project details are prerendered (so they
 * answer 200, per check-build.mjs) but `indexed: false` — their canonical tag
 * points at the bare URL, so the sitemap doesn't carry ~90 near-duplicate
 * entries for content that is, today, the same underlying write-up.
 */
export async function allRoutes() {
  const slugs = await projectSlugs();
  const profileRoutes = PROFILE_ROUTE_PATHS.flatMap((profilePath) => [
    { path: `/${profilePath}`, priority: "0.9", changefreq: "monthly", indexed: true },
    ...PROFILE_INNER_PATHS.map((inner) => ({
      path: `/${profilePath}/${inner}`,
      priority: "0.5",
      changefreq: "monthly",
      indexed: false,
    })),
    ...slugs.map((slug) => ({
      path: `/${profilePath}/projects/${slug}`,
      priority: "0.4",
      changefreq: "monthly",
      indexed: false,
    })),
  ]);

  return [
    ...STATIC_ROUTES,
    ...slugs.map((slug) => ({
      path: `/projects/${slug}`,
      priority: "0.7",
      changefreq: "monthly",
      indexed: true,
    })),
    ...profileRoutes,
  ];
}

export { root };
