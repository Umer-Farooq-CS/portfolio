// Generates public/umer-farooq-cv.pdf by printing the site's own /cv route.
//
// Why this way: the CV page is rendered from src/data, so printing it means the PDF
// and the web CV can never drift apart — there is one source of truth, not two.
// Compiling master_detailed_cv.tex would reintroduce the second one (and needs a
// LaTeX toolchain that isn't installed).
//
// Run after a build, and commit the result:
//   npm run build && npm run cv
//
// Note the ordering quirk: the PDF lands in public/, so it is picked up by the NEXT
// build. That is intentional — regenerating on every build would make the output
// depend on the previous run.

import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, stat, mkdir } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");
const out = resolve(root, "public/umer-farooq-cv.pdf");
const BASE = (process.env.VITE_BASE_PATH ?? "/portfolio/").replace(/\/+$/, "");
const PORT = 4179;

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
};

function serve(port) {
  const server = createServer(async (req, res) => {
    let url = decodeURIComponent((req.url ?? "/").split("?")[0]);
    if (BASE && url.startsWith(BASE)) url = url.slice(BASE.length) || "/";
    let filePath = join(dist, url);
    try {
      const info = await stat(filePath);
      if (info.isDirectory()) filePath = join(filePath, "index.html");
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

try {
  await stat(dist);
} catch {
  console.error("dist/ is missing — run `npm run build` first.");
  process.exit(1);
}

const server = await serve(PORT);
const browser = await chromium.launch();
const page = await browser.newPage();

// Print styles are authored for light; force it so a dark-mode default doesn't
// bleed a near-black background into the PDF.
await page.emulateMedia({ colorScheme: "light", media: "print" });
await page.goto(`http://localhost:${PORT}${BASE}/cv`, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);

await mkdir(dirname(out), { recursive: true });
await page.pdf({
  path: out,
  format: "A4",
  printBackground: false,
  margin: { top: "14mm", right: "14mm", bottom: "14mm", left: "14mm" },
});

await browser.close();
server.close();

const { size } = await stat(out);
console.log(`umer-farooq-cv.pdf — ${(size / 1024).toFixed(1)} KB`);
