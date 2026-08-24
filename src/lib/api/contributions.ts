// Browser-side contribution-graph fetcher.
//
// GitHub does not expose the contribution calendar through its REST API, so this
// goes through jogruber.de's GraphQL proxy, which needs no auth and sends
// `Access-Control-Allow-Origin: *`. It is a third party, so downtime is expected
// rather than exceptional: any failure throws and the query layer keeps showing
// the committed snapshot.
//
// Mirrors `collectContributions()` in scripts/fetch-data.mjs.

import { z } from "zod";
import { contributionsSnapshotSchema, type ContributionsSnapshot } from "@/data/generated";

const GITHUB_LOGIN = "Umer-Farooq-CS";

const DAY_MS = 86_400_000;

const responseSchema = z.object({
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

export type ContributionsResponse = z.infer<typeof responseSchema>;

/**
 * Compresses the raw calendar into the snapshot shape. Pure, so the test can
 * exercise it against a fixture without a network.
 *
 * Throws when the series has a gap: the heatmap places cells by offset from
 * `startDate`, so a missing day would shift every later day into the wrong
 * column. A visibly missing chart beats a chart that is quietly wrong.
 */
export function buildContributionsSnapshot(
  raw: unknown,
  fetchedAt: string = new Date().toISOString(),
): ContributionsSnapshot {
  const parsed = responseSchema.parse(raw);

  const days = parsed.contributions
    .map((day) => ({ date: day.date, count: day.count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const first = days[0];
  const last = days[days.length - 1];
  const spanDays =
    Math.round(
      (Date.parse(`${last.date}T00:00:00Z`) - Date.parse(`${first.date}T00:00:00Z`)) / DAY_MS,
    ) + 1;
  if (spanDays !== days.length) {
    throw new Error(`Contribution days are not consecutive: ${days.length} of ${spanDays}.`);
  }

  const total =
    typeof parsed.total === "number"
      ? parsed.total
      : Object.values(parsed.total).reduce((sum, value) => sum + value, 0);

  return contributionsSnapshotSchema.parse({
    fetchedAt,
    total,
    startDate: first.date,
    endDate: last.date,
    activeDays: days.filter((day) => day.count > 0),
  });
}

export async function fetchContributionsSnapshot(
  login: string = GITHUB_LOGIN,
  signal?: AbortSignal,
): Promise<ContributionsSnapshot> {
  const response = await fetch(
    `https://github-contributions-api.jogruber.de/v4/${login}?y=last`,
    { signal },
  );
  if (!response.ok) {
    throw new Error(`Contribution graph request failed: HTTP ${response.status}.`);
  }
  return buildContributionsSnapshot(await response.json());
}
