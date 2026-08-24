# Portfolio Redesign — Implementation Plan

**Repo:** `Umer-Farooq-CS/portfolio`
**Date:** 2026-08-24
**Scope of this document:** Step 1 only — a complete frontend redesign plus engineering upgrade of the existing site, keeping every current feature and making each one better.
**Step 2 (content):** you will hand me new/updated info (experience, projects, links, metrics, photos, CV). That is tracked in `TODO-CONTENT.md` and is **not** part of this step. Nothing here hard-codes content in a way that makes Step 2 painful — all copy stays in `src/data/*`, so Step 2 is a data edit, not a rebuild.

---

## 1. How to read this

- **§3 is the audit** — every real problem in the site today, with file evidence. Read it first; it justifies everything after.
- **§4 is the design direction.** This is the part that decides whether the site looks like a template or like you.
- **§5 is the reference harvest** — exactly what gets taken from landonorris.com, motion.dev, anime.js, KokonutUI, Bklit UI, manus.im, and the public-apis list, and where each lands.
- **§8 is the preservation matrix** — the guarantee that nothing you already have gets lost.
- **§11 is the build order** with acceptance criteria per phase.

---

## 2. What the site is today

**Stack:** Vite 5 + React 18.3 + TypeScript 5.8, Tailwind 3.4, shadcn/ui (49 components vendored), framer-motion 12, react-router 6, TanStack Query 5 (installed, provider mounted, **never used for a single query**), Formspree contact, deployed to GitHub Pages via Actions with `base: "./"` and a `404.html` SPA fallback.

**Routes:** `/`, `/about`, `/services`, `/projects`, `/projects/:slug`, `/thanks`, `*`.

**Homepage:** Hero → About → Services → Projects → Contact, all mounted in `src/pages/Index.tsx`.

**Content model:**
- `src/data/profile.ts` — summary, education, 2 certifications, 5 skill groups.
- `src/data/projects.ts` — 30 projects, 18 distinct free-text category strings, helper functions.
- `src/data/siteLinks.ts` — GitHub / LinkedIn / email / phone / location.
- `master_detailed_cv.tex` — the real source of truth (75 KB), only partially mined into the data files.

**Assets:** `hero-bg.jpg` (337 KB), `me.jpg` (2.0 MB), `Cirq-RAG-Agent.png` (**5.8 MB**).

---

## 3. Audit — everything wrong with the current site

Every item below was verified in the code, not guessed. **P0** = broken/blocking, **P1** = visibly hurts you, **P2** = quality debt.

### A. Design identity — the core problem

| # | Issue | Evidence | Why it matters |
|---|---|---|---|
| A1 **P1** | The site is the generic AI/Lovable default look: one font (Inter), `font-black` at every heading level, blue→violet gradient text, blurred glow orbs, 48px grid pattern, `rounded-2xl` cards everywhere. | `index.css` (`--gradient-text`, `.grid-pattern`, `.shadow-glow`), `HeroSection.tsx:33-35` | A recruiter has seen this exact page fifty times this month. Nothing in the visual language says HPC, GPU, or quantum — it's interchangeable with a crypto landing page. |
| A2 **P1** | **Every section is the same shape:** centered eyebrow → heading with one gradient word → grid of bordered cards. Five sections, one rhythm. | `AboutSection.tsx:52-62`, `ServicesSection`, `ProjectsSection`, `ContactSection:88-104` | No hierarchy, no narrative. Scrolling feels like paging through one repeated component, so nothing sticks. |
| A3 **P1** | Hero **claims** instead of **shows**: a stock-ish background at 20% opacity, the word "Aspiring", and abstract copy ("scalable, accelerated infrastructure"). | `HeroSection.tsx:22-27, 63-84` | You can make a browser do real parallel compute. The hero should prove that in two seconds. "Aspiring" also undersells a Huawei national-finals prize and 30 shipped projects. |
| A4 **P1** | Colour carries no meaning — the same primary blue is HPC, quantum, AI, links, borders, and icons. | `index.css`, all sections | You have three distinct domains. The palette should encode them so a reader learns the system without a legend. |
| A5 **P1** | Hard-coded Tailwind colours outside the token system: `text-cyan-400`, `text-violet-400`, `bg-blue-500/15`, `from-violet-500/20`. | `AboutSection.tsx:96-104`, `ServicesPage.tsx:69-79` | Dark-mode-only values that turn to low-contrast mush in light mode, and make theming impossible. |
| A6 **P2** | Typography has one axis (weight) and no scale. `text-3xl sm:text-4xl lg:text-5xl font-black` is copy-pasted across six files. | `ProjectsPage.tsx:39`, `ServicesPage.tsx:96`, `AboutPage.tsx:37`, `ThanksPage.tsx:24` | Everything shouts at the same volume, which reads as no volume at all. |

### B. Actual bugs

| # | Issue | Evidence | Impact |
|---|---|---|---|
| B1 **P0** | **Two projects are invisible on `/projects`.** The page renders only categories present in a hardcoded `categoryOrder` array; `"Deep Learning & NLP"` and `"High-Performance Computing"` exist in the data but not in that array. | `projects.ts:112` (`rnn-text-generation`), `projects.ts:125` (`parallel-graph-text`) vs `ProjectsPage.tsx:6-23` and `PROJECT_CATEGORIES` | 2 of 30 projects are unreachable except by direct URL. Adding a project with a new category label silently drops it again. |
| B2 **P0** | **`og:image` points to a file that does not exist.** `public/` contains only `favicon.ico`, `favicon.svg`, `placeholder.svg`, `robots.txt`. | `index.html:16, 23` → `/og-portfolio.png` | Every LinkedIn / WhatsApp / Twitter share renders as a blank card. Highest-leverage ten-minute fix on the site. |
| B3 **P0** | `getBasename()` infers the router basename from the **first path segment of the current URL**. On a user site (`username.github.io`), opening `/about` directly sets basename to `/about`, and the router then matches nothing. | `App.tsx:18-25` | Deep links break depending on deploy target. The correct source is `import.meta.env.BASE_URL`, which Vite already injects. |
| B4 **P1** | Homepage projects are a **second, hardcoded copy** of the project list with different fields (`id: "01"`, `objective`, `strategy`) than `src/data/projects.ts`. | `ProjectsSection.tsx:6+` | Two sources of truth that already disagree. Any Step-2 content edit must be made twice, and one will be forgotten. |
| B5 **P1** | Footer hardcodes `mailto:`, `tel:`, LinkedIn and GitHub URLs instead of importing `SITE_LINKS`; `ContactSection` does the same. | `Footer.tsx:18-66`, `ContactSection.tsx:55-77` | Three places to update one email address. |
| B6 **P2** | Theme is component state — not persisted, ignores `prefers-color-scheme`, resets to dark on reload. | `Layout.tsx:7-16` | A visitor who chooses light mode loses it on the next navigation. |
| B7 **P2** | Dead files in the repo: `src/App.css` (never imported), `src/components/NavLink.tsx` (never imported), and 37 of 49 vendored shadcn components unused. | verified by grep | Noise that makes the repo look padded rather than crafted — and reviewers of a portfolio *do* read the repo. |
| B8 **P2** | Hash-scroll logic is duplicated across `Layout` and `Index` and depends on a `requestAnimationFrame` + `setTimeout(…, 100)` race. | `Layout.tsx:20-22`, `Index.tsx:11-26` | `/#contact` from another page works by timing luck, not design. |

### C. UX and content gaps

| # | Issue | Impact |
|---|---|---|
| C1 **P1** | `/projects` is a flat wall of 30 cards in 16 manually-ordered groups. No search, no filter, no tech-tag facets, no sort, no featured/archive split, no counts. | With 30 projects the index is a chore, so nobody finds the three that would get you hired. |
| C2 **P1** | Project detail pages are three bullet lists (Overview / Key Architecture / Technologies). No metrics band, no charts, no code, no diagrams (except one 5.8 MB PNG), no prev/next, no share, no repo stats. | Your strongest material — "92% vs 52% baseline", "6× with Tensor Cores", "20+ qubits", "30%+ improvement" — is buried inside prose instead of being the headline. |
| C3 **P1** | No CV/résumé download anywhere, despite `master_detailed_cv.tex` sitting in the repo. | The first thing a recruiter looks for is missing. |
| C4 **P1** | No proof layer: no GitHub activity, no repo stats, no contribution graph, no testimonials — despite 100+ Fiverr deliveries at 98% satisfaction and Level 2 Seller status. | Every claim on the site is unverifiable self-assertion. |
| C5 **P1** | Contact form has no client-side validation (`react-hook-form` and `zod` are both installed and unused), no spam protection, no inline success state, no error announcement. | `ContactSection.tsx:19-52, 227-245` |
| C6 **P2** | Services are three static description cards. There is no path from "I have this problem" to "message Umer about it". | The page describes; it doesn't convert. |
| C7 **P2** | Inconsistent numbers across pages: "100+ Projects Delivered" (`AboutSection:47`) vs "50+ full-stack…projects" (`AboutPage:236`); the award is dated 2024 in the timeline but the project period reads "Mar 2025 – Present". | Contradictions on a résumé site read as carelessness. |
| C8 **P2** | `line-clamp-1` on project titles and `line-clamp-2` on subtitles truncate with no way to see the full text. | `ProjectsPage.tsx:76, 85` |
| C9 **P2** | The 404 page is unstyled plain text with no search or suggestions. | `NotFound.tsx` |

### D. Accessibility

| # | Issue | Evidence |
|---|---|---|
| D1 **P0** | **Form labels are not associated with their inputs** — `<label>` has no `htmlFor`, inputs have no `id`. | `ContactSection.tsx:165-217` |
| D2 **P0** | **No `prefers-reduced-motion` handling anywhere.** Every page runs entry animations, plus `animate-bounce`, `animate-float`, `animate-pulse-glow` looping forever. | `tailwind.config.ts:104-112`, all 11 framer-motion files |
| D3 **P1** | No skip-to-content link; no visible focus styling beyond browser defaults on custom buttons. | `Layout.tsx`, `Header.tsx` |
| D4 **P1** | Mobile menu is a plain `<div>`: no focus trap, no `Escape`, no `aria-expanded`/`aria-controls`, no focus restore. | `Header.tsx:118-155` |
| D5 **P1** | Theme toggle is a bare `<button>` with `aria-label` only — no `aria-pressed` — and its hit area is 48×24px. | `Header.tsx:100-124` |
| D6 **P1** | Icon-only footer links use `title` instead of an accessible name. | `Footer.tsx:22-67` |
| D7 **P2** | Form status changes aren't announced (no `aria-live`), so screen-reader users never learn the send failed. | `ContactSection.tsx:222-227` |
| D8 **P2** | Light mode is effectively untested — hardcoded `*-400` accents on light backgrounds fail WCAG AA. | see A5 |

### E. Performance

| # | Issue | Evidence | Impact |
|---|---|---|---|
| E1 **P0** | **`Cirq-RAG-Agent.png` is 5.8 MB**, imported eagerly by the data module. `me.jpg` is 2.0 MB and renders as a 64×64 avatar on the homepage. | `projects.ts:2`, `AboutSection.tsx:76-81` | ~8 MB of images for a text site. Homepage LCP on 4G is measured in seconds. A 64px avatar served from a 2 MB JPEG is the definition of unoptimized. |
| E2 **P1** | No responsive images: no `srcset`, no AVIF/WebP, no intrinsic `width`/`height`, no `loading="lazy"`. | all `<img>` usages | Guaranteed layout shift and wasted mobile bytes. |
| E3 **P1** | No route-level code splitting — every page, framer-motion, and all vendored UI ship in one bundle. | `App.tsx` static imports | First paint pays for pages nobody opens. |
| E4 **P2** | Fonts loaded via a blocking `@import` inside CSS, with 7 weights of Inter. | `index.css:1` | Render-blocking request chain; most weights unused. |
| E5 **P2** | `hmr.overlay: false` hides runtime errors in development. | `vite.config.ts:11` |

### F. SEO / metadata / sharing

| # | Issue |
|---|---|
| F1 **P0** | Every route shares one `<title>` and one description — `/projects/qcanvas` and `/about` are indistinguishable to Google and in a browser tab. No per-route meta, no canonicals. |
| F2 **P0** | `og:image` 404s (B2). |
| F3 **P1** | No `sitemap.xml`, no JSON-LD (`Person`, `CreativeWork`, `BreadcrumbList`) — no rich results, no entity link to your GitHub/LinkedIn. |
| F4 **P2** | No `theme-color`, no `apple-touch-icon`, no web manifest. |

### G. Data integrity

| # | Issue |
|---|---|
| G1 **P1** | The category taxonomy is free text with 18 near-duplicate values (`"High-Performance Computing"`, `"…& GPU"`, `"…& Quantum"`, `"Full-Stack"`, `"Full-Stack / Backend"`, `"Distributed Systems"`, `"…& Networking"`, `"Deep Learning"`, `"…& NLP"`). This is the root cause of B1. |
| G2 **P1** | No schema validation on content files, so a typo produces a silently broken page instead of a build error. |
| G3 **P2** | Project metrics live inside prose strings, so they can't be rendered as data (charts, badges, comparisons). |

### H. Engineering hygiene / CI

| # | Issue |
|---|---|
| H1 **P1** | The deploy workflow runs **only** `npm run build` — no lint, no typecheck, no tests gate a deploy. |
| H2 **P1** | The entire test suite is `expect(true).toBe(true)`. |
| H3 **P2** | No error boundary — one runtime error blanks the whole site. |
| H4 **P2** | Three lockfiles for two package managers (`package-lock.json`, `bun.lock`, `bun.lockb`). |

---

## 4. Design direction — "Telemetry"

### 4.1 The thesis

You build systems whose entire point is **measured performance**: 6× with Tensor Cores, 92% against a 52% baseline, 20+ qubits, 30%+ faster. So the site isn't a brochure with a photo — it's an **instrument that reads out a working system**, and every claim arrives attached to a measurement.

One rule drives every visual decision:

> **Nothing is decorative. Every mark on the page either is data, labels data, or measures the grid.**

That is the exact opposite of today's site, where the gradient, the orbs, and the grid pattern are decoration with no referent.

### 4.2 Palette — six named values, each with a meaning

Derived from your two physical domains: **hot silicon** (GPU/HPC) and **cold qubits** (quantum). Not a random blue→violet gradient.

```
--bench      #E9EAEC   anodized panel grey — light-mode ground
--paper      #F7F8F9   raised surface (panels, cards)
--ink        #0B0D10   text; becomes the ground in dark mode
--graphite   #5A6169   secondary text, hairlines, axis labels
--thermal    #FF5A1F   compute / GPU / HPC + the single primary action
--cryo       #14A3C7   quantum / cryogenic / simulation
```

Dark mode ("Rack"): ground `#08090B`, panel `#101317`, text `#E7E9EC`, hairline `#23272D`, with both accents raised ~8% in luminance to hold AA.

**Accent rules — the memorable part:**
- `--thermal` appears **only** on compute/HPC/GPU content and on the one primary action per view.
- `--cryo` appears **only** on quantum/simulation content.
- **AI/agentic content gets no accent at all** — ink plus mono labels. Everyone else's AI section is the loudest thing on their page; yours is the quietest, which is what confidence looks like.
- Charts inherit the same two hues, and "measured vs. ideal" is *always* thermal against graphite. One rule, every chart.

**Why this isn't the AI default:** it's neither cream + serif + terracotta, nor near-black + acid green (which is also, not coincidentally, the Lando Norris lime — deliberately not copied), nor broadsheet hairlines. Light mode leads, which by itself separates it from ~90% of developer portfolios.

### 4.3 Type — three roles, three faces

| Role | Face | Use |
|---|---|---|
| Display | **Archivo Expanded** (variable width 62.5–125%, weight 100–900) | Headlines set **wide, not heavy** — 600–700 weight at 110–125% width. Industrial signage / equipment labelling. Sentence case. |
| Body | **Inter Tight** | Paragraphs and project prose. Tighter and less default-feeling than Inter, still perfectly legible small. |
| Data | **IBM Plex Mono** | Every number, unit, axis label, section index, telemetry readout, tech tag, code snippet. 11–12px, uppercase, +0.08em tracking for labels. |

All three are on Google Fonts, self-hosted as subsetted `woff2` with `font-display: swap` and preload — no blocking `@import` (fixes E4). Alternates if you dislike the primary: **Bricolage Grotesque** (more character) or **Familjen Grotesk** (quieter). Scale: eight `clamp()` steps defined once as tokens. `font-black` disappears from the codebase.

### 4.4 Layout — the instrument panel

```
DESKTOP >=1280px
+----------+----------------------------------------------------------+
| RAIL     |                                                          |
| 96px     |   CONTENT - 12 col, hairline column ticks at seams        |
|          |                                                          |
| -- idx   |   +------------------------------------------------+     |
| 01 bench |   |                                                |     |
| 02 work  |   |   full-bleed instrument (hero)                  |     |
| 03 proof |   |                                                |     |
| 04 about |   +------------------------------------------------+     |
| 05 talk  |   +---------------+--------------------------------+     |
|          |   | spec sheet    |  dense two-col (about/skills)  |     |
| -- live  |   +---------------+--------------------------------+     |
| PKT 21:14|   +------------------------------------------------+     |
| 8 cores  |   |  wide gallery (work)                           |     |
| 6.4x     |   +------------------------------------------------+     |
| o open   |        narrow measured column (notes)                    |
+----------+----------------------------------------------------------+

MOBILE
+----------------------------+
| ####........ scroll prog   |  <- 2px thermal progress bar
|  UF            moon    =   |
+----------------------------+
|  stacked chapters,         |
|  one instrument per screen |
+----------------------------+
|  [ Talk to me ]  sticky    |  <- one persistent action
+----------------------------+
```

- **Left rail** (desktop): the section index in mono *plus* a live telemetry block (Islamabad time, cores detected, last benchmark result, availability dot). It is the navigation and the status display at once — one element doing two jobs, which is why it reads as engineered rather than ornamental.
- **Column ticks:** hairline marks at section seams that expose the real 12-column grid. They measure the page instead of decorating it.
- **Deliberately varied section rhythm:** full-bleed → dense two-column → wide gallery → narrow column → panel. No two adjacent sections share a shape (fixes A2).
- **Numbering only where content is genuinely sequential.** The Cirq-RAG pipeline (Designer → Validator → Optimizer → Educator) is a real sequence, so it gets numbers. Project categories are not a sequence, so they don't.

### 4.5 Motion policy

One page-load orchestration, then motion only in response to input or as data.

| Layer | Tool | What |
|---|---|---|
| Page load | **anime.js timeline** | Rail ticks draw → headline splits in by word → benchmark axis draws → first data point lands. One choreographed ~900ms moment, once. |
| Scroll | **Motion** `useScroll`/`useTransform` | Chapter headers pin briefly and hand off; charts draw on entry; the rail index tracks position. |
| Route change | **Motion** `AnimatePresence` + `layoutId` | Project card → project detail is a shared-element transition: the card *becomes* the page header. |
| Micro-interaction | **Motion** springs | Hover, press, toggle, drag — three tokenized spring presets, no ad-hoc curves. |
| Data motion | **Bklit/visx + Motion** | Chart draw-in, value counters, live readouts. |
| Reduced motion | `useReducedMotion` + a `MotionPolicy` provider | Every animation reads one policy value. `prefers-reduced-motion` → transforms off, opacity-only crossfades, benchmark shows a precomputed result behind a manual "Run it" button. Fixes D2 globally instead of per component. |

### 4.6 Copy voice

Measured, specific, no hype. Present tense, active voice, sentence case.

- "Aspiring HPC & Quantum Infrastructure Engineer" → **"I make slow systems fast, and hard systems runnable."** with a mono subline: `HPC · GPU · quantum simulation · agentic AI — Islamabad, PKT`
- Every service becomes a problem in the visitor's words ("Your training job takes nine hours"), not a capability noun ("HPC Optimization").
- Empty and error states give direction, never mood: "Formspree isn't configured yet — email me directly at …" instead of a generic failure.

### 4.7 Signature elements — three, in priority order

**① `SpeedupBench` — the hero. The one thing the site is remembered by.**

The hero is a **live benchmark that runs on the visitor's machine.** On load it reads `navigator.hardwareConcurrency`, spawns a Web Worker pool, and runs one real workload (tiled matrix multiply / N-body step) at 1…N workers. It plots **measured speedup** against the **ideal linear curve** and an **Amdahl fit**, and prints the readout in mono:

```
cores 8 · threads 1->8 · speedup 6.4x · efficiency 80% · 41 ms

   8x                                    _____ ideal
                                    ____/
                                ___o  measured
   4x                    ___o___/
                 ___o___/
   1x       o__o/
        1   2   3   4   5   6   7   8   workers
```

The headline sits beside it. Caption: *"That ran on your machine, just now. Making that curve bend the right way is the job."*

Why this instead of a big number with a gradient: it turns the page from a claim into a demonstration, it can't be templated, and it is precisely your subject matter. Guardrails: ≤400ms auto pass, cancels on scroll-away, skipped entirely under reduced-motion / `hardwareConcurrency <= 2` / `saveData`, with a precomputed fallback curve and a manual trigger.

**② `CircuitSandbox` — on `/lab`.** Drag H / X / Z / CNOT gates onto three qubits (anime.js `createDraggable` with physics and snap-to-slot), watch the statevector and measurement probabilities update live, and copy out **real OpenQASM 3.0 / Qiskit / Cirq** source. A miniature QCanvas — your award-winning project, playable in the browser, in ~250 lines of TypeScript with no backend.

**③ `PipelineTrace` — on the Cirq-RAG project page.** The multi-agent pipeline as an animated SVG (anime.js `createDrawable` line drawing) where a real prompt flows Designer → Validator → *(validation fails, the retry fires visibly)* → Optimizer → Educator, paying off in the 92% / 52% comparison. **This replaces the 5.8 MB PNG:** smaller, sharper, theme-aware, and it explains the retry loop a static diagram can't.

Everything else stays disciplined and quiet so these three land.

---

## 5. Reference harvest — what comes from where

### 5.1 landonorris.com (OFF+BRAND — Awwwards SOTY/SOTM/SOTD, FWA of the Day)

| Taken | Where it lands | Benefit |
|---|---|---|
| **Chaptered scroll narrative** — a sequence of cinematic chapters, not a stack of sections | Homepage restructured into five chapters with pinned handoffs | Fixes A2: the page gains rhythm and a beginning/middle/end |
| **Type as the primary graphic device** — huge, confident headline scale | Archivo Expanded display scale; headline *is* the hero art | Removes the need for decorative gradients; the words carry the page |
| **One signature hero object** (the rotating helmet) | Replaced by `SpeedupBench` — a *data* object rather than a product object, because your product is performance | Same structural role, on-brand, ~40 KB of canvas instead of a WebGL payload |
| **"Hall of Fame" gallery** (helmets by year, base→hover image pairs) | `/projects` gallery: hover swaps each card from title-state to metrics-state | Turns a boring index into something people scrub through (fixes C1) |
| **"ON TRACK / OFF TRACK" dual navigation** | **"In compute / Off compute"** — engineering work vs. the human side (gaming, table tennis, NaSCon, community) | Holds your personality without a cringey "Hobbies" card |
| **Persistent context chip** ("next race") | Rail telemetry: availability + Islamabad local time + response window | An always-current reason to contact you, on every screen |
| **Performance discipline** (lazy loading, optimized delivery, streamlined code) | All of §12 | Their site is heavy *and* fast; that's the bar |
| **Rive-style motion graphics** | Not adopted as Rive — same effect via anime.js SVG timelines | Zero extra runtime dependency, theme-aware, editable in code |

**Deliberately not taken:** the lime-on-black palette (also the generic AI look), the WebGL 3D pipeline (wrong cost/benefit for a static-hosted portfolio), and the merch/social-feed sections (no equivalent content).

### 5.2 motion.dev (Motion for React — successor to framer-motion)

You're already on framer-motion 12, so this is a **package rename**, not a rewrite: `npm i motion`, then `import { motion } from "motion/react"` in 11 files.

| Feature | Where | Benefit |
|---|---|---|
| `useScroll` + `useTransform` + `MotionValue` | Chapter transitions, rail progress, gallery parallax | Scroll-*linked* rather than merely scroll-triggered — the difference between "fades in" and "feels engineered" |
| `layoutId` shared-element transitions | Project card → `/projects/:slug` header | The biggest perceived-quality upgrade available: the card becomes the page instead of a jump cut |
| `AnimatePresence` | Route transitions, mobile nav, form success | Replaces the hard `window.scrollTo(0,0)` jumps (B8) |
| Hybrid WAAPI engine, independent transforms | All micro-interactions | Hardware-accelerated, 120fps-capable |
| `useReducedMotion` | The `MotionPolicy` provider | One-line correct behaviour for D2 |
| Springs (3 tokenized presets) | Hover / press / drag | Consistent physical feel instead of 20 hand-written durations |

### 5.3 anime.js v4

Added as `animejs@4` for what Motion is awkward at. React integration via the documented `createScope({ root })` + `scope.current.revert()` cleanup pattern.

| Module | Where | Benefit |
|---|---|---|
| `createTimeline` | Page-load orchestration | Precise multi-target sequencing with offsets — far cleaner than nested framer delays |
| `text` (split + scramble) | Headline reveal; mono readouts scrambling into their final values | The scramble is what makes the telemetry feel *live* |
| `svg.createDrawable` + `morphTo` | `PipelineTrace` arrows drawing themselves; gate glyph morphs in the sandbox | Replaces the 5.8 MB PNG with a self-drawing diagram |
| `createDraggable` (physics + snap) | `CircuitSandbox` gate dragging | Real inertia and snapping, free |
| `utils.stagger` | Project grid, skill matrix entry | Rhythm without hand-written delay math |
| `ScrollObserver` | Chart draw-in triggers | Keeps chart animation out of React render |
| `animatable` | Live-updating benchmark values | Smooth interpolation of streaming numbers |

### 5.4 KokonutUI (kokonutui.com)

100+ free MIT components, shadcn-registry install (`@kokonutui/…`), built on Tailwind **v4** + Motion. The repo already uses shadcn conventions and `components.json`, so this drops straight in — **after** the Tailwind 4 upgrade (§9).

| Taken | Where | Benefit |
|---|---|---|
| Particle / attract / hover-effect buttons | Primary CTAs (hero, contact, CV download) | High-craft micro-interaction on the three buttons that matter, without hand-rolling |
| Animated card family | Work gallery cards, intent cards | Consistent hover/press behaviour across every card |
| AI-style input / smart textarea | Contact form message field | Auto-grow, counter, polished focus state |
| Toast / notification patterns | Form success, copy-to-clipboard confirmations | Replaces today's doubled `Toaster` + `Sonner` setup |
| Beam / spotlight / grid backdrops | **One** instance only, behind the contact panel | Atmosphere in exactly one place instead of glow orbs on every section |

Rule: components are vendored into `src/components/ui/` and **retokenized to our palette on the way in**. Nothing ships with Kokonut's default colours.

### 5.5 Bklit UI (bklit.com)

17+ chart types on **visx + Motion**, MIT, shadcn registry (`@bklit/…` → `https://ui.bklit.com/r/{name}.json`), with a Studio playground for tuning. Requires shadcn/ui (present) and targets Tailwind 4 (§9). **Replaces recharts**, which is installed but only referenced by an unused `ui/chart.tsx`.

| Chart | Renders | Why it beats prose |
|---|---|---|
| Line + area | `SpeedupBench` measured-vs-ideal; MNIST V1→V5 timings | Your speedups become a shape you can see |
| Bar (grouped) | Cirq-RAG 92% vs 52%; gate count before/after optimization | The headline result of your best project *becomes* the headline |
| Gauge | Kernel occupancy, parallel efficiency | Instrument-panel language, literally |
| Heatmap | GitHub contribution graph; roofline grid | Proof of consistent activity (C4) |
| Radar | Skill matrix across HPC / quantum / AI / full-stack / systems | Replaces five bullet-list cards with one readable figure |
| Sankey | Cirq-RAG agent/token flow; MPI rank communication | Shows *architecture*, which bullets cannot |
| Candlestick / scatter | Benchmark run distributions (p50/p95, variance) | Signals you know one number isn't a measurement |
| `shimmering-text` | Live telemetry values | Ties the readouts into the chart system |

### 5.6 manus.im

| Taken | Where | Benefit |
|---|---|---|
| **Task-prompt entry cards** ("Create slides / Build website / Design") | Services becomes six **intent cards**: *Speed up a CUDA kernel · Parallelize a pipeline · Simulate a circuit · Build a RAG system that doesn't hallucinate · Ship a full-stack app · Review my architecture*. Each deep-links to `/services#<intent>` **and pre-fills the contact form's subject and message template.** | Converts C6 from a description into a funnel — the biggest functional upgrade on the site |
| Progressive disclosure ("More / Less") | Project detail: Overview always visible; Architecture / Results / Code / Retro expand | Depth without a wall of text (fixes C2 without longer pages) |
| Comparison pattern ("VS ChatGPT / VS Lovable") | **Before → After** tables on project pages: baseline vs. optimized, delta computed | Frames your work as measured improvement, which is how an HPC hire is judged |
| Restrained SaaS clarity — one nav, one action per view | Global: one primary action per screen, in `--thermal` | Removes today's "two equal CTAs plus three floating badges" ambiguity in the hero |
| Multi-surface availability | Rail: GitHub / LinkedIn / email / CV always reachable | Every screen has an exit to contact |

### 5.7 public-apis — what's actually usable (verified live, today)

I tested CORS and auth on every candidate rather than trusting the list:

| API | Auth | CORS (verified) | Use | Status |
|---|---|---|---|---|
| **GitHub REST** `api.github.com` | none for public data | `Access-Control-Allow-Origin: *` ✅ (`X-RateLimit-Limit: 60`/hr/IP) | Live repo stats, stars, languages, recent commits, "last shipped". Your account today: 24 public repos, 14 followers. | **In scope** — client-side, with a build-time snapshot fallback |
| **jogruber contributions** `github-contributions-api.jogruber.de/v4/…` | none | `*` ✅ | Contribution heatmap (Bklit heatmap) | **In scope**, snapshot fallback (third-party uptime) |
| **Open-Meteo** `api.open-meteo.com` | none | `*` ✅ | Islamabad conditions in the rail — a small, honest "real person in a real place" signal | **In scope** |
| **arXiv** `export.arxiv.org/api/query` | none | ❌ **no CORS header** (verified: HTTPS 200, Atom XML, no `Access-Control-Allow-Origin`) | "Reading now" — latest `quant-ph` + `cs.DC` papers | **In scope, build-time only** — fetched by the Action, never from the browser |
| Local time (Islamabad) | — | — | Rail clock | **No API needed** — PKT is UTC+5, no DST; computed client-side. WorldTimeAPI here would be a pointless dependency. |
| Lanyard (Discord presence) | none | ✅ | "currently online / listening to" | **Out of scope** — cute, wrong signal for infra roles |
| Agify / Genderize / Bored / CountAPI | none | ✅ | — | **Rejected** — novelty APIs would cheapen the instrument concept |

**The engineering story matters as much as the data.** GitHub Pages is static, so:

1. `scripts/fetch-data.mjs` runs in **GitHub Actions** (on push + daily cron), calls GitHub / contributions / arXiv, validates every response with **zod**, and writes `src/data/generated/*.json`.
2. The build embeds that snapshot, so the page paints instantly with real data — even with client requests blocked.
3. In the browser, **TanStack Query** (installed, currently unused) revalidates the CORS-safe sources and swaps in fresher numbers with the snapshot as `initialData`. Stale-while-revalidate, with a visible `updated 3h ago` in mono.
4. If a source is down, the build keeps the last good snapshot instead of failing — the pipeline degrades, the site doesn't.

That's a real data pipeline with validation, caching, and graceful degradation on a free static host: the backend half of your skill set, demonstrated rather than asserted.

---

## 6. Optional Phase B — the live backend showcase

The build-time pipeline above covers "data engineering on a static host". If you want a running service in the story, one small addition does it — **kept optional and separate so GitHub Pages stays the primary deploy**:

A **Cloudflare Worker** (free tier) at `api.<yourdomain>`:
- `POST /contact` — zod validation, Turnstile check, KV rate limit by IP, forward to Formspree/Resend. Removes the Formspree ID from the client bundle and kills form spam.
- `GET /github` — proxies GitHub with a server-side token: **5,000 req/hr instead of 60**, 10-minute edge cache.
- `GET /arxiv` — server-side fetch + XML→JSON, solving the CORS problem properly and making the feed live rather than daily.
- `GET /views/:slug` — KV counter, so project pages can show real read counts.
- `/openapi.json` plus a `/lab/api` page documenting it, so a reviewer can *see* your API design.

Cost $0, roughly a day of work. Decision in §13 — nothing else in this plan depends on it.

---

## 7. Information architecture

**Every current route is preserved.** Nothing 404s after the redesign.

| Route | Today | After |
|---|---|---|
| `/` | Five identically-shaped sections | Five **chapters**: `01 Bench` (hero + live benchmark) → `02 Work` (three selected projects, full-bleed) → `03 Proof` (live GitHub, contribution heatmap, skill radar, certifications) → `04 About` (spec sheet + "in compute / off compute") → `05 Talk` (intent cards + contact panel) |
| `/about` | Long single-column card stack | Spec-sheet layout: portrait + measured bio, education, certifications with verify links, a real timeline, "off compute", CV download |
| `/services` | Three static cards | Six **intent cards** (manus pattern), each expanding to scenarios / outcomes / keywords, each pre-filling the contact form |
| `/projects` | Flat wall, 16 hardcoded groups, 2 projects invisible | Gallery with **search + tech-tag facets + domain filter + sort**, per-group counts, featured strip, hover metrics-state, keyboard navigable, **taxonomy-driven so nothing can go invisible again** |
| `/projects/:slug` | Three bullet lists | Metrics band → architecture diagram → progressive-disclosure sections (Overview / Architecture / Results / Code / Retro) → before-after table → charts → repo stats → prev/next → share → per-page meta + JSON-LD |
| `/thanks` | Kept | Kept **plus** an inline success state, so submitting no longer requires leaving the page (the route stays for the Formspree redirect path) |
| `*` | Unstyled text | Designed 404 with project search and three suggestions |
| **`/lab`** | — | **New.** `SpeedupBench` (full, configurable), `CircuitSandbox`, `PipelineTrace`, roofline explorer. Your playground. |
| **`/cv`** | — | **New.** Generated from `profile.ts` + `projects.ts`, print stylesheet matching your LaTeX CV, one-click PDF plus a direct `.pdf` download. |
| **`/uses`** | — | **New (small).** Hardware, toolchain, editor, GPU, distro. Cheap credibility with infra people. |
| **`/notes`** | — | **New, scaffolded empty.** MDX-ready writing section for Step 2. Hidden from nav until it has two posts. |

---

## 8. Preservation matrix — nothing gets lost

| Existing feature | Outcome | How it gets better |
|---|---|---|
| Formspree contact form + `/thanks` redirect | **Kept, improved** | zod + react-hook-form validation, honeypot + time-trap, `aria-live` status, inline success, retry on failure, labels correctly associated, subject pre-filled from intent cards, mailto fallback preserved |
| `VITE_FORMSPREE_FORM_ID` env flow + repo secret + workflow wiring | **Kept as-is** | Unchanged; the optional Worker path sits behind a flag and never replaces it |
| All 30 projects and every field (`description`, `technologies`, `architectureHighlights`, `award`, `period`, `githubUrl`, `image`) | **Kept, all of it** | The two currently-invisible ones become visible; metrics get extracted into typed fields so they can render as data; nothing is deleted |
| Project detail: Overview / Key Architecture / Technologies | **Kept, expanded** | Same content, better typography, plus metrics band, charts, before/after, prev/next, share |
| Category grouping on `/projects` | **Kept, fixed** | Becomes a typed taxonomy with counts; adding a project can no longer hide it |
| Homepage featured-projects section | **Kept, deduplicated** | Reads `getFeaturedProjects()` from `data/projects.ts` — one source of truth (fixes B4) |
| `profile.ts` (summary, education, certifications, five skill groups) | **Kept, all of it** | Certifications gain verify links and issuer marks; skills additionally render as a radar chart |
| About page timeline, "What I'm looking for now", the personal paragraph | **Kept** | Timeline becomes a real timeline component; hobbies become "off compute" |
| Dark mode toggle | **Kept, fixed** | Persisted, respects system preference, no flash on load, `aria-pressed`, larger hit area — and light mode actually works |
| `SITE_LINKS` (GitHub, LinkedIn, email, phone, location) | **Kept, enforced** | Every link imports from here; hardcoded duplicates in Footer/Contact removed |
| Header nav, `/#contact` hash link, mobile menu | **Kept, rebuilt** | Rail + top bar, focus-trapped mobile sheet, reliable hash scrolling without the timeout race |
| Footer with social icons + scroll-to-top | **Kept** | Accessible names, tokenized, plus CV, `/uses`, and a last-deploy timestamp |
| Scroll-to-top on navigation | **Kept, improved** | Becomes proper scroll restoration (back returns you where you were) |
| shadcn/ui + Tailwind + `cn()` conventions | **Kept** | Same conventions; unused components pruned; Kokonut/Bklit install through the same registry mechanism |
| framer-motion animations | **Kept, migrated** | Same API under `motion/react`, plus reduced-motion compliance |
| TanStack Query provider | **Kept, finally used** | Powers the live data layer |
| Vite + GitHub Pages + `base: "./"` + `404.html` fallback + Actions deploy | **Kept** | Plus lint/typecheck/test gates and the data-fetch step |
| `me.jpg`, `hero-bg.jpg`, `Cirq-RAG-Agent.png` | **Kept as sources** | Converted to responsive AVIF/WebP sets (8 MB → ~250 KB total); the Cirq PNG also gains an SVG replacement, with the original still downloadable at full res |
| `master_detailed_cv.tex` | **Kept, mined further** | Becomes the source for `/cv` and the PDF download |
| Vitest setup | **Kept, filled in** | Real tests replace the placeholder |

---

## 9. Stack changes and migration

| Change | Why | Risk / handling |
|---|---|---|
| **Tailwind 3.4 → 4.x** (`@tailwindcss/vite`, CSS-first `@theme`) | KokonutUI requires v4; Bklit is built on v4; we also gain container queries, faster builds, native CSS-variable tokens | Medium. `tailwind.config.ts` becomes `@theme` in CSS; `tailwindcss-animate` swapped for the v4 equivalent. Own commit, with a visual diff pass over all seven pages. Fallback: hand-port Kokonut/Bklit components to v3 (~1 day, keeps v3). |
| **React 18.3 → 19.x** | Both registries target React 19; Radix, Motion, and shadcn all support it | Low–medium. `react-day-picker@8`, `vaul@0.9`, and `recharts@2` have React 19 peer issues — **all three are unused** and get removed anyway. |
| **framer-motion → motion** | motion.dev is the maintained successor; identical API | Low. Import-path change in 11 files. |
| **+ animejs@4** | Timelines, SVG drawing, draggable physics, text splitting | Low. ~18 KB tree-shaken, used via `createScope` with proper cleanup. |
| **+ @kokonutui, @bklit registries** | Micro-interactions and charts | Low. Vendored into `src/components/ui/`, retokenized on entry. |
| **− recharts, react-day-picker, vaul, embla-carousel, input-otp, cmdk (if unused), and 37 unused shadcn components** | Dead weight | Low. Verified: only 12 of 49 `ui/` components are imported today. |
| **+ self-hosted fonts** (`@fontsource-variable/archivo`, `inter-tight`, `ibm-plex-mono`) | Kills the blocking `@import`, subsets to what we use | Low |
| **+ image pipeline** (`vite-plugin-image-optimizer`, or pre-generated AVIF/WebP + `srcset`) | 8 MB → ~250 KB | Low |
| **+ per-route meta** (a ~30-line `useDocumentMeta` hook; `react-helmet-async` only if needed) | Fixes F1 | Low — prefer the hook, no dependency |
| **+ zod schemas on content** | Fixes G2 and B1 at build time | Low |
| **+ error boundary** | Fixes H3 | Low |
| **Lockfile cleanup** — one package manager | Fixes H4 | Low. Recommend npm (the Action already runs `npm ci`); delete `bun.lock*`. |

---

## 10. Components to build

**Shell:** `AppShell`, `Rail` (index + telemetry), `TopBar`, `MobileSheet` (focus-trapped), `ScrollProgress`, `SkipLink`, `ThemeProvider` (persisted, no flash), `MotionPolicyProvider`, `ErrorBoundary`, `PageMeta`, `JsonLd`.

**Primitives (retokenized):** `Button` (thermal / ghost / quiet), `Panel`, `Hairline`, `ColumnTicks`, `MonoLabel`, `Readout`, `Metric`, `Tag`, `Disclosure`, `CopyButton`, `Marquee`.

**Signature:** `SpeedupBench` + `bench.worker.ts` + `useBenchmark`; `CircuitSandbox` + `statevector.ts` + `qasmExport.ts`; `PipelineTrace`.

**Charts (Bklit-based):** `SpeedupChart`, `BeforeAfterBars`, `SkillRadar`, `ContributionHeatmap`, `OccupancyGauge`, `PipelineSankey`, `RunDistribution`.

**Content:** `ChapterHeader`, `WorkCard` (title↔metrics hover states), `WorkGallery` (search / facets / sort), `ProjectHeader`, `MetricsBand`, `BeforeAfterTable`, `CodeBlock` (copy + language label), `Timeline`, `CertCard`, `IntentCard`, `ContactPanel`, `ContactForm`, `CvDocument`, `PrevNext`, `ShareRow`.

**Data:** `src/lib/api/{github,contributions,weather}.ts`, `src/data/generated/*.json`, `src/data/schema.ts` (zod), `scripts/{fetch-data,gen-sitemap,gen-og}.mjs`.

---

## 11. Execution plan

### Phase 0 — Foundations and bug fixes (no visual change yet)
1. Fix B3 (`getBasename()` → `import.meta.env.BASE_URL`), B2 (generate a real `og-portfolio.png`), B1 (typed taxonomy; both hidden projects visible).
2. Delete `App.css`, `NavLink.tsx`, 37 unused `ui/` components, extra lockfiles.
3. Single source of truth: `ProjectsSection` reads `getFeaturedProjects()`; Footer and Contact import `SITE_LINKS`.
4. zod schemas for `profile.ts` / `projects.ts`, plus a **data-integrity test that fails the build if any project's category isn't in the taxonomy** — so B1 can never come back.
5. Theme provider: localStorage + `prefers-color-scheme` + inline no-flash script.
6. Image pipeline: AVIF/WebP + `srcset` + intrinsic dimensions; 8 MB → ~250 KB.
7. Self-hosted fonts; drop the CSS `@import`.
8. Accessibility floor: skip link, focus-visible tokens, form `htmlFor`/`id`, `aria-pressed`, `aria-live`, accessible names on icon links, `MotionPolicyProvider` + reduced-motion gate.
9. Route-level `React.lazy` + Suspense; error boundary; per-route meta hook; sitemap + JSON-LD scripts.
10. CI: lint + typecheck + test + build before deploy; Lighthouse CI budget.

**Done when:** Lighthouse ≥95 in all four categories on `/`, zero axe violations, all 30 projects reachable, `npm test` covers routing and data integrity — and the site still looks *identical* to today, which is what proves the refactor was safe.

### Phase 1 — Design system and shell
Tailwind 4 + `@theme` tokens (palette, type scale, spacing, radii, springs) → font roles → `AppShell` + `Rail` + `TopBar` + `MobileSheet` + `ScrollProgress` → primitives → Motion migration to `motion/react` + anime.js scope setup → a dev-only `/design` route showing every token and component in both themes.

**Done when:** the token page renders correctly in light and dark, no hardcoded colour remains in `src/`, and the shell is keyboard-navigable end to end.

### Phase 2 — Signature elements
`SpeedupBench` (worker pool, Amdahl fit, guardrails, precomputed fallback) → `PipelineTrace` (SVG; retires the 5.8 MB PNG) → `CircuitSandbox` (statevector sim, draggable gates, OpenQASM/Qiskit/Cirq export).

**Done when:** the benchmark completes in <400ms on a four-core laptop, is skipped correctly under reduced-motion / low-core / save-data, and the sandbox's exported QASM actually runs in Qiskit.

### Phase 3 — Page rebuilds
Homepage chapters → `/projects` gallery with facets → project detail template → `/about` spec sheet → `/services` intent cards with contact pre-fill → `/lab` → `/cv` → `/uses` → `/thanks` inline success → designed 404.

**Done when:** every route in §7 matches its spec, deep links and back-button restoration work, and the intent → contact pre-fill round-trips.

### Phase 4 — Data layer and charts
`scripts/fetch-data.mjs` + Actions cron + zod validation + soft-fail snapshots → TanStack Query hydration for GitHub / contributions / weather → the Bklit chart set → rail telemetry.

**Done when:** the site renders real GitHub numbers with JavaScript-side requests blocked (snapshot), refreshes them live when they aren't, and survives an API outage without a broken page.

### Phase 5 — Polish and QA
Motion choreography pass → copy pass over every string (§4.6) → responsive pass at 360/768/1024/1440/1920 → cross-browser (Chrome, Firefox, Safari, iOS) → reduced-motion and keyboard-only walkthroughs → screenshot review, then remove one thing (the Chanel rule).

**Done when:** the budget in §12 holds on the deployed site, not just locally.

### Phase 6 — TODO: content update (your Step 2, later)
Tracked in `TODO-CONTENT.md`. Because all copy lives in `src/data/*` behind zod schemas, Step 2 is a data edit plus `npm test` — no component work.

---

## 12. Quality gates

**Performance budget:** LCP < 1.5s on 4G · CLS < 0.02 · INP < 100ms · JS ≤ 180 KB gzip on first load (route-split) · homepage images ≤ 250 KB total · Lighthouse ≥ 95 across the board · benchmark auto-pass ≤ 400ms and cancellable.

**Accessibility:** WCAG 2.2 AA contrast in both themes · complete keyboard path with visible focus · focus-trapped overlays with `Escape` and focus restore · reduced motion honoured globally · form errors announced and tied to fields · zero axe-core violations in CI.

**Tests:** data integrity (taxonomy, unique slugs, required fields, no dead asset imports) · routing (every route renders; unknown slug → 404) · contact form (validation, honeypot, error and success paths) · theme persistence · reduced-motion policy · benchmark math (speedup/efficiency correctness) · statevector simulator against known circuits (Bell, GHZ) · per-route a11y smoke test.

**CI:** lint → typecheck → test → build → Lighthouse → deploy. No deploy on red.

---

## 13. Decisions I need from you

1. **Display font:** Archivo Expanded (my pick — industrial, wide, signage-like) / Bricolage Grotesque (more character) / Familjen Grotesk (quieter).
2. **Default theme:** light-first (my pick — it differentiates, and dark stays a first-class equal) or keep dark-first.
3. **Tailwind 4 + React 19 upgrade:** yes (unlocks KokonutUI + Bklit natively) or stay on 3.4/18 and hand-port those components (~1 extra day, slightly more maintenance).
4. **Phase B Cloudflare Worker** (§6): in or out for now? Out is fine — it's purely additive.
5. **`/notes` writing section:** scaffold it now (hidden until you have posts), or leave it out?
6. **CV PDF:** should I compile `master_detailed_cv.tex` to `public/umer-farooq-cv.pdf`, or will you drop in the PDF you already have?
7. **Domain:** staying on `github.io`, or is a custom domain coming? (Affects canonicals, OG tags, sitemap, and whether the Worker is worth it.)

Defaults if you don't reply: Archivo Expanded · light-first · yes upgrade · Worker out · `/notes` scaffolded hidden · I compile the CV · `github.io`.

---

## 14. Risks and honest tradeoffs

| Risk | Mitigation |
|---|---|
| The Tailwind 4 migration touches every file | Isolated commit, `/design` token page as the visual regression check, documented v3 fallback |
| The hero benchmark could feel gimmicky if slow or noisy | Hard 400ms cap, one workload, cancels on scroll, precomputed fallback, plain readable readout — it reads as an instrument, not a toy |
| Live APIs make the page depend on third parties | The build-time snapshot is always the source of first paint; live data only ever *upgrades* it |
| The 60 req/hr GitHub limit could be hit by a traffic spike | Snapshot serves everyone; client revalidation is cached 10 minutes in TanStack Query; the optional Worker raises it to 5,000/hr |
| Three animation systems (Motion + anime.js + chart motion) could fight | One `MotionPolicy` provider owns duration/easing/enabled; anime.js is scoped to three components only; charts inherit tokens |
| Scope is large | Phases 0–2 alone fix every P0 and deliver the signature; each phase ships independently |

---

## 15. File-level change map

**New:** `src/app/shell/*`, `src/components/bench/*`, `src/components/lab/*`, `src/components/charts/*`, `src/components/content/*`, `src/lib/{motion-policy,theme,meta,seo,api/*}.ts`, `src/data/{schema.ts,taxonomy.ts,intents.ts,generated/*}`, `src/pages/{LabPage,CvPage,UsesPage,DesignPage}.tsx`, `scripts/{fetch-data,gen-sitemap,gen-og}.mjs`, `public/{og-portfolio.png,site.webmanifest,sitemap.xml}`, tests under `src/test/*`.

**Rewritten:** `index.css` (tokens), `tailwind.config.ts` → `@theme`, `App.tsx` (lazy routes, boundary, basename fix), `Layout.tsx` → `AppShell`, all seven `portfolio/*` components, all seven pages, `index.html` (meta, no-flash script, preloads).

**Edited, not replaced:** `src/data/{profile,projects,siteLinks}.ts` (schemas + typed metrics; **content preserved**), `vite.config.ts` (image plugin, Tailwind 4 plugin, remove `hmr.overlay:false`), `.github/workflows/deploy-gh-pages.yml` (quality gates + data step), `package.json`, `README.md`.

**Deleted:** `src/App.css`, `src/components/NavLink.tsx`, 37 unused `src/components/ui/*`, `bun.lock`, `bun.lockb`.

**Untouched:** `master_detailed_cv.tex`, `GITHUB_PAGES_SETUP.md`, `.env.example`, `public/favicon.*`, `public/robots.txt`.

---

## 16. Build status

**Phase 0 — complete.** Every P0 in §3 is fixed, with the site's appearance intentionally unchanged.

| Item | Status | Detail |
|---|---|---|
| B1 invisible projects | Fixed | Closed `Domain` taxonomy in `src/data/taxonomy.ts`; `/projects` groups by iterating it. `rnn-text-generation` and `parallel-graph-text` are now reachable. A regression test asserts every project is grouped exactly once. |
| B2 broken `og:image` | Fixed | `scripts/gen-og.mjs` generates a 1200×630 card (42 KB) from the measured-vs-ideal speedup curve. |
| B3 basename bug | Fixed | Derived from `import.meta.env.BASE_URL` instead of `window.location.pathname`. |
| B4 duplicated project list | Fixed | `ProjectsSection` reads `getFeaturedProjects()`. The homepage's `objective` / `strategy` / tagline copy was migrated into `projects.ts` rather than discarded. |
| B5 hardcoded links | Fixed | Footer and contact both read `SITE_LINKS`; displayed email/phone are derived from it. |
| B6 theme not persisted | Fixed | `src/lib/theme.tsx` — localStorage + `prefers-color-scheme` + no-flash inline script. |
| B7 dead files | Fixed | 38 files deleted (`App.css`, `NavLink.tsx`, 33 unused `ui/` components, `use-toast` trio, `use-mobile`), plus both bun lockfiles. 12 shadcn primitives were deliberately kept for Phases 2–3 rather than deleted and re-added. |
| D1 unlabelled form fields | Fixed | New `ContactForm` with `htmlFor`/`id` pairs, tested. |
| D2 reduced motion ignored | Fixed | `MotionPolicyProvider` — one policy every animation reads. |
| D3–D6 a11y | Fixed | Skip link, focus-visible rings, `aria-expanded`/`aria-controls`, Escape-to-close with focus restore, `aria-pressed` on the theme toggle, 44px hit areas, accessible names on icon links. |
| D7 unannounced errors | Fixed | `aria-live` region plus `role="alert"` on submit failures. |
| E1/E2 8 MB of images | Fixed | 7.85 MB → 1.58 MB across 22 variants; `Picture` serves AVIF → WebP with `srcset`, intrinsic sizes, and lazy loading. |
| E3 no code splitting | Fixed | Route-level `React.lazy`, vendor chunks, and the form's validation stack deferred. First load: **~166 KB gzip**, under the 180 KB budget. |
| E5 hidden dev errors | Fixed | `hmr.overlay: false` removed. |
| F1 shared metadata | Fixed | `useDocumentMeta` gives every route its own title, description, canonical, and social card. |
| F3 no structured data | Fixed | `Person`, `CreativeWork`, and `BreadcrumbList` JSON-LD; `sitemap.xml` generated from the data at build time. |
| F4 no manifest | Fixed | `site.webmanifest`, `theme-color` for both schemes. |
| G1/G2 content integrity | Fixed | zod schemas, dev-time validation, and CI-enforced tests. |
| H1 no CI gates | Fixed | Deploy now requires lint + typecheck + test. Lighthouse runs advisory until Phase 5. |
| H2 placeholder test | Fixed | 29 tests across content, routing, homepage, theme, and contact form. |
| H3 no error boundary | Fixed | `ErrorBoundary` wraps the app. |
| H4 three lockfiles | Fixed | npm only. |
| C2/C3/C4/C6 content depth | Phase 3–4 | Project pages gained prev/next navigation; metrics, charts, and the proof layer land with the redesign. |
| Self-hosted fonts (E4) | Moved to Phase 1 | Subsetting Inter now would be thrown away when Archivo Expanded / Inter Tight / IBM Plex Mono land, so it happens with the type system. |

**Verified:** `npm run verify` — 0 lint errors, typecheck clean, 29/29 tests passing. Production build succeeds.

### Phase 1 — in progress

| Item | Status | Detail |
|---|---|---|
| Tailwind 4 migration | Done | `@tailwindcss/vite`, CSS-first `@theme`; `tailwind.config.ts` and `postcss.config.js` removed; `tailwindcss-animate` → `tw-animate-css`. `autoprefixer`/`postcss` dropped. |
| Token system | Done | `src/index.css` — the full Telemetry palette, fluid type scale, tight radii, easing and keyframe tokens, and the `label-mono` / `readout` / `display-wide` / `column-ticks` utilities. |
| Accent rule enforced | Done | `src/lib/accent.ts` is the one definition: thermal = compute, cryo = quantum, AI unaccented. Every hardcoded `blue-*`/`cyan-*`/`violet-*` class is gone from `src`. |
| Contrast-safe accents | Done | Each accent has a vivid value for fills/marks and a darkened value for type. Both were tuned against measured ratios — `--thermal-type` #a83306 and `--cryo-type` #096376 clear AA on the ground *and* on their own 10% tint (the earlier #b03608 measured 4.46, just under). |
| Three type faces | Done | Archivo Variable (width axis 62–125, headlines set wide rather than heavy), Inter Tight, IBM Plex Mono. Self-hosted, latin-only, declared face by face — **5 font files instead of 25**, and the blocking Google Fonts `@import` is gone. |
| Visual + a11y harness | Done | `npm run shots` builds nothing but serves `dist` exactly as Pages does, screenshots 8 routes × desktop/mobile × light/dark, captures console errors, and runs axe (WCAG 2.2 AA) per route. `npm run a11y` for the scan alone. |
| **Deep-link bug found and fixed** | Done | Not in the original audit. `base: "./"` made asset URLs relative, so `/projects/qcanvas` requested `/projects/assets/index.js`, got the SPA fallback, and the browser refused to execute HTML as a module — **every shared project link failed to load**. Now an absolute base (`VITE_BASE_PATH`, default `/portfolio/`), which is also what makes `getBasename()` correct. Caught by the new harness. |
| Rail shell, `/design` token page, Motion migration | Next | The remaining Phase 1 work. |

**Verified after Phase 1 so far:** 0 lint errors · typecheck clean · 29/29 tests · **axe: no violations on any of the 8 routes, in either theme** · first load 168 KB gzip (54.2 app + 52.8 react + 42.6 motion + 8.2 query + 10.8 CSS), under the 180 KB budget.

### Phase 1 — complete (except the `/design` token page)

| Item | Status | Detail |
|---|---|---|
| Tailwind 4 migration | Done | `@tailwindcss/vite`, CSS-first `@theme`; `tailwind.config.ts` and `postcss.config.js` gone; `tailwindcss-animate` → `tw-animate-css`. |
| Token system | Done | `src/index.css` — Telemetry palette, fluid type scale, tight radii, easing/keyframe tokens, and the `label-mono` / `readout` / `display-wide` / `column-ticks` utilities. |
| Accent rule enforced | Done | `src/lib/accent.ts` is the single definition. Zero hardcoded `blue-*`/`cyan-*`/`violet-*` classes remain in `src`. |
| Contrast-safe accents | Done | Three tokens per accent — vivid (`thermal`) for marks, darkened (`thermal-type`) for type, and `on-thermal` for text sitting on a vivid fill. All tuned against measured ratios, not guessed. |
| Three type faces | Done | Archivo Variable (width axis 62–125; headlines set **wide, not heavy**), Inter Tight, IBM Plex Mono. Self-hosted, latin-only, declared face by face: **5 font files instead of 25**. |
| Shell | Done | `AppShell` + `TopBar` + `Rail` + `ScrollProgress` + `SiteFooter`. The rail is the section index *and* the live status display — local time, cores detected, availability. Mobile nav is a Radix dialog, so the focus trap, Escape, and focus restore are real. |
| Motion migration | Done | `framer-motion` → `motion` (motion.dev) across 12 files. The motion chunk got **smaller**: 44.0 → 35.4 KB gzip. |
| Visual + a11y harness | Done | `npm run shots` serves `dist` exactly as Pages does, screenshots 9 routes × desktop/mobile × light/dark, collects console errors, and runs axe (WCAG 2.2 AA) per route. |
| **Deep-link bug found and fixed** | Done | Not in the original audit. `base: "./"` made asset URLs relative, so `/projects/qcanvas` requested `/projects/assets/index.js`, got the SPA fallback, and the browser refused to execute HTML as a module — **every shared project link failed to load**. Now an absolute base via `VITE_BASE_PATH`. Found by the harness. |
| **TypeScript was not strict** | Done | Also not in the original audit: `strict`, `strictNullChecks`, and `noImplicitAny` were all **off**, so "TypeScript" was barely checking anything. Now fully strict, plus `noUnusedLocals`/`noUnusedParameters` — and the codebase compiles clean. |
| `/design` token page | Skipped for now | The real pages plus the screenshot harness cover the same ground; not worth a route that only I would read. |

### Phase 2 — two of three signatures built

| Item | Status | Detail |
|---|---|---|
| `SpeedupBench` | Done | The hero runs a real parallel sweep on the visitor's machine: Web Worker pool, Mandelbrot escape-time band per worker, O(1) payload in and out so the timing reflects compute rather than data transfer. Warm-up pass, best-of-two per step, powers-of-two worker counts, checksum verified identical across every worker count. Reports speedup, efficiency, and the **Karp–Flatt serial fraction**. Skips itself under reduced motion, data saving, ≤2 cores, or no worker support, and falls back to a labelled recorded sweep. |
| `CircuitSandbox` | Done | Exact 3-qubit statevector simulator (H, X, Y, Z, S, T, CNOT) in Qiskit's little-endian convention, with Bell/GHZ/uniform presets, live measurement probabilities, and export to runnable **OpenQASM 3.0, Qiskit, and Cirq**. 13 tests cover Bell, GHZ, normalisation, the index convention, and the exported source. Click-to-place rather than drag, so it works with a keyboard and on a phone. |
| `PipelineTrace` | Not yet | The animated Cirq-RAG pipeline SVG. The 5.8 MB PNG is already optimised to ~130 KB, so this is now a quality upgrade rather than a fix. |

### Phase 3 — pages rebuilt

| Page | Status | Detail |
|---|---|---|
| `/` | Done | Five chapters, no two the same shape: full-bleed instrument → full-width log rows → dense measurement band → narrow column → intent cards beside the form. |
| `/projects` | Done | Search + domain facets + technology facets, all with live counts, grouped by the closed taxonomy. All 30 projects reachable. |
| `/projects/:slug` | Done | Leads with measured results, then problem → what it does → how it was built (numbered, because the steps are a sequence) → architecture → stack → prev/next. |
| `/about` | Done | Spec sheet beside the prose: portrait, education, links, then summary, what I'm looking for, a real timeline, certifications with verify links, skills, and "off compute". |
| `/services` | Done | Six **intent cards** written as the visitor's problem, expanding to what I do and what they get, handing off to the pre-filled form. |
| `/lab` | Done | New route. Both runnable demos, with the reasoning behind the workload choice. |
| `/thanks`, 404 | Done | The 404 now offers four real exits instead of one. |
| `/cv`, `/uses`, `/notes` | Not yet | Remaining Phase 3 work. |

**Verified now:** 0 lint errors · strict typecheck clean · **42/42 tests** · **axe: no violations on any of 9 routes, in either theme, light and dark** · first-load JS 173 KB gzip (budget 180) · CSS 10.6 KB gzip.

### Phase 2 - complete

| Item | Status | Detail |
|---|---|---|
| `SpeedupBench` | Done | Real parallel sweep on the visitor's machine. Warm-up pass, powers-of-two worker counts, best-of-two per step, checksum verified identical across every worker count. Reports speedup, efficiency, and the Karp-Flatt serial fraction. Degrades to a labelled recorded sweep. |
| `CircuitSandbox` | Done | Exact 3-qubit statevector simulator, Qiskit's little-endian convention, exports runnable OpenQASM 3.0 / Qiskit / Cirq. |
| `PipelineTrace` | Done | The Cirq-RAG pipeline as a self-drawing SVG built with **anime.js v4** (`createScope` + `svg.createDrawable` + `createTimeline`). Designer to Validator to Optimizer to Educator, with the FAISS knowledge base feeding in and the **retry edge firing backwards** - the loop that is the whole point of the project. Theme-aware, replayable, with an sr-only ordered alternative. Renders its final state instantly under reduced motion. |

### Phase 3 - complete

`/`, `/projects`, `/projects/:slug`, `/about`, `/services`, `/lab`, `/thanks`, 404 - plus:

| Route | Detail |
|---|---|
| `/cv` | A full CV rendered **from `src/data`**, so it cannot drift from the rest of the site. Content the data files lacked came from `master_detailed_cv.tex` into a new `src/data/cv.ts`. Print stylesheet injected only while the route is mounted (as a `?raw` style element) so it cannot reformat other pages. 8 selected projects, stating the 22 it leaves out. |
| `/cv` PDF | `public/umer-farooq-cv.pdf` (109 KB), generated by `npm run cv` - Playwright prints the site's own `/cv` route. **No LaTeX toolchain is installed, and compiling the `.tex` would reintroduce a second source of truth**; printing the route keeps the PDF and the web CV identical by construction. |
| `/uses` | Hardware and toolchain, derived from the CV and the project stacks. Three rows that cannot be known (CPU, memory, CUDA toolkit version) are marked `todo` and render as "Unconfirmed" rather than invented. |
| `/notes` | Scaffolded with a typed content model and a real empty state. Hidden from all navigation until `NOTES_ARE_PUBLIC` flips, and `noIndex` while empty. |

### Phase 4 - complete

A two-tier data layer, because GitHub Pages has no server:

1. **Build-time snapshot.** `scripts/fetch-data.mjs` fetches GitHub REST, the jogruber contribution
   graph, and the arXiv Atom feed; validates every response with zod; and writes
   `src/data/generated/*.json` via temp-file-plus-rename, so a partial file is impossible. A failing
   source keeps the last good snapshot, prints a status table, and **exits 0** - the pipeline
   degrades, the build does not. Backoff on 429/5xx (arXiv rate-limits aggressively). Runs in CI
   before the bundle embeds it, on push and on a daily cron.
2. **Client revalidation.** TanStack Query - mounted since the start and never used until now -
   hydrates from the snapshot with `initialData` plus `initialDataUpdatedAt`, so build-time data
   counts as stale and triggers exactly one refetch on mount. Without that second argument the
   global 10-minute `staleTime` would suppress the refresh entirely.

`LiveActivity` renders it: repos / stars / followers / contributions, a 53x7 contribution calendar on
the thermal ramp with a legend that prints its bucket ranges, language distribution bars, recent
pushes, and the latest quant-ph preprints (clearly labelled as other people's papers). Real current
numbers: 24 public repos, 371 contributions across 62 active days. It is lazy-mounted, because its
data module imports zod and the section sits far below the fold.

### On Bklit UI and KokonutUI

Bklit's shadcn registry **installed cleanly** on React 18 + Tailwind 4 - but its chart components
turned out to be unusable here, and this was established by running them, not by assuming:

1. `BarChart` renders through `@visx/responsive`'s `ParentSize`, which constructs a `ResizeObserver`
   in an effect. jsdom has none, so any test throws; and with a stub the measured size stays 0 and
   the chart renders zero rects - it would also draw nothing in any zero-width container.
2. `bar-chart.tsx` hard-codes `aria-hidden="true"` on the chart `<svg>`, which makes the
   `role="img"` + descriptive `aria-label` this design system requires impossible without bolting a
   wrapper role onto an aria-hidden subtree.

So the 40 vendored files and their nine dependencies (`@visx/*` x7, `d3-array`, `@number-flow/react`)
were removed, and the figures are hand-built SVG in the same idiom as `SpeedupChart`. What survives
from Bklit is its **approach** - composable figures, motion on draw, the sequential-scale tokens -
retoned to the Telemetry palette. That is the honest outcome: the site got the idea, not the
package, and it kept its accessibility floor and its bundle budget.

KokonutUI was not adopted either. Its value was polished micro-interactions on buttons and cards;
those are now three primitives (`PrimaryAction`, `QuietAction`, `TextAction`) that already match the
palette and motion policy. Adding a second component vocabulary for hover states would have cost
consistency for no gain.

### Verified state

- **0 lint errors** - strict typecheck clean - **108 tests across 9 files**
- **axe: no violations on any of 12 routes, in light and dark**
- first-load JS **176.6 KB gzip** against the 180 budget (index 76.8 + react 52.8 + motion 35.4 +
  query 11.5); CSS 11.0 KB gzip. Headroom is thin - the `query` chunk is only needed by the lazy
  `LiveActivity`, so moving `QueryClientProvider` inside that boundary would return 11.5 KB if a
  future addition needs the room.
- lazy chunks: PipelineTrace 19.5, LiveActivity 8.3, CvPage 5.4, LabPage 5.1, ProjectFigures 2.5 KB gzip

### What is deliberately not done

- **Phase 5 polish pass** - real-device cross-browser checks (the automated pass covers Chromium at
  two viewports in both themes), and the Lighthouse gate is still advisory in CI rather than blocking.
- **Optional Cloudflare Worker** (section 6) - out, as agreed. The build-time pipeline covers the
  data story without it.
- **Three `/uses` rows** and the Huawei award year need the owner; see `TODO-CONTENT.md`.
- `StepSeries` exists and is tested but has no data: the MNIST V1-V5 per-version timings are not in
  the repo, only the endpoint (6x), and they were not invented.
