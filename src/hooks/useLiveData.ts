// The client half of the live data layer.
//
// Every hook here is seeded with the committed build-time snapshot, so a
// component renders real numbers on the first frame with no loading state and no
// layout shift. The browser then revalidates the CORS-safe sources once per
// mount; if that fails, the snapshot stays on screen and `failed` lets the UI say
// so quietly. There is no path to an empty or broken state.
//
// arXiv is deliberately absent: it sends no CORS header, so it is build-time
// only. Read READING_SNAPSHOT directly.

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import {
  CONTRIBUTIONS_SNAPSHOT,
  GITHUB_SNAPSHOT,
  type ContributionsSnapshot,
  type GithubSnapshot,
  type Repo,
} from "@/data/generated";
import { fetchContributionsSnapshot } from "@/lib/api/contributions";
import { fetchGithubSnapshot } from "@/lib/api/github";

const DAY_MS = 86_400_000;

/**
 * What every live hook returns. `data` is never undefined — the snapshot is the
 * floor — so callers render unconditionally and only branch on freshness.
 */
export interface LiveResult<T> {
  data: T;
  /** True once a browser revalidation has replaced the build-time snapshot. */
  live: boolean;
  /** True when revalidation failed. `data` is still the snapshot. */
  failed: boolean;
  /** ISO timestamp of the data currently on screen. */
  fetchedAt: string;
}

function toResult<S extends { fetchedAt: string }, T>(
  query: UseQueryResult<S, Error>,
  snapshotFetchedAt: string,
  select: (snapshot: S) => T,
): LiveResult<T> {
  const snapshot = query.data as S;
  return {
    data: select(snapshot),
    live: Date.parse(snapshot.fetchedAt) > Date.parse(snapshotFetchedAt),
    failed: query.isError,
    fetchedAt: snapshot.fetchedAt,
  };
}

/**
 * One query behind both GitHub hooks: the profile and the repository list come
 * from the same pair of requests, and the unauthenticated limit is 60 per hour
 * per IP, so asking twice would be careless.
 *
 * `initialDataUpdatedAt` is the build timestamp rather than "now". That is what
 * makes the seeded data count as stale and triggers exactly one revalidation on
 * mount — with the default (now), the global 10-minute staleTime would suppress
 * the refetch and the page would only ever show build-time numbers.
 */
function useGithubQuery(): UseQueryResult<GithubSnapshot, Error> {
  return useQuery({
    queryKey: ["live", "github"],
    queryFn: ({ signal }) => fetchGithubSnapshot(undefined, signal),
    initialData: GITHUB_SNAPSHOT,
    initialDataUpdatedAt: Date.parse(GITHUB_SNAPSHOT.fetchedAt),
  });
}

export interface GithubProfile {
  login: string;
  name: string;
  url: string;
  publicRepos: number;
  followers: number;
  totalStars: number;
}

export function useGithubProfile(): LiveResult<GithubProfile> {
  return toResult(useGithubQuery(), GITHUB_SNAPSHOT.fetchedAt, (snapshot) => ({
    login: snapshot.login,
    name: snapshot.name,
    url: snapshot.url,
    publicRepos: snapshot.publicRepos,
    followers: snapshot.followers,
    totalStars: snapshot.totalStars,
  }));
}

export interface RepoActivity {
  /** Most recently pushed first. */
  repos: Repo[];
  languages: GithubSnapshot["languages"];
}

export function useRepos(): LiveResult<RepoActivity> {
  return toResult(useGithubQuery(), GITHUB_SNAPSHOT.fetchedAt, (snapshot) => ({
    repos: snapshot.repos,
    languages: snapshot.languages,
  }));
}

export function useContributions(): LiveResult<ContributionsSnapshot> {
  const query = useQuery({
    queryKey: ["live", "contributions"],
    queryFn: ({ signal }) => fetchContributionsSnapshot(undefined, signal),
    initialData: CONTRIBUTIONS_SNAPSHOT,
    initialDataUpdatedAt: Date.parse(CONTRIBUTIONS_SNAPSHOT.fetchedAt),
  });
  return toResult(query, CONTRIBUTIONS_SNAPSHOT.fetchedAt, (snapshot) => snapshot);
}

// ---------------------------------------------------------------------------
// freshness
// ---------------------------------------------------------------------------

/**
 * Coarse relative time — the largest unit that still reads as a measurement.
 * Minutes past the hour do not change what a reader concludes about a number
 * that is four hours old, so they are not shown.
 */
export function relativeTime(iso: string, now: Date = new Date()): string {
  const then = Date.parse(iso);
  if (!Number.isFinite(then) || then <= 0) return "never";

  const seconds = Math.round((now.getTime() - then) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 172_800) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2_592_000) return `${Math.floor(seconds / 86_400)}d ago`;
  return `${Math.max(1, Math.round(seconds / 2_592_000))}mo ago`;
}

/** The line under a readout: "updated 3h ago", or plain honesty when there is nothing. */
export function freshness(iso: string, now: Date = new Date()): string {
  const relative = relativeTime(iso, now);
  return relative === "never" ? "not fetched yet" : `updated ${relative}`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "24 Aug 2026". Built by hand rather than through Intl so it never varies by locale. */
export function formatDay(date: string): string {
  const parts = date.slice(0, 10).split("-");
  const month = MONTHS[Number(parts[1]) - 1];
  if (parts.length < 3 || !month) return date;
  return `${Number(parts[2])} ${month} ${parts[0]}`;
}

// ---------------------------------------------------------------------------
// heatmap
// ---------------------------------------------------------------------------

/**
 * Lower bound of each of the five ramp steps, in contributions per day.
 *
 * Fixed thresholds rather than a share of the busiest day: contribution counts
 * are heavily skewed — most active days here sit at 1–5, the peak at 28 — so
 * scaling to the maximum would collapse four fifths of the active days into the
 * palest step and the chart would read as empty. These buckets spread the actual
 * distribution across all five, and the legend prints them so the reader can see
 * what each shade means.
 */
export const HEATMAP_THRESHOLDS = [1, 3, 6, 10, 15] as const;

/** Step 0 is a day with no contributions; 1–5 index the --chart-scale-0N ramp. */
export type HeatmapStep = 0 | 1 | 2 | 3 | 4 | 5;

export function heatmapStep(count: number): HeatmapStep {
  if (count < HEATMAP_THRESHOLDS[0]) return 0;
  if (count < HEATMAP_THRESHOLDS[1]) return 1;
  if (count < HEATMAP_THRESHOLDS[2]) return 2;
  if (count < HEATMAP_THRESHOLDS[3]) return 3;
  if (count < HEATMAP_THRESHOLDS[4]) return 4;
  return 5;
}

/** Human range for each step, used by the legend: "1–2", "3–5", … "15+". */
export function heatmapStepRange(step: HeatmapStep): string {
  if (step === 0) return "0";
  const low = HEATMAP_THRESHOLDS[step - 1];
  if (step === 5) return `${low}+`;
  return `${low}–${HEATMAP_THRESHOLDS[step] - 1}`;
}

export interface GridCell {
  date: string;
  count: number;
  step: HeatmapStep;
}

export interface MonthTotal {
  /** YYYY-MM, for stable keys. */
  key: string;
  label: string;
  total: number;
  /** Column this month starts in, for the heatmap's month axis. */
  column: number;
}

export interface ContributionGrid {
  /** One entry per week column, each holding 7 days from Sunday. `null` pads the ends. */
  weeks: (GridCell | null)[][];
  days: number;
  activeDays: number;
  busiest: GridCell | null;
  months: MonthTotal[];
}

const EMPTY_GRID: ContributionGrid = {
  weeks: [],
  days: 0,
  activeDays: 0,
  busiest: null,
  months: [],
};

/**
 * Expands the compressed snapshot into the calendar grid the heatmap draws.
 *
 * The snapshot stores only the days that had activity, so this walks the window
 * day by day and fills the gaps with zero — which also means the grid is correct
 * even if the API ever drops a quiet day.
 */
export function contributionGrid(snapshot: ContributionsSnapshot): ContributionGrid {
  const start = Date.parse(`${snapshot.startDate}T00:00:00Z`);
  const end = Date.parse(`${snapshot.endDate}T00:00:00Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return EMPTY_GRID;

  const counts = new Map(snapshot.activeDays.map((day) => [day.date, day.count]));
  const dayCount = Math.round((end - start) / DAY_MS) + 1;

  // Columns are Sunday-first, so the first column is padded by the start day's
  // weekday and the last by whatever is left of the final week.
  const cells: (GridCell | null)[] = new Array(new Date(start).getUTCDay()).fill(null);
  let busiest: GridCell | null = null;
  let activeDays = 0;
  const months: MonthTotal[] = [];

  for (let offset = 0; offset < dayCount; offset += 1) {
    const date = new Date(start + offset * DAY_MS).toISOString().slice(0, 10);
    const count = counts.get(date) ?? 0;
    const cell: GridCell = { date, count, step: heatmapStep(count) };
    cells.push(cell);

    if (count > 0) activeDays += 1;
    if (!busiest || count > busiest.count) busiest = cell;

    const key = date.slice(0, 7);
    const current = months[months.length - 1];
    if (current?.key === key) {
      current.total += count;
    } else {
      months.push({
        key,
        label: `${MONTHS[Number(key.slice(5, 7)) - 1] ?? key} ${key.slice(0, 4)}`,
        total: count,
        column: Math.floor((cells.length - 1) / 7),
      });
    }
  }

  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (GridCell | null)[][] = [];
  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7));
  }

  return { weeks, days: dayCount, activeDays, busiest: busiest?.count ? busiest : null, months };
}
