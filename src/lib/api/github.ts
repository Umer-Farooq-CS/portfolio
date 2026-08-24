// Browser-side GitHub fetcher.
//
// The GitHub REST API for public data needs no auth and sends
// `Access-Control-Allow-Origin: *`, so it is safe to call from the page. The
// unauthenticated limit is 60 requests/hour/IP, which is why the snapshot in
// src/data/generated is the source of truth for first paint and this is only
// revalidation on top of it. Any failure throws; the query layer keeps showing
// the snapshot (see src/hooks/useLiveData.ts).
//
// The aggregation here intentionally mirrors `collectGithub()` in
// scripts/fetch-data.mjs. Node cannot import this module and the browser cannot
// import the script, so the two agree by construction of the same trim limits
// and the same schema — and src/test/live-data.test.ts pins the behaviour.

import { z } from "zod";
import { githubSnapshotSchema, type GithubSnapshot, type Repo } from "@/data/generated";

const GITHUB_LOGIN = "Umer-Farooq-CS";

/** Must match MAX_REPOS / MAX_LANGUAGES in scripts/fetch-data.mjs. */
const MAX_REPOS = 10;
const MAX_LANGUAGES = 8;

const userResponseSchema = z.object({
  login: z.string().min(1),
  name: z.string().nullable().optional(),
  html_url: z.string().url(),
  public_repos: z.number().int().nonnegative(),
  followers: z.number().int().nonnegative(),
});

const repoResponseSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  html_url: z.string().url(),
  stargazers_count: z.number().int().nonnegative(),
  language: z.string().nullable().optional(),
  pushed_at: z.string().min(1),
  topics: z.array(z.string()).optional(),
  fork: z.boolean(),
});

const reposResponseSchema = z.array(repoResponseSchema);

export type GithubUserResponse = z.infer<typeof userResponseSchema>;
export type GithubRepoResponse = z.infer<typeof repoResponseSchema>;

/**
 * Turns a non-2xx response into an error a human can act on. GitHub answers a
 * spent rate limit with 403 (or 429) plus `X-RateLimit-Remaining: 0`, which is
 * worth naming separately — it is the one failure a visitor can cause just by
 * reloading, and it resolves on its own.
 */
function assertOk(response: Response, label: string): void {
  if (response.ok) return;
  const remaining = response.headers.get("X-RateLimit-Remaining");
  if ((response.status === 403 || response.status === 429) && remaining === "0") {
    const reset = response.headers.get("X-RateLimit-Reset");
    const resetAt = reset ? new Date(Number(reset) * 1000).toISOString() : "unknown";
    throw new Error(
      `GitHub rate limit reached for this IP (60 requests/hour, resets ${resetAt}).`,
    );
  }
  throw new Error(`GitHub ${label} request failed: HTTP ${response.status}.`);
}

async function getJson(url: string, label: string, signal?: AbortSignal): Promise<unknown> {
  const response = await fetch(url, {
    headers: { Accept: "application/vnd.github+json" },
    signal,
  });
  assertOk(response, label);
  return response.json();
}

/** Repo count per language, biggest first. Repos with no detected language drop out. */
export function aggregateLanguages(repos: GithubRepoResponse[]): GithubSnapshot["languages"] {
  const counts = new Map<string, number>();
  for (const repo of repos) {
    if (!repo.language) continue;
    counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, repoCount]) => ({ name, repos: repoCount }))
    .sort((a, b) => b.repos - a.repos || a.name.localeCompare(b.name))
    .slice(0, MAX_LANGUAGES);
}

/** The most recently pushed repos, newest first. */
export function recentRepos(repos: GithubRepoResponse[]): Repo[] {
  return repos
    .slice()
    .sort((a, b) => Date.parse(b.pushed_at) - Date.parse(a.pushed_at))
    .slice(0, MAX_REPOS)
    .map((repo) => ({
      name: repo.name,
      description: (repo.description ?? "").trim(),
      url: repo.html_url,
      stars: repo.stargazers_count,
      language: repo.language ?? "",
      pushedAt: new Date(repo.pushed_at).toISOString(),
      topics: (repo.topics ?? []).slice(0, 6),
    }));
}

/**
 * Assembles the snapshot shape from two raw API responses. Pure, so the test can
 * exercise it against a fixture without a network.
 */
export function buildGithubSnapshot(
  user: unknown,
  repos: unknown,
  fetchedAt: string = new Date().toISOString(),
): GithubSnapshot {
  const parsedUser = userResponseSchema.parse(user);
  const parsedRepos = reposResponseSchema.parse(repos);

  // Forks are someone else's work. The profile-README repo (named after the
  // account) is a page rather than a project, so it stays out of the activity
  // list — its stars still count toward the total.
  const owned = parsedRepos.filter((repo) => !repo.fork);
  const projects = owned.filter(
    (repo) => repo.name.toLowerCase() !== parsedUser.login.toLowerCase(),
  );

  return githubSnapshotSchema.parse({
    fetchedAt,
    login: parsedUser.login,
    name: parsedUser.name ?? parsedUser.login,
    url: parsedUser.html_url,
    publicRepos: parsedUser.public_repos,
    followers: parsedUser.followers,
    totalStars: owned.reduce((sum, repo) => sum + repo.stargazers_count, 0),
    languages: aggregateLanguages(projects),
    repos: recentRepos(projects),
  });
}

/** Live GitHub profile and repositories, aggregated into the snapshot shape. */
export async function fetchGithubSnapshot(
  login: string = GITHUB_LOGIN,
  signal?: AbortSignal,
): Promise<GithubSnapshot> {
  const [user, repos] = await Promise.all([
    getJson(`https://api.github.com/users/${login}`, "user", signal),
    getJson(
      `https://api.github.com/users/${login}/repos?per_page=100&sort=pushed`,
      "repos",
      signal,
    ),
  ]);
  return buildGithubSnapshot(user, repos);
}
