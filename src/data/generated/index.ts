// Generated snapshots, typed.
//
// The JSON in this directory is written by `node scripts/fetch-data.mjs` and
// committed, so the bundle embeds it and the page paints real numbers before any
// network request happens. Do not hand-edit the JSON — re-run the script.
//
// The schemas below are the contract. They are used in three places:
//   1. Here, to type the imported JSON.
//   2. src/lib/api/* — the browser fetchers parse their live responses with the
//      same schemas, so live data and snapshot data are provably the same shape.
//   3. src/test/live-data.test.ts — CI fails if a committed snapshot drifts.
//
// The committed files are cast rather than parsed at import time: parsing 366
// contribution days on every page load would cost real milliseconds to check
// something CI already proved. The test is the gate.

import { z } from "zod";
import githubJson from "./github.json";
import contributionsJson from "./contributions.json";
import readingJson from "./reading.json";

const isoDate = z.string().datetime();
const dayString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD");

export const repoSchema = z.object({
  name: z.string().min(1),
  /** Empty when the repo has no description — never null, so the UI has one case. */
  description: z.string(),
  url: z.string().url(),
  stars: z.number().int().nonnegative(),
  /** Empty when GitHub detected no primary language. */
  language: z.string(),
  pushedAt: isoDate,
  topics: z.array(z.string()),
});

export const githubSnapshotSchema = z.object({
  fetchedAt: isoDate,
  login: z.string().min(1),
  name: z.string().min(1),
  url: z.string().url(),
  publicRepos: z.number().int().nonnegative(),
  followers: z.number().int().nonnegative(),
  /** Summed across every non-fork repo, not just the ones listed below. */
  totalStars: z.number().int().nonnegative(),
  languages: z.array(z.object({ name: z.string().min(1), repos: z.number().int().positive() })),
  /** The most recently pushed repos, newest first. Forks excluded. */
  repos: z.array(repoSchema),
});

export const contributionsSnapshotSchema = z.object({
  fetchedAt: isoDate,
  total: z.number().int().nonnegative(),
  startDate: dayString,
  endDate: dayString,
  /**
   * Only the days that had activity. The window is a dense run of days, so
   * startDate plus the non-zero days reconstructs the whole grid — and it keeps
   * the committed file at a few KB instead of listing 366 mostly-zero entries.
   * `contributionGrid()` in src/hooks/useLiveData.ts does the reconstruction.
   */
  activeDays: z.array(z.object({ date: dayString, count: z.number().int().positive() })),
});

export const paperSchema = z.object({
  /** arXiv identifier including version, e.g. "2608.21361v1". */
  id: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  authors: z.array(z.string().min(1)).min(1),
  published: isoDate,
  link: z.string().url(),
  /** arXiv primary category, e.g. "quant-ph" or "cs.DC". */
  category: z.string().min(1),
});

export const readingSnapshotSchema = z.object({
  fetchedAt: isoDate,
  query: z.string().min(1),
  papers: z.array(paperSchema),
});

export type Repo = z.infer<typeof repoSchema>;
export type GithubSnapshot = z.infer<typeof githubSnapshotSchema>;
export type ContributionsSnapshot = z.infer<typeof contributionsSnapshotSchema>;
export type Paper = z.infer<typeof paperSchema>;
export type ReadingSnapshot = z.infer<typeof readingSnapshotSchema>;

export const GITHUB_SNAPSHOT = githubJson as GithubSnapshot;
export const CONTRIBUTIONS_SNAPSHOT = contributionsJson as ContributionsSnapshot;
export const READING_SNAPSHOT = readingJson as ReadingSnapshot;

/**
 * A snapshot the pipeline could not fill. `scripts/fetch-data.mjs` writes an
 * epoch timestamp when a source has never succeeded, so the UI can hide a block
 * rather than present zeros as if they had been measured.
 */
export function isPlaceholder(snapshot: { fetchedAt: string }): boolean {
  return Date.parse(snapshot.fetchedAt) <= 0;
}
