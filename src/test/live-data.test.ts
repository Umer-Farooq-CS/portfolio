import { createElement } from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CONTRIBUTIONS_SNAPSHOT,
  GITHUB_SNAPSHOT,
  READING_SNAPSHOT,
  contributionsSnapshotSchema,
  githubSnapshotSchema,
  isPlaceholder,
  readingSnapshotSchema,
} from "@/data/generated";
import {
  buildGithubSnapshot,
  fetchGithubSnapshot,
} from "@/lib/api/github";
import {
  buildContributionsSnapshot,
  fetchContributionsSnapshot,
} from "@/lib/api/contributions";
import {
  HEATMAP_THRESHOLDS,
  contributionGrid,
  formatDay,
  freshness,
  heatmapStep,
  heatmapStepRange,
  relativeTime,
} from "@/hooks/useLiveData";
import { MotionPolicyProvider } from "@/lib/motion-policy";
import LiveActivity from "@/components/proof/LiveActivity";

const AT = "2026-08-24T10:00:00.000Z";

// ---------------------------------------------------------------------------
// the committed snapshots
// ---------------------------------------------------------------------------

describe("committed snapshots", () => {
  it("match their schemas", () => {
    expect(() => githubSnapshotSchema.parse(GITHUB_SNAPSHOT)).not.toThrow();
    expect(() => contributionsSnapshotSchema.parse(CONTRIBUTIONS_SNAPSHOT)).not.toThrow();
    expect(() => readingSnapshotSchema.parse(READING_SNAPSHOT)).not.toThrow();
  });

  it("hold real data rather than the pipeline's empty placeholder", () => {
    for (const snapshot of [GITHUB_SNAPSHOT, CONTRIBUTIONS_SNAPSHOT, READING_SNAPSHOT]) {
      expect(isPlaceholder(snapshot)).toBe(false);
    }
    expect(GITHUB_SNAPSHOT.publicRepos).toBeGreaterThan(0);
    expect(CONTRIBUTIONS_SNAPSHOT.total).toBeGreaterThan(0);
    expect(READING_SNAPSHOT.papers.length).toBeGreaterThan(0);
  });

  it("stay inside the trim limits, so the bundle cost is bounded", () => {
    expect(GITHUB_SNAPSHOT.repos.length).toBeLessThanOrEqual(10);
    expect(GITHUB_SNAPSHOT.languages.length).toBeLessThanOrEqual(8);
    expect(READING_SNAPSHOT.papers.length).toBeLessThanOrEqual(5);
    for (const paper of READING_SNAPSHOT.papers) {
      // 220 characters plus the ellipsis the truncation appends.
      expect(paper.summary.length).toBeLessThanOrEqual(221);
    }
  });

  it("lists repos newest-pushed first, with the profile-README repo excluded", () => {
    const pushed = GITHUB_SNAPSHOT.repos.map((repo) => Date.parse(repo.pushedAt));
    expect(pushed).toEqual([...pushed].sort((a, b) => b - a));
    for (const repo of GITHUB_SNAPSHOT.repos) {
      expect(repo.name.toLowerCase()).not.toBe(GITHUB_SNAPSHOT.login.toLowerCase());
    }
  });

  it("orders languages by repo count", () => {
    const counts = GITHUB_SNAPSHOT.languages.map((language) => language.repos);
    expect(counts).toEqual([...counts].sort((a, b) => b - a));
  });

  it("keeps the compressed contribution calendar self-consistent", () => {
    const { startDate, endDate, activeDays, total } = CONTRIBUTIONS_SNAPSHOT;
    expect(startDate < endDate).toBe(true);
    // The compression drops zero days, so the sum of what is left must still be
    // the year's total — otherwise the heatmap is drawing a different year.
    expect(activeDays.reduce((sum, day) => sum + day.count, 0)).toBe(total);
    const dates = activeDays.map((day) => day.date);
    expect(dates).toEqual([...dates].sort());
    expect(new Set(dates).size).toBe(dates.length);
    for (const day of activeDays) {
      expect(day.count).toBeGreaterThan(0);
      expect(day.date >= startDate && day.date <= endDate).toBe(true);
    }
  });

  it("links every paper over https and never with an empty author list", () => {
    for (const paper of READING_SNAPSHOT.papers) {
      expect(paper.link.startsWith("https://arxiv.org/abs/")).toBe(true);
      expect(paper.authors.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// the browser fetchers
// ---------------------------------------------------------------------------

const userFixture = {
  login: "Umer-Farooq-CS",
  name: "Umer Farooq",
  html_url: "https://github.com/Umer-Farooq-CS",
  public_repos: 24,
  followers: 14,
  // Fields the schema does not model must be tolerated, not rejected.
  company: null,
};

const reposFixture = [
  {
    name: "Umer-Farooq-CS",
    description: "My Profile",
    html_url: "https://github.com/Umer-Farooq-CS/Umer-Farooq-CS",
    stargazers_count: 3,
    language: null,
    pushed_at: "2026-08-24T01:01:30Z",
    fork: false,
  },
  {
    name: "someones-fork",
    description: "not mine",
    html_url: "https://github.com/Umer-Farooq-CS/someones-fork",
    stargazers_count: 99,
    language: "Go",
    pushed_at: "2026-08-01T00:00:00Z",
    fork: true,
  },
  {
    name: "QCanvas",
    description: "  Unified quantum-simulation platform  ",
    html_url: "https://github.com/Umer-Farooq-CS/QCanvas",
    stargazers_count: 2,
    language: "Jupyter Notebook",
    pushed_at: "2026-07-17T16:16:06Z",
    topics: ["cirq", "qiskit", "pennylane", "openqasm-3", "fastapi", "nextjs", "websockets"],
    fork: false,
  },
  {
    name: "Q-Tensor",
    description: null,
    html_url: "https://github.com/Umer-Farooq-CS/Q-Tensor",
    stargazers_count: 1,
    language: "Julia",
    pushed_at: "2026-06-30T19:38:40Z",
    fork: false,
  },
  {
    name: "MNIST-Classification",
    description: "Tensor-core MNIST",
    html_url: "https://github.com/Umer-Farooq-CS/MNIST-Classification",
    stargazers_count: 1,
    language: "Cuda",
    pushed_at: "2025-09-12T14:16:34Z",
    fork: false,
  },
  {
    name: "Canny-Edge-Detector",
    description: "CPU and CUDA Canny",
    html_url: "https://github.com/Umer-Farooq-CS/Canny-Edge-Detector",
    stargazers_count: 1,
    language: "Cuda",
    pushed_at: "2025-09-11T14:32:11Z",
    fork: false,
  },
];

describe("buildGithubSnapshot", () => {
  const snapshot = buildGithubSnapshot(userFixture, reposFixture, AT);

  it("drops forks and the profile-README repo from the activity list", () => {
    expect(snapshot.repos.map((repo) => repo.name)).toEqual([
      "QCanvas",
      "Q-Tensor",
      "MNIST-Classification",
      "Canny-Edge-Detector",
    ]);
  });

  it("counts stars across owned repos, including the profile repo, and never forks", () => {
    // 3 (profile) + 2 + 1 + 1 + 1 = 8. The fork's 99 stars are someone else's.
    expect(snapshot.totalStars).toBe(8);
  });

  it("aggregates languages by repo count, ties broken alphabetically", () => {
    expect(snapshot.languages).toEqual([
      { name: "Cuda", repos: 2 },
      { name: "Julia", repos: 1 },
      { name: "Jupyter Notebook", repos: 1 },
    ]);
  });

  it("normalises the fields the UI renders", () => {
    const [qcanvas, qtensor] = snapshot.repos;
    expect(qcanvas.description).toBe("Unified quantum-simulation platform");
    expect(qcanvas.topics).toHaveLength(6);
    // A null description becomes an empty string, so the UI has one case to handle.
    expect(qtensor.description).toBe("");
    expect(qtensor.pushedAt).toBe("2026-06-30T19:38:40.000Z");
    expect(snapshot.fetchedAt).toBe(AT);
  });

  it("rejects a response that is missing a required field", () => {
    expect(() => buildGithubSnapshot({ login: "x" }, [], AT)).toThrow();
  });
});

describe("buildContributionsSnapshot", () => {
  const fixture = {
    total: { lastYear: 9 },
    contributions: [
      { date: "2025-08-27", count: 5 },
      { date: "2025-08-24", count: 0 },
      { date: "2025-08-25", count: 4 },
      { date: "2025-08-26", count: 0 },
    ],
  };

  it("sorts, compresses to active days, and flattens the total", () => {
    const snapshot = buildContributionsSnapshot(fixture, AT);
    expect(snapshot.total).toBe(9);
    expect(snapshot.startDate).toBe("2025-08-24");
    expect(snapshot.endDate).toBe("2025-08-27");
    expect(snapshot.activeDays).toEqual([
      { date: "2025-08-25", count: 4 },
      { date: "2025-08-27", count: 5 },
    ]);
  });

  it("accepts a plain numeric total as well as the per-year map", () => {
    expect(buildContributionsSnapshot({ ...fixture, total: 9 }, AT).total).toBe(9);
  });

  it("refuses a series with a gap, because the grid indexes by day offset", () => {
    expect(() =>
      buildContributionsSnapshot(
        { total: 1, contributions: [{ date: "2025-08-24", count: 1 }, { date: "2025-08-26", count: 0 }] },
        AT,
      ),
    ).toThrow(/not consecutive/);
  });
});

describe("fetch error handling", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const responseOf = (init: { ok: boolean; status: number; headers?: Record<string, string>; body?: unknown }) =>
    ({
      ok: init.ok,
      status: init.status,
      headers: { get: (name: string) => init.headers?.[name] ?? null },
      json: async () => init.body,
    }) as unknown as Response;

  it("names a spent GitHub rate limit specifically", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        responseOf({
          ok: false,
          status: 403,
          headers: { "X-RateLimit-Remaining": "0", "X-RateLimit-Reset": "1800000000" },
        }),
      ),
    );
    await expect(fetchGithubSnapshot("Umer-Farooq-CS")).rejects.toThrow(/rate limit/i);
  });

  it("reports any other GitHub failure with its status", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => responseOf({ ok: false, status: 500 })));
    await expect(fetchGithubSnapshot("Umer-Farooq-CS")).rejects.toThrow(/HTTP 500/);
  });

  it("builds a snapshot from live GitHub responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) =>
        responseOf({
          ok: true,
          status: 200,
          body: url.includes("/repos") ? reposFixture : userFixture,
        }),
      ),
    );
    const snapshot = await fetchGithubSnapshot("Umer-Farooq-CS");
    expect(snapshot.publicRepos).toBe(24);
    expect(snapshot.repos[0].name).toBe("QCanvas");
  });

  it("reports a contribution-graph failure with its status", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => responseOf({ ok: false, status: 502 })));
    await expect(fetchContributionsSnapshot("Umer-Farooq-CS")).rejects.toThrow(/HTTP 502/);
  });
});

// ---------------------------------------------------------------------------
// freshness
// ---------------------------------------------------------------------------

describe("relative time and freshness", () => {
  const now = new Date("2026-08-24T12:00:00.000Z");

  it("picks the largest unit that still reads as a measurement", () => {
    expect(relativeTime("2026-08-24T11:59:30.000Z", now)).toBe("just now");
    expect(relativeTime("2026-08-24T11:20:00.000Z", now)).toBe("40m ago");
    expect(relativeTime("2026-08-24T09:00:00.000Z", now)).toBe("3h ago");
    expect(relativeTime("2026-08-23T00:00:00.000Z", now)).toBe("36h ago");
    expect(relativeTime("2026-08-19T12:00:00.000Z", now)).toBe("5d ago");
    expect(relativeTime("2026-05-24T12:00:00.000Z", now)).toBe("3mo ago");
  });

  it("says never for the epoch timestamp the pipeline writes for a dead source", () => {
    expect(relativeTime(new Date(0).toISOString(), now)).toBe("never");
    expect(relativeTime("not a date", now)).toBe("never");
    expect(freshness(new Date(0).toISOString(), now)).toBe("not fetched yet");
  });

  it("prefixes a readable timestamp", () => {
    expect(freshness("2026-08-24T09:00:00.000Z", now)).toBe("updated 3h ago");
  });

  it("formats a day without depending on the runtime locale", () => {
    expect(formatDay("2026-08-24")).toBe("24 Aug 2026");
    expect(formatDay("2025-09-01T10:11:12.000Z")).toBe("1 Sep 2025");
  });
});

// ---------------------------------------------------------------------------
// heatmap
// ---------------------------------------------------------------------------

describe("heatmap bucketing", () => {
  it("maps a count to the ramp step its threshold owns", () => {
    expect(heatmapStep(0)).toBe(0);
    expect(heatmapStep(1)).toBe(1);
    expect(heatmapStep(2)).toBe(1);
    expect(heatmapStep(3)).toBe(2);
    expect(heatmapStep(5)).toBe(2);
    expect(heatmapStep(6)).toBe(3);
    expect(heatmapStep(9)).toBe(3);
    expect(heatmapStep(10)).toBe(4);
    expect(heatmapStep(14)).toBe(4);
    expect(heatmapStep(15)).toBe(5);
    expect(heatmapStep(28)).toBe(5);
  });

  it("puts each threshold at the bottom of its own step", () => {
    HEATMAP_THRESHOLDS.forEach((threshold, position) => {
      expect(heatmapStep(threshold)).toBe(position + 1);
      expect(heatmapStep(threshold - 1)).toBe(position);
    });
  });

  it("labels each step with the range it covers", () => {
    expect(heatmapStepRange(0)).toBe("0");
    expect(heatmapStepRange(1)).toBe("1–2");
    expect(heatmapStepRange(4)).toBe("10–14");
    expect(heatmapStepRange(5)).toBe("15+");
  });
});

describe("contributionGrid", () => {
  it("lays out whole Sunday-first weeks and fills the days the snapshot omits", () => {
    const grid = contributionGrid({
      fetchedAt: AT,
      total: 4,
      startDate: "2025-08-24", // a Sunday
      endDate: "2025-09-06",
      activeDays: [{ date: "2025-08-26", count: 4 }],
    });
    expect(grid.weeks).toHaveLength(2);
    expect(grid.days).toBe(14);
    expect(grid.weeks[0][0]?.date).toBe("2025-08-24");
    expect(grid.weeks[0][1]?.count).toBe(0);
    expect(grid.weeks[0][2]).toEqual({ date: "2025-08-26", count: 4, step: 2 });
    expect(grid.activeDays).toBe(1);
    expect(grid.busiest?.date).toBe("2025-08-26");
  });

  it("pads the first column when the window does not start on a Sunday", () => {
    const grid = contributionGrid({
      fetchedAt: AT,
      total: 0,
      startDate: "2025-08-26", // a Tuesday
      endDate: "2025-08-30",
      activeDays: [],
    });
    expect(grid.weeks).toHaveLength(1);
    expect(grid.weeks[0][0]).toBeNull();
    expect(grid.weeks[0][1]).toBeNull();
    expect(grid.weeks[0][2]?.date).toBe("2025-08-26");
    // Nothing happened, so there is no busiest day to point at.
    expect(grid.busiest).toBeNull();
  });

  it("totals each month and records the column it starts in", () => {
    const grid = contributionGrid({
      fetchedAt: AT,
      total: 9,
      startDate: "2025-08-24",
      endDate: "2025-09-06",
      activeDays: [
        { date: "2025-08-26", count: 4 },
        { date: "2025-09-02", count: 5 },
      ],
    });
    expect(grid.months).toEqual([
      { key: "2025-08", label: "Aug 2025", total: 4, column: 0 },
      { key: "2025-09", label: "Sep 2025", total: 5, column: 1 },
    ]);
  });

  it("returns an empty grid rather than throwing on a placeholder snapshot", () => {
    const grid = contributionGrid({
      fetchedAt: new Date(0).toISOString(),
      total: 0,
      startDate: "2026-01-02",
      endDate: "2026-01-01", // end before start
      activeDays: [],
    });
    expect(grid.weeks).toHaveLength(0);
    expect(grid.months).toHaveLength(0);
  });

  it("expands the committed snapshot into a full year of whole weeks", () => {
    const grid = contributionGrid(CONTRIBUTIONS_SNAPSHOT);
    expect(grid.days).toBeGreaterThanOrEqual(365);
    expect(grid.weeks.length).toBeGreaterThanOrEqual(52);
    expect(grid.weeks.length).toBeLessThanOrEqual(54);
    for (const week of grid.weeks) expect(week).toHaveLength(7);

    const cells = grid.weeks.flat().filter((cell) => cell !== null);
    expect(cells).toHaveLength(grid.days);
    expect(cells.reduce((sum, cell) => sum + cell.count, 0)).toBe(CONTRIBUTIONS_SNAPSHOT.total);
    for (const cell of cells) expect(cell.step).toBe(heatmapStep(cell.count));
  });
});

// ---------------------------------------------------------------------------
// the section itself
// ---------------------------------------------------------------------------

describe("LiveActivity", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the snapshot and says so plainly when revalidation fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new Error("offline"))));
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      createElement(QueryClientProvider, {
        client,
        children: createElement(MotionPolicyProvider, { children: createElement(LiveActivity) }),
      }),
    );

    // The calendar is present and labelled with the real total before any fetch
    // resolves — that is the whole point of the build-time snapshot.
    expect(
      screen.getByRole("img", {
        name: new RegExp(`${CONTRIBUTIONS_SNAPSHOT.total} contributions`),
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(GITHUB_SNAPSHOT.repos[0].name)).toBeInTheDocument();

    // The reading list must never read as authored here.
    expect(screen.getByText(/not\s*authored here/i)).toBeInTheDocument();

    expect(await screen.findByText(/numbers from the last build/i)).toBeInTheDocument();
  });
});
