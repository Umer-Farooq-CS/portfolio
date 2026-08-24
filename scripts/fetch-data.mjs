// Build-time snapshot of the live data the site shows.
//
// GitHub Pages is a static host, so there is no server to proxy an API at
// runtime. This script runs in CI (and locally) before the Vite build, writes
// validated JSON into src/data/generated/, and the bundle embeds it. The page
// therefore paints real numbers on the first frame and keeps working when the
// visitor's network blocks third-party requests. The browser only revalidates
// the CORS-safe sources on top of that — see src/hooks/useLiveData.ts.
//
// Rules this file follows:
//   1. Every upstream response is validated with zod before anything is written.
//   2. A failing or malformed source KEEPS the committed snapshot and logs a
//      warning. The pipeline degrades; the build never fails on a third party.
//   3. Writes go to a temp file and are renamed, so a crash mid-write cannot
//      leave a half-written JSON file that the build would then embed.
//
// Usage:
//   node scripts/fetch-data.mjs
//   node scripts/fetch-data.mjs --only=github,contributions
//
// An optional GITHUB_TOKEN raises the GitHub rate limit from 60 to 5000
// requests/hour. In GitHub Actions, pass the automatic secrets.GITHUB_TOKEN.

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = resolve(ROOT, "src/data/generated");

const LOGIN = "Umer-Farooq-CS";
const USER_AGENT = `${LOGIN}-portfolio/1.0 (+https://github.com/${LOGIN}/portfolio)`;

/** Trim limits. The snapshot ships inside the JS bundle, so it holds only what renders. */
const MAX_REPOS = 10;
const MAX_LANGUAGES = 8;
const MAX_PAPERS = 5;
const SUMMARY_CHARS = 220;

/** arXiv asks for one request every three seconds and throttles hard past that. */
const RETRY_DELAYS_MS = [0, 4_000, 15_000, 30_000];

// ---------------------------------------------------------------------------
// transport
// ---------------------------------------------------------------------------

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

/**
 * One fetch with backoff on the responses that mean "ask again later" (429 and
 * 5xx). Anything else fails immediately — retrying a 404 only burns CI minutes.
 */
async function fetchWithRetry(url, { headers = {}, attempts = RETRY_DELAYS_MS.length } = {}) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (RETRY_DELAYS_MS[attempt]) await sleep(RETRY_DELAYS_MS[attempt]);
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": USER_AGENT, ...headers },
        signal: AbortSignal.timeout(20_000),
      });
      if (response.ok) return response;
      lastError = new Error(`HTTP ${response.status} ${response.statusText}`);
      const retryable = response.status === 429 || response.status >= 500;
      if (!retryable) throw lastError;
    } catch (error) {
      lastError = error;
      // A timeout or transport failure is worth one more attempt.
      if (attempt === attempts - 1) throw lastError;
    }
  }
  throw lastError ?? new Error(`Unreachable: ${url}`);
}

async function fetchJson(url, options) {
  const response = await fetchWithRetry(url, options);
  return response.json();
}

// ---------------------------------------------------------------------------
// upstream schemas — what we are willing to accept from a third party
// ---------------------------------------------------------------------------

const ghUserSchema = z.object({
  login: z.string().min(1),
  name: z.string().nullable().optional(),
  html_url: z.string().url(),
  public_repos: z.number().int().nonnegative(),
  followers: z.number().int().nonnegative(),
});

const ghRepoSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  html_url: z.string().url(),
  stargazers_count: z.number().int().nonnegative(),
  language: z.string().nullable().optional(),
  pushed_at: z.string().min(1),
  topics: z.array(z.string()).optional(),
  fork: z.boolean(),
});

const ghReposSchema = z.array(ghRepoSchema);

const contributionsUpstreamSchema = z.object({
  // With ?y=last the API answers { lastYear: n }; other queries answer a
  // per-year map. Accept both rather than pinning one undocumented shape.
  total: z.union([z.number(), z.record(z.number())]),
  contributions: z
    .array(
      z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        count: z.number().int().nonnegative(),
      }),
    )
    .min(1),
});

// ---------------------------------------------------------------------------
// snapshot schemas — what we are willing to commit
//
// These mirror src/data/generated/index.ts, which is what the app types against
// and what src/test/live-data.test.ts validates the committed files with. Node
// cannot import the .ts module, so the shape is stated twice; the test fails if
// the two ever drift.
// ---------------------------------------------------------------------------

const isoDate = z.string().datetime();
const dayString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const githubSnapshotSchema = z.object({
  fetchedAt: isoDate,
  login: z.string().min(1),
  name: z.string().min(1),
  url: z.string().url(),
  publicRepos: z.number().int().nonnegative(),
  followers: z.number().int().nonnegative(),
  totalStars: z.number().int().nonnegative(),
  languages: z.array(z.object({ name: z.string().min(1), repos: z.number().int().positive() })),
  repos: z.array(
    z.object({
      name: z.string().min(1),
      description: z.string(),
      url: z.string().url(),
      stars: z.number().int().nonnegative(),
      language: z.string(),
      pushedAt: isoDate,
      topics: z.array(z.string()),
    }),
  ),
});

const contributionsSnapshotSchema = z.object({
  fetchedAt: isoDate,
  total: z.number().int().nonnegative(),
  startDate: dayString,
  endDate: dayString,
  /**
   * Only the days that had activity. The window is dense by construction, so
   * startDate plus the non-zero days reconstructs the full grid — and it cuts
   * the committed file by about 80% versus listing 366 mostly-zero entries.
   */
  activeDays: z.array(z.object({ date: dayString, count: z.number().int().positive() })),
});

const readingSnapshotSchema = z.object({
  fetchedAt: isoDate,
  query: z.string().min(1),
  papers: z.array(
    z.object({
      id: z.string().min(1),
      title: z.string().min(1),
      summary: z.string().min(1),
      authors: z.array(z.string().min(1)).min(1),
      published: isoDate,
      link: z.string().url(),
      category: z.string().min(1),
    }),
  ),
});

// ---------------------------------------------------------------------------
// github
// ---------------------------------------------------------------------------

/** Repo count per language, biggest first. Repos with no detected language drop out. */
function aggregateLanguages(repos) {
  const counts = new Map();
  for (const repo of repos) {
    if (!repo.language) continue;
    counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, repos: count }))
    .sort((a, b) => b.repos - a.repos || a.name.localeCompare(b.name))
    .slice(0, MAX_LANGUAGES);
}

async function collectGithub() {
  const headers = process.env.GITHUB_TOKEN
    ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    : {};

  const [user, rawRepos] = await Promise.all([
    fetchJson(`https://api.github.com/users/${LOGIN}`, { headers }).then((data) =>
      ghUserSchema.parse(data),
    ),
    fetchJson(`https://api.github.com/users/${LOGIN}/repos?per_page=100&sort=pushed`, {
      headers,
    }).then((data) => ghReposSchema.parse(data)),
  ]);

  // Forks are someone else's work. The profile-README repo (named after the
  // account) is a page rather than a project, so it stays out of the activity
  // list — its stars, if it ever has any, still count toward the total.
  const owned = rawRepos.filter((repo) => !repo.fork);
  const projects = owned.filter((repo) => repo.name.toLowerCase() !== LOGIN.toLowerCase());

  const snapshot = {
    fetchedAt: new Date().toISOString(),
    login: user.login,
    name: user.name ?? user.login,
    url: user.html_url,
    publicRepos: user.public_repos,
    followers: user.followers,
    totalStars: owned.reduce((sum, repo) => sum + repo.stargazers_count, 0),
    languages: aggregateLanguages(projects),
    repos: projects
      // The API already sorts by pushed_at; sorted again so the snapshot does not
      // depend on the endpoint honouring the sort parameter.
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
      })),
  };

  return {
    snapshot,
    detail:
      `${snapshot.publicRepos} repos · ${snapshot.totalStars} stars · ` +
      `${snapshot.languages.length} languages · ${snapshot.repos.length} listed`,
  };
}

// ---------------------------------------------------------------------------
// contributions
// ---------------------------------------------------------------------------

async function collectContributions() {
  const raw = contributionsUpstreamSchema.parse(
    await fetchJson(`https://github-contributions-api.jogruber.de/v4/${LOGIN}?y=last`),
  );

  const days = raw.contributions
    .map((day) => ({ date: day.date, count: day.count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const total =
    typeof raw.total === "number"
      ? raw.total
      : Object.values(raw.total).reduce((sum, value) => sum + value, 0);

  // The heatmap places cells by offset from startDate, so a gap in the series
  // would shift every later day into the wrong column. Reject rather than draw
  // a chart that is quietly wrong.
  const spanDays =
    Math.round(
      (Date.parse(`${days[days.length - 1].date}T00:00:00Z`) -
        Date.parse(`${days[0].date}T00:00:00Z`)) /
        86_400_000,
    ) + 1;
  if (spanDays !== days.length) {
    throw new Error(`Contribution days are not consecutive: ${days.length} of ${spanDays}`);
  }

  const activeDays = days.filter((day) => day.count > 0);
  const snapshot = {
    fetchedAt: new Date().toISOString(),
    total,
    startDate: days[0].date,
    endDate: days[days.length - 1].date,
    activeDays,
  };

  return {
    snapshot,
    detail: `${total} contributions · ${days.length} days · ${activeDays.length} active`,
  };
}

// ---------------------------------------------------------------------------
// arXiv
//
// Atom XML, and the endpoint sends no Access-Control-Allow-Origin header, so it
// is build-time only — never call it from the browser. Parsed with string
// matching rather than an XML dependency: the response is a flat Atom feed of at
// most six entries, which does not justify a parser in the tree.
// ---------------------------------------------------------------------------

const ARXIV_QUERY = "cat:quant-ph OR cat:cs.DC";
const ARXIV_URL =
  "https://export.arxiv.org/api/query?search_query=cat:quant-ph+OR+cat:cs.DC" +
  "&sortBy=submittedDate&sortOrder=descending&max_results=6";

const XML_ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

function decodeXml(value) {
  return value.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-z]+);/g, (match, entity) => {
    if (entity.startsWith("#x")) return String.fromCodePoint(parseInt(entity.slice(2), 16));
    if (entity.startsWith("#")) return String.fromCodePoint(parseInt(entity.slice(1), 10));
    return XML_ENTITIES[entity] ?? match;
  });
}

/** arXiv hard-wraps titles and abstracts, so every text node needs reflowing. */
function textNode(source, tag) {
  const match = source.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`));
  return match ? decodeXml(match[1]).replace(/\s+/g, " ").trim() : "";
}

function truncate(value, limit) {
  if (value.length <= limit) return value;
  const cut = value.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  const kept = lastSpace > limit * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${kept.replace(/[.,;:]+$/, "")}…`;
}

function parseArxivAtom(xml) {
  return [...xml.matchAll(/<entry\b[^>]*>([\s\S]*?)<\/entry>/g)].map(([, entry]) => {
    // arXiv still emits http:// abs URLs; the site is served over https.
    const link = textNode(entry, "id").replace(/^http:\/\//, "https://");
    const authors = [...entry.matchAll(/<author\b[^>]*>([\s\S]*?)<\/author>/g)]
      .map(([, author]) => textNode(author, "name"))
      .filter(Boolean);
    const primary = entry.match(/<arxiv:primary_category\b[^>]*\bterm="([^"]+)"/);
    return {
      // The bare identifier, e.g. "2608.01234v1". The abs URL is in `link`.
      id: link.replace(/^https?:\/\/arxiv\.org\/abs\//, ""),
      title: textNode(entry, "title"),
      summary: truncate(textNode(entry, "summary"), SUMMARY_CHARS),
      authors,
      published: textNode(entry, "published"),
      link,
      category: primary ? primary[1] : "",
    };
  });
}

async function collectReading() {
  const response = await fetchWithRetry(ARXIV_URL);
  const xml = await response.text();
  const papers = parseArxivAtom(xml)
    .filter((paper) => paper.title && paper.link && paper.authors.length > 0 && paper.published)
    .slice(0, MAX_PAPERS)
    .map((paper) => ({
      ...paper,
      published: new Date(paper.published).toISOString(),
      category: paper.category || "quant-ph",
    }));

  if (papers.length === 0) throw new Error("arXiv returned no parsable entries");

  return {
    snapshot: { fetchedAt: new Date().toISOString(), query: ARXIV_QUERY, papers },
    detail: `${papers.length} preprints · newest ${papers[0].published.slice(0, 10)}`,
  };
}

// ---------------------------------------------------------------------------
// writing
// ---------------------------------------------------------------------------

/**
 * Validate, write to a sibling temp file, then rename over the target. Rename is
 * atomic on POSIX and on Windows, so no reader ever sees a partial file.
 */
async function writeSnapshot(file, schema, snapshot) {
  const parsed = schema.parse(snapshot);
  const target = resolve(OUT_DIR, file);
  const temp = `${target}.tmp`;
  await writeFile(temp, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
  await rename(temp, target);
}

/** The committed snapshot's timestamp, or null when there is nothing usable to keep. */
async function committedAt(file, schema) {
  try {
    return schema.parse(JSON.parse(await readFile(resolve(OUT_DIR, file), "utf8"))).fetchedAt;
  } catch {
    return null;
  }
}

const EPOCH = new Date(0).toISOString();

const SOURCES = [
  {
    key: "github",
    file: "github.json",
    schema: githubSnapshotSchema,
    collect: collectGithub,
    empty: {
      fetchedAt: EPOCH,
      login: LOGIN,
      name: LOGIN,
      url: `https://github.com/${LOGIN}`,
      publicRepos: 0,
      followers: 0,
      totalStars: 0,
      languages: [],
      repos: [],
    },
  },
  {
    key: "contributions",
    file: "contributions.json",
    schema: contributionsSnapshotSchema,
    collect: collectContributions,
    empty: {
      fetchedAt: EPOCH,
      total: 0,
      startDate: "1970-01-01",
      endDate: "1970-01-01",
      activeDays: [],
    },
  },
  {
    key: "reading",
    file: "reading.json",
    schema: readingSnapshotSchema,
    collect: collectReading,
    empty: { fetchedAt: EPOCH, query: ARXIV_QUERY, papers: [] },
  },
];

async function main() {
  const only = process.argv
    .find((arg) => arg.startsWith("--only="))
    ?.slice("--only=".length)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  await mkdir(OUT_DIR, { recursive: true });

  const rows = [];
  for (const source of SOURCES) {
    if (only && !only.includes(source.key)) {
      rows.push([source.key, "skip", "not selected by --only"]);
      continue;
    }
    try {
      const { snapshot, detail } = await source.collect();
      await writeSnapshot(source.file, source.schema, snapshot);
      rows.push([source.key, "ok", detail]);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const kept = await committedAt(source.file, source.schema);
      if (kept) {
        rows.push([source.key, "kept", `${message} — keeping snapshot from ${kept}`]);
      } else {
        // Nothing usable on disk. Seed a valid empty snapshot so the bundle still
        // compiles; the UI reads an epoch fetchedAt as "no data yet" and hides
        // the affected block instead of rendering zeros as if they were measured.
        await writeSnapshot(source.file, source.schema, source.empty);
        rows.push([source.key, "empty", `${message} — wrote an empty placeholder`]);
      }
    }
  }

  const width = Math.max(...rows.map(([key]) => key.length));
  console.log("fetch-data — src/data/generated/");
  for (const [key, status, detail] of rows) {
    console.log(`  ${key.padEnd(width)}  ${status.padEnd(5)}  ${detail}`);
  }
  const degraded = rows.filter(([, status]) => status === "kept" || status === "empty");
  if (degraded.length > 0) {
    console.warn(`\n  ${degraded.length} source(s) degraded — the build continues with what is on disk.`);
  }
  // Always 0: a third party being down must not fail a deploy.
  process.exit(0);
}

await main();
