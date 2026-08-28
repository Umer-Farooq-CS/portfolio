# TODO — content

Step 1 was the redesign (see `REDESIGN_PLAN.md`). Step 2 was this content update,
done on **28 Aug 2026** from `Upwork/` in the parent directory (the Upwork profile
rebuild of 27 Aug 2026, which was further along than the site).

## Done in step 2

- [x] **Experience** — MAK Technology (HPC & infrastructure engineer, Dubai,
      Jun 2026 – present) added. Open Quantum Workbench closed out at Aug 2026
      and its bullets moved to past tense, with the GPU/distributed work added.
- [x] **Projects** — four added from the MAK Technology engagements: the HPC
      cluster management platform, the bare-metal Kubernetes automation
      platform, the GPU cloud reference architecture, and the enterprise SLA and
      incident-response framework. Each carries its authored architecture
      diagram.
- [x] **Metrics per project** — all four arrived as real numbers, countable off
      the delivered system or its report set, with baselines where one exists.
- [x] **Taxonomy** — two new domains, `infra` and `architecture`, reusing the
      existing systems/neural accents so the palette legend is unchanged.
- [x] **Skills** — two new groups (infrastructure/orchestration, solution
      architecture), ordered per lens.
- [x] **Positioning** — `SITE.role`, `SITE.description`, `PROFESSIONAL_SUMMARY`,
      every lens hero, and the stale route descriptions. The lens copy described
      a student profile and a quantum job manager, not enterprise GPU platform
      work.
- [x] **Services** — two offerings added (cluster/GPU platform build, and
      architecture with technical proposal), and "check our architecture" now
      points at the real audit rather than two student projects.
- [x] **Homepage** — each lens now leads with its own flagships and its own four
      evidence numbers, instead of every lens showing a qubit count as headline
      proof.
- [x] ~~Is it 100+ or 50+ Fiverr projects?~~ 100+ at 98% satisfaction, 80%
      repeat custom, 30+ full-stack MERN/.NET. From `master_detailed_cv.tex`.
- [x] **Project counts in copy** — were hardcoded ("All 30 projects", "All
      thirty projects"); now derived from `PROJECTS.length`.

## Still open — needs your confirmation

- [ ] **Graduation.** `EDUCATION.period` now reads `Aug 2022 – Jun 2026`, with
      "(Expected)" dropped since that date has passed. Confirm the degree was
      conferred, and whether you want a final GPA or honours shown.
- [ ] **Location.** The site says Islamabad throughout (hero readout, contact,
      `SITE.location`, PKT clock). The MAK Technology role is Dubai, UAE. If
      you've relocated, this needs changing in one place (`src/data/siteLinks.ts`
      and `SITE.location`/`utcOffsetHours`) — I didn't guess.
- [ ] **Huawei award year.** `AWARDS` says 2024; the QCanvas project period says
      "Mar 2025 – Present"; the Upwork draft puts it under the Sep 2025 – Aug
      2026 role. Two of those three are wrong. This predates step 2 — I left it
      rather than pick.
- [ ] **The security-audit findings.** The HPC diagram lists the specific
      findings verbatim (e.g. credentials in git). They're all closed and the
      client is unnamed, and this is already public on Upwork — but the site
      copy deliberately stays at category level. Say if you'd rather the diagram
      were redacted further before this goes live.
- [ ] **MAK Technology start date.** `Jun 2026` came from the Upwork entry, where
      a start date was mandatory. Confirm it's right.
- [ ] **Certifications / awards** — anything past the two Oracle ones, with
      credential URLs. The second Oracle cert still has no `credentialUrl`.
- [ ] **CV PDF.** `public/umer-farooq-cv.pdf` is now out of date — it predates
      the MAK role and the four new projects. Regenerate with `npm run cv`
      (prints from `/cv`) when the open questions above are settled.
- [ ] **Portrait.** Still the same `src/assets/me.jpg`. Replace if you have a
      newer one; `npm run images` handles the variants.
- [ ] **Testimonials** — Fiverr reviews or supervisor quotes you're allowed to
      publish, with attribution. Nothing on the site yet.
- [ ] **`/uses`** — unchanged since step 1; check it still matches your machine.
- [ ] **`/notes`** — still `noIndex` with no posts.

## Known cleanup, not content

- 12 of the 14 files in `src/components/ui/` are unused — only `sonner` and
  `tooltip` are imported anywhere. The unused ones carry the remaining
  `transition-all` instances and most of the 7 lint warnings. Safe to delete;
  left alone because it wasn't in scope.
