// Emits public/sitemap.xml from the shared route list, including one URL per
// project. Runs as part of the build, so a new project is indexed automatically.

import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { allRoutes, root } from "./routes.mjs";

// Blank, not just missing: CI passes an unset repository variable as "".
const SITE_URL = ((process.env.VITE_SITE_URL || "").trim() ||
  "https://umer-farooq-cs.github.io/portfolio").replace(/\/+$/, "");

// Trailing slashes match what Pages serves and what the canonical tags say.
const today = new Date().toISOString().slice(0, 10);

// Only indexable routes: /notes sets noIndex while it has no posts, and /thanks is
// a form destination. Listing either would contradict the page's own robots tag.
const urls = (await allRoutes()).filter((route) => route.indexed);

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${SITE_URL}${url.path === "/" ? "/" : `${url.path}/`}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

await writeFile(resolve(root, "public/sitemap.xml"), xml, "utf8");
console.log(`sitemap.xml — ${urls.length} indexable URLs`);
