// Emits public/sitemap.xml from the actual route list, including one URL per
// project. Runs as part of the build, so a new project is indexed automatically.

import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SITE_URL = (process.env.VITE_SITE_URL ?? "https://umer-farooq-cs.github.io/portfolio").replace(/\/+$/, "");

const STATIC_ROUTES = [
  { path: "/", priority: "1.0", changefreq: "monthly" },
  { path: "/about", priority: "0.8", changefreq: "monthly" },
  { path: "/services", priority: "0.8", changefreq: "monthly" },
  { path: "/projects", priority: "0.9", changefreq: "weekly" },
  { path: "/lab", priority: "0.8", changefreq: "monthly" },
  { path: "/cv", priority: "0.9", changefreq: "monthly" },
  { path: "/uses", priority: "0.5", changefreq: "monthly" },
  // /notes is deliberately absent: NotesPage sets noIndex while it has no posts,
  // so listing it would contradict its own robots tag. Add it with the first note.
];

/** Reads slugs straight out of the data file — no duplicate list to maintain. */
async function projectSlugs() {
  const source = await readFile(resolve(root, "src/data/projects.ts"), "utf8");
  return [...source.matchAll(/^\s{4}slug:\s*"([^"]+)",\s*$/gm)].map((match) => match[1]);
}

const today = new Date().toISOString().slice(0, 10);
const slugs = await projectSlugs();

const urls = [
  ...STATIC_ROUTES,
  ...slugs.map((slug) => ({ path: `/projects/${slug}`, priority: "0.7", changefreq: "monthly" })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${SITE_URL}${url.path === "/" ? "/" : url.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

await writeFile(resolve(root, "public/sitemap.xml"), xml, "utf8");
console.log(`sitemap.xml — ${urls.length} URLs (${slugs.length} projects)`);
