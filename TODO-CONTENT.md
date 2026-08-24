# TODO — Step 2: content update (later, not now)

Step 1 is the redesign (see `REDESIGN_PLAN.md`). This file is the parking lot for Step 2: the new information you said you'd give me. **Nothing here is being worked on yet.**

The redesign is built so this step is a data edit, not a rebuild — all copy lives in `src/data/*` behind zod schemas, so new content drops in and the build validates it.

## What I'll need from you when we start Step 2

- [ ] **Experience** — new roles/internships: title, org, dates, 3–5 measurable bullets each. (Current data only has the FAST-NUCES Open Quantum Workbench role and the Fiverr period.)
- [ ] **Projects** — anything to add, remove, rename, or re-prioritise, plus which 3 should be the homepage "selected work".
- [ ] **Metrics per project** — the numbers, as numbers: baseline vs. result, units, and how they were measured. These become the metrics bands, before/after tables, and charts, so `"6× faster"` needs to arrive as `{ baseline: 100, result: 16.6, unit: "ms", note: "FP16 Tensor Cores vs FP32" }`.
- [x] ~~Is it 100+ or 50+ Fiverr projects?~~ **Resolved from `master_detailed_cv.tex`:** 100+ projects completed at 98% satisfaction and 80% repeat custom, of which 30+ were full-stack MERN/.NET. The old site's 50+ understated it. The site now uses the CV figures.
- [ ] **Huawei award year** — the timeline says 2024, the QCanvas project period says "Mar 2025 – Present". Which is right?
- [ ] **Certifications / awards** — anything past the two Oracle ones, with credential URLs.
- [ ] **Education** — final GPA/honours if you want them shown, expected graduation confirmation.
- [ ] **Links** — GitHub, LinkedIn, email, phone, and any new ones (Kaggle, HuggingFace, Google Scholar, Fiverr, X, Discord).
- [ ] **CV** — the current PDF, or confirmation that I should compile `master_detailed_cv.tex`.
- [ ] **Photos** — a high-res portrait (I'll handle optimization), plus any project screenshots, diagrams, or benchmark plots.
- [ ] **Testimonials** — Fiverr reviews or supervisor quotes you're allowed to publish, with attribution.
- [ ] **Positioning** — the headline claim you want to lead with, and the roles you're targeting (HPC/GPU internship, infra, research, freelance).
- [ ] **`/uses` content** — machine, GPU, distro, editor, toolchain.
- [ ] **`/notes`** — whether you want the writing section live, and any drafts.

## How to hand it over

Paste it in any form — bullets, a doc dump, voice-to-text, the updated `.tex`. I'll normalise it into the data files, run the integrity tests, and report anything that contradicts what's already on the site.
