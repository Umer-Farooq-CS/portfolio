// Screenshots + accessibility scan of the built site, so design changes can be
// reviewed and axe violations caught without a manual pass.
//
//   npm run shots                 # every route, desktop + mobile, light + dark
//   npm run shots -- /projects    # just one route
//   npm run shots -- --a11y-only  # skip images, report axe violations

import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, rm } from "node:fs/promises";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");
const outDir = resolve(root, ".shots");

const BASE = ((process.env.VITE_BASE_PATH || "").trim() || "/portfolio/").replace(/\/+$/, "");
// "/" is the profile selector, so each lens's own home is listed too — they
// order the chapters differently and carry different hero copy, which is exactly
// what a visual diff needs to catch. One project page per rendering shape:
// a diagram-led infrastructure page, an architecture page, the interactive
// cirq-rag page, and a plain write-up.
const ROUTES = [
  "/",
  "/development",
  "/infrastructure",
  "/solutions",
  "/about",
  "/services",
  "/projects",
  "/projects/hpc-cluster-platform",
  "/projects/gpu-cloud-reference-architecture",
  "/projects/qcanvas",
  "/projects/cirq-rag",
  "/lab",
  "/cv",
  "/notes",
  "/thanks",
  "/nope",
];
const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

const args = process.argv.slice(2);
const a11yOnly = args.includes("--a11y-only");
const routeFilter = args.filter((a) => a.startsWith("/"));
const routes = routeFilter.length > 0 ? routeFilter : ROUTES;

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
  ".xml": "application/xml",
  ".webmanifest": "application/manifest+json",
};

/** Static server with SPA fallback, matching how GitHub Pages serves the site. */
function serve(port) {
  const server = createServer(async (req, res) => {
    let url = decodeURIComponent((req.url ?? "/").split("?")[0]);
    // Strip the deploy base, mirroring how Pages serves a project site.
    if (BASE && url.startsWith(BASE)) url = url.slice(BASE.length) || "/";
    let filePath = join(dist, url);
    try {
      const info = await stat(filePath);
      if (info.isDirectory()) {
        // Pages 301s a directory URL to its trailing-slash form, so the URL the
        // browser ends up holding is "/development/", not "/development". That
        // difference is not cosmetic: it is the pathname the app reads back, and
        // serving both forms as 200 hid a crash on every lens home page from
        // this harness until a human hit it in production. Redirect like the
        // real host does.
        if (!url.endsWith("/")) {
          res.writeHead(301, { location: `${BASE}${url}/` });
          res.end();
          return;
        }
        filePath = join(filePath, "index.html");
      }
    } catch {
      filePath = join(dist, "index.html"); // SPA fallback
    }
    try {
      const body = await readFile(filePath);
      res.writeHead(200, { "content-type": MIME[extname(filePath)] ?? "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404).end("not found");
    }
  });
  return new Promise((done) => server.listen(port, () => done(server)));
}

const PORT = 4178;
const server = await serve(PORT);
await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const violations = [];
const consoleErrors = [];

for (const theme of ["light", "dark"]) {
  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
      colorScheme: theme,
    });
    // The product deliberately defaults to light and follows the OS only after
    // a visitor chooses "system". Seed the same persisted choice the theme
    // control writes so captures named dark actually exercise the dark UI.
    await context.addInitScript(
      ({ selectedTheme, storageKey }) => localStorage.setItem(storageKey, selectedTheme),
      { selectedTheme: theme, storageKey: "uf-theme" },
    );

    for (const route of routes) {
      const page = await context.newPage();
      page.on("console", (message) => {
        if (message.type() === "error") consoleErrors.push(`${route} [${theme}/${viewport.name}] ${message.text()}`);
      });
      page.on("pageerror", (error) => consoleErrors.push(`${route} [${theme}/${viewport.name}] ${error.message}`));

      await page.goto(`http://localhost:${PORT}${BASE}${route}`, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      // Settle scroll-triggered reveals.
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(400);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(250);

      if (!a11yOnly) {
        const name = `${route === "/" ? "home" : route.replace(/\//g, "_").replace(/^_/, "")}-${viewport.name}-${theme}.png`;
        await page.screenshot({ path: join(outDir, name), fullPage: true });
      }

      // One a11y scan per route is enough; run it on the desktop light pass.
      if (theme === "light" && viewport.name === "desktop") {
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .analyze();
        for (const violation of results.violations) {
          violations.push({
            route,
            id: violation.id,
            impact: violation.impact,
            help: violation.help,
            nodes: violation.nodes.length,
            sample: violation.nodes[0]?.html?.slice(0, 120),
          });
        }
      }

      await page.close();
    }
    await context.close();
  }
}

await browser.close();
server.close();

if (!a11yOnly) console.log(`screenshots → ${outDir}`);

if (consoleErrors.length > 0) {
  console.log(`\nconsole errors (${consoleErrors.length}):`);
  for (const error of [...new Set(consoleErrors)]) console.log(`  ${error}`);
}

if (violations.length === 0) {
  console.log("\naxe: no violations");
} else {
  console.log(`\naxe violations (${violations.length}):`);
  for (const v of violations) {
    console.log(`  [${v.impact}] ${v.route} — ${v.id}: ${v.help} (${v.nodes} node${v.nodes === 1 ? "" : "s"})`);
    if (v.sample) console.log(`      ${v.sample}`);
  }
  process.exitCode = 1;
}
