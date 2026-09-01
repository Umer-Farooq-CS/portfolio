// Behavioural check of the scroll model, in a real browser.
//
// None of this is reachable from jsdom: wheel deltas, rAF easing, coarse vs
// fine pointers and computed `scroll-snap-*` all need a real engine. The unit
// suite cannot protect any of it, so this does.
//
//   npm run build:gh-pages && npm run check:scroll
//
// The prerendered build matters: without it every route falls through the SPA
// fallback, no per-route directory exists, and the harness cannot reproduce the
// trailing-slash redirect that Pages actually performs.
//
// Covers, on desktop plus two phone profiles:
//   - chapter pages ease rather than step, and accumulate exactly
//   - an external jump cancels an in-flight animation instead of being dragged back
//   - the smooth-scrolling toggle reaches native scrolling when off
//   - the landing page's three stops, in both directions
//   - phones intercept nothing, and only the landing carries snap
//   - the sticky hero is never a snap target (it pins the scroll if it is)

import { chromium, devices } from "playwright";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const dist = resolve(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".avif": "image/avif", ".jpg": "image/jpeg", ".woff2": "font/woff2", ".ico": "image/x-icon", ".xml": "application/xml" };
const server = createServer(async (req, res) => {
  const p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  let f = join(dist, p);
  try {
    if ((await stat(f)).isDirectory()) {
      // Pages 301s a directory URL to its trailing-slash form. Serving both as
      // 200 made this harness disagree with production, which is how a crash on
      // every lens home page got past it.
      if (!p.endsWith("/")) { res.writeHead(301, { location: `${p}/` }); res.end(); return; }
      f = join(f, "index.html");
    }
  }
  catch { f = join(dist, p, "index.html"); try { await stat(f); } catch { f = join(dist, "index.html"); } }
  try { res.writeHead(200, { "content-type": MIME[extname(f)] ?? "application/octet-stream" }); res.end(await readFile(f)); }
  catch { res.writeHead(404).end("x"); }
});
await new Promise((r) => server.listen(4395, r));

let failures = 0;
const check = (label, ok, detail) => {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? `  (${detail})` : ""}`);
  if (!ok) failures++;
};

const browser = await chromium.launch();

// ================================================== SERVED URL FORMS
// Pages redirects every route to its trailing-slash form, so that is the
// pathname the app reads back. Index.tsx passes it straight to routeMeta, which
// used to match keys exactly and threw, taking every lens home page down. This
// checks the form a real visitor actually lands on.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  console.log("");
  console.log("served URL forms (as Pages redirects them)");
  for (const route of ["/development", "/infrastructure", "/solutions", "/about", "/projects", "/cv"]) {
    await page.goto(`http://localhost:4395${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(700);
    const state = await page.evaluate(() => ({
      path: window.location.pathname,
      broke: document.body.innerText.includes("This page failed to render"),
      h1: document.querySelector("h1")?.textContent?.trim() ?? null,
    }));
    check(`${route} renders at its served URL`,
      state.broke === false && state.path.endsWith("/") && !!state.h1,
      `landed on ${state.path}, h1=${JSON.stringify(state.h1)}${state.broke ? ", ERROR BOUNDARY" : ""}`);
  }
  await ctx.close();
}

// ============================================================ DESKTOP
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const y = () => page.evaluate(() => Math.round(window.scrollY));

  console.log("\ndesktop 1440x900");
  const coarse = await page.goto("http://localhost:4395/development", { waitUntil: "networkidle" })
    .then(() => page.evaluate(() => window.matchMedia("(pointer: coarse)").matches));
  check("reports a fine pointer", coarse === false, `coarse=${coarse}`);
  await page.waitForTimeout(1800);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);

  // One notch: must ease, not step.
  await page.mouse.move(720, 450);
  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(60);
  const early = await y();
  await page.waitForTimeout(900);
  const settled = await y();
  check("eases rather than stepping", early > 4 && early < 110, `after 60ms y=${early}`);
  check("settles on the full notch", Math.abs(settled - 120) <= 6, `y=${settled}, expected ~120`);

  // Repeated notches accumulate, and never jump a screen.
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(700);
  for (let i = 0; i < 4; i++) { await page.mouse.wheel(0, 120); await page.waitForTimeout(90); }
  await page.waitForTimeout(1000);
  const four = await y();
  check("four notches accumulate to four notches", Math.abs(four - 480) <= 24, `y=${four}, expected ~480`);
  check("never jumps a whole screen", four < 700, `y=${four}`);

  // Regression: an external scroll mid-flight must cancel our momentum, not
  // leave a stale target for the next gesture to stack on top of.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await page.mouse.wheel(0, 480);          // start a long travel
  await page.waitForTimeout(80);
  await page.evaluate(() => window.scrollTo({ top: 2000, behavior: "instant" }));
  await page.waitForTimeout(500);
  const afterJump = await y();
  check("an external jump is not dragged back", Math.abs(afterJump - 2000) <= 6, `y=${afterJump}`);
  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(900);
  const afterJumpNotch = await y();
  check("the next notch continues from the jump, not the stale target",
    Math.abs(afterJumpNotch - 2120) <= 12, `y=${afterJumpNotch}, expected ~2120`);

  // Toggle off -> native.
  const toggle = page.getByRole("button", { name: /smooth scrolling/i });
  check("toggle present on a chapter page", (await toggle.count()) === 1);
  check("toggle on by default", (await toggle.getAttribute("aria-pressed")) === "true");
  await toggle.click();
  await page.waitForTimeout(250);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(60);
  const nativeEarly = await y();
  check("with it off, the notch lands immediately", nativeEarly >= 110, `after 60ms y=${nativeEarly}`);
  await toggle.click(); // restore
  await page.waitForTimeout(200);

  // Landing: three stops, both ways.
  console.log("\ndesktop landing, three stops");
  await page.goto("http://localhost:4395/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2300);
  const max = await page.evaluate(() => Math.round(document.documentElement.scrollHeight - window.innerHeight));
  const notch = async (d) => { await page.mouse.move(720, 450); await page.mouse.wheel(0, d); await page.waitForTimeout(1500); };
  const a0 = await y(); await notch(120);
  const a1 = await y(); await notch(120);
  const a2 = await y(); await notch(-120);
  const a3 = await y(); await notch(-120);
  const a4 = await y();
  check("starts at the top", a0 === 0, `y=${a0}`);
  check("first gesture reaches the choice", a1 > 700 && a1 < max, `y=${a1}`);
  check("second reaches the foot", a2 === max, `y=${a2} max=${max}`);
  check("back up returns to the choice", a3 === a1, `y=${a3}`);
  check("back up again returns to the top", a4 === 0, `y=${a4}`);
  check("no smooth-scroll toggle on the landing", (await page.getByRole("button", { name: /smooth scrolling/i }).count()) === 0);

  await ctx.close();
}

// ============================================================== PHONE
for (const name of ["iPhone 13", "Pixel 5"]) {
  const ctx = await browser.newContext({ ...devices[name] });
  const page = await ctx.newPage();
  const y = () => page.evaluate(() => Math.round(window.scrollY));

  console.log(`\n${name}`);
  await page.goto("http://localhost:4395/development", { waitUntil: "networkidle" });
  await page.waitForTimeout(1600);
  const coarse = await page.evaluate(() => window.matchMedia("(pointer: coarse)").matches);
  check("reports a coarse pointer", coarse === true, `coarse=${coarse}`);

  // Nothing may be intercepted on a phone: scrolling must be instant/native.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.evaluate(() => window.scrollBy(0, 300));
  await page.waitForTimeout(120);
  const moved = await y();
  check("chapter scrolling is native", moved >= 290, `y=${moved}`);

  const snapOnChapter = await page.evaluate(() =>
    getComputedStyle(document.documentElement).scrollSnapType);
  check("chapter pages never snap", snapOnChapter === "none" || !snapOnChapter, `scroll-snap-type=${snapOnChapter}`);

  // Landing: the snap rules must be live, and the hero must not be a target.
  await page.goto("http://localhost:4395/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  const landing = await page.evaluate(() => {
    const root = document.documentElement;
    const choose = document.getElementById("choose");
    const anchor = document.querySelector(".snap-anchor");
    const hero = choose?.previousElementSibling;
    return {
      cls: root.classList.contains("landing-snap"),
      snapType: getComputedStyle(root).scrollSnapType,
      chooseAlign: choose ? getComputedStyle(choose).scrollSnapAlign : null,
      anchorAlign: anchor ? getComputedStyle(anchor).scrollSnapAlign : null,
      heroPosition: hero ? getComputedStyle(hero).position : null,
      heroAlign: hero ? getComputedStyle(hero).scrollSnapAlign : null,
    };
  });
  check("landing carries the snap class", landing.cls === true);
  check("landing snaps on touch", landing.snapType.includes("mandatory"), `scroll-snap-type=${landing.snapType}`);
  check("the choice is a snap target", landing.chooseAlign === "start", `align=${landing.chooseAlign}`);
  check("the anchor is a snap target", landing.anchorAlign === "start", `align=${landing.anchorAlign}`);
  check("the sticky hero is NOT a snap target",
    landing.heroPosition === "sticky" && landing.heroAlign === "none",
    `position=${landing.heroPosition} align=${landing.heroAlign}`);

  await ctx.close();
}

await browser.close();
server.close();
console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
