import { useMemo } from "react";
import { motion } from "motion/react";
import { ExternalLink } from "lucide-react";
import { READING_SNAPSHOT, type Paper } from "@/data/generated";
import {
  contributionGrid,
  freshness,
  formatDay,
  heatmapStepRange,
  relativeTime,
  useContributions,
  useGithubProfile,
  useRepos,
  type HeatmapStep,
  type MonthTotal,
} from "@/hooks/useLiveData";
import { AccentText, ChapterHeader, Metric, MonoLabel } from "@/components/kit/Primitives";
import { useMotionPolicy } from "@/lib/motion-policy";

/**
 * Live activity — the one section on the site whose numbers were not written by
 * hand. GitHub and arXiv are read at build time into src/data/generated, and the
 * CORS-safe half is read again in the browser, so the panel is current without a
 * server behind it.
 *
 * Treated as an instrument panel rather than a dashboard: hairline rules, mono
 * numbers, one plot ground for the calendar, and no nested surfaces.
 */

/**
 * Heatmap ramp. Referenced as raw custom properties rather than
 * `bg-chart-scale-0N` utilities because the step is computed per cell, and a
 * class name assembled at runtime would never be seen by Tailwind's scanner.
 * These tokens are declared on `:root` and `.dark` in index.css, so `var()`
 * resolves correctly in both themes.
 */
const STEP_FILL: Record<HeatmapStep, string> = {
  0: "var(--color-surface-alt)",
  1: "var(--chart-scale-01)",
  2: "var(--chart-scale-02)",
  3: "var(--chart-scale-03)",
  4: "var(--chart-scale-04)",
  5: "var(--chart-scale-05)",
};

const STEPS: HeatmapStep[] = [0, 1, 2, 3, 4, 5];

/** Cell geometry, in SVG user units. */
const CELL = 10;
const PITCH = 13;
const GUTTER_LEFT = 22;
const GUTTER_TOP = 14;
/** Sunday is row 0; only alternate rows are labelled, or the axis becomes noise. */
const WEEKDAY_LABELS: Record<number, string> = { 1: "Mon", 3: "Wed", 5: "Fri" };

/** arXiv categories use the same semantic legend as the rest of the site. */
function categoryClass(category: string): string {
  if (category.startsWith("quant-ph")) return "text-cryo-type";
  if (category.startsWith("cs.DC")) return "text-systems-type";
  return "text-muted-foreground";
}

/** Three names then "et al." — enough to recognise a group, short enough to scan. */
function authorLine(authors: string[]): string {
  return authors.length <= 3
    ? authors.join(", ")
    : `${authors.slice(0, 3).join(", ")} et al.`;
}

const ARXIV_RECENT_URL =
  "https://arxiv.org/search/?query=quant-ph+OR+cs.DC&searchtype=all&abstracts=show&order=-announced_date_first&size=50";

interface LiveActivityProps {
  index?: number;
  /** A shorter homepage presentation. The default remains the complete activity ledger. */
  compact?: boolean;
}

export default function LiveActivity({ index, compact = false }: LiveActivityProps) {
  const { enabled, duration } = useMotionPolicy();
  const profile = useGithubProfile();
  const { data: activity } = useRepos();
  const contributions = useContributions();
  const reading = READING_SNAPSHOT;

  // Frozen at mount: relative times should not drift mid-read, and re-deriving
  // the grid on every render would rebuild 371 cells for nothing.
  const now = useMemo(() => new Date(), []);
  const grid = useMemo(() => contributionGrid(contributions.data), [contributions.data]);

  const hasReadouts = profile.data.publicRepos > 0 || contributions.data.total > 0;
  const maxLanguage = Math.max(1, ...activity.languages.map((language) => language.repos));
  const revalidationFailed = profile.failed || contributions.failed;
  const visibleRepos = compact ? activity.repos.slice(0, 3) : activity.repos;
  const visiblePapers = compact ? reading.papers.slice(0, 2) : reading.papers;

  // At 13 units per column a three-letter label needs about three columns of
  // clearance, so months that start too close to the previous label are dropped.
  // The first month always starts in column 0, under the weekday gutter, so it
  // is dropped too — the date range above the plot already states it.
  const monthTicks = useMemo(() => {
    const kept: MonthTotal[] = [];
    for (const month of grid.months) {
      if (month.column === 0) continue;
      const last = kept[kept.length - 1];
      if (!last || month.column - last.column >= 3) kept.push(month);
    }
    return kept;
  }, [grid.months]);

  const width = GUTTER_LEFT + grid.weeks.length * PITCH;
  const height = GUTTER_TOP + 7 * PITCH;

  if (!hasReadouts && grid.weeks.length === 0 && reading.papers.length === 0) return null;

  return (
    <section
      className={`border-t border-border ${compact ? "py-14 lg:py-20" : "py-20 lg:py-28"}`}
    >
      <div className="container min-w-0">
        <ChapterHeader
          index={index}
          eyebrow="Activity"
          title={
            <>
              <AccentText tone="systems">Current</AccentText>, not written down
            </>
          }
          lede="Everything in this section is read from GitHub and arXiv — once when the site is built, and again in your browser when you open it. The numbers are whatever they are today."
          tone="systems"
        />

        {hasReadouts && (
          <dl
            className={`${compact ? "mt-10 gap-y-8 pt-8" : "mt-12 gap-y-10 pt-10"} grid grid-cols-2 gap-x-8 border-t border-border lg:grid-cols-4`}
          >
            <Metric
              value={String(profile.data.publicRepos)}
              label="Public repos"
              note="forks excluded"
              tone="interface"
            />
            <Metric
              value={String(profile.data.totalStars)}
              label="Stars"
              note="across all repos"
              tone="award"
            />
            <Metric value={String(profile.data.followers)} label="Followers" tone="neural" />
            <Metric
              value={String(contributions.data.total)}
              label="Contributions"
              note={`${grid.activeDays} active days`}
              tone="systems"
            />
          </dl>
        )}

        <div
          className={`${compact ? "mt-12 gap-9 lg:gap-10" : "mt-16 gap-12 lg:gap-14"} grid min-w-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,17rem)]`}
        >
          {grid.weeks.length > 0 && (
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <MonoLabel>Contribution calendar</MonoLabel>
                <span className="readout text-2xs text-muted-foreground">
                  {formatDay(contributions.data.startDate)} — {formatDay(contributions.data.endDate)}
                </span>
              </div>

              {/* The calendar carries its own plot ground: the palest ramp step is
                  lighter than the page background in the light theme, so on
                  `background` the first step would be invisible. */}
              <div
                className="mt-4 w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain rounded-md border border-border bg-card p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-4"
                role="region"
                aria-label="Scrollable contribution calendar"
                tabIndex={0}
              >
                <svg
                  viewBox={`0 0 ${width} ${height}`}
                  className="block h-auto w-full min-w-[660px]"
                  role="img"
                  aria-label={`Contribution calendar: ${contributions.data.total} contributions across ${grid.activeDays} active days, ${formatDay(contributions.data.startDate)} to ${formatDay(contributions.data.endDate)}.${grid.busiest ? ` Busiest day ${formatDay(grid.busiest.date)}, ${grid.busiest.count} contributions.` : ""}`}
                >
                  {monthTicks.map((month) => (
                    <text
                      key={month.key}
                      x={GUTTER_LEFT + month.column * PITCH}
                      y={GUTTER_TOP - 6}
                      className="fill-[var(--color-muted-foreground)] font-mono"
                      fontSize="8"
                      letterSpacing="0.06em"
                    >
                      {month.label.slice(0, 3).toUpperCase()}
                    </text>
                  ))}

                  {Object.entries(WEEKDAY_LABELS).map(([row, label]) => (
                    <text
                      key={label}
                      x={GUTTER_LEFT - 5}
                      y={GUTTER_TOP + Number(row) * PITCH + CELL - 2}
                      textAnchor="end"
                      className="fill-[var(--color-muted-foreground)] font-mono"
                      fontSize="7"
                    >
                      {label}
                    </text>
                  ))}

                  {grid.weeks.map((week, column) =>
                    week.map((cell, row) =>
                      cell ? (
                        <rect
                          key={cell.date}
                          x={GUTTER_LEFT + column * PITCH}
                          y={GUTTER_TOP + row * PITCH}
                          width={CELL}
                          height={CELL}
                          rx="1.5"
                          fill={STEP_FILL[cell.step]}
                        >
                          {/* Only active days carry a hover title — 300-odd empty
                              tooltips would be DOM weight with nothing to say. */}
                          {cell.count > 0 && (
                            <title>{`${cell.count} on ${formatDay(cell.date)}`}</title>
                          )}
                        </rect>
                      ) : null,
                    ),
                  )}
                </svg>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                <MonoLabel>Contributions per day</MonoLabel>
                <ul className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  {STEPS.map((step) => (
                    <li key={step} className="flex items-center gap-1.5">
                      <span
                        aria-hidden="true"
                        className="h-2.5 w-2.5 rounded-sm border border-border"
                        style={{ backgroundColor: STEP_FILL[step] }}
                      />
                      <span className="readout text-2xs text-muted-foreground">
                        {heatmapStepRange(step)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Text alternative to the calendar. The image label carries the
                  totals; this carries the shape of the year. */}
              <table className="sr-only">
                <caption>
                  Contributions by month, {formatDay(contributions.data.startDate)} to{" "}
                  {formatDay(contributions.data.endDate)}
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Month</th>
                    <th scope="col">Contributions</th>
                  </tr>
                </thead>
                <tbody>
                  {grid.months.map((month) => (
                    <tr key={month.key}>
                      <th scope="row">{month.label}</th>
                      <td>{month.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!compact && activity.languages.length > 0 && (
            <div className="lg:border-l lg:border-border lg:pl-10">
              <MonoLabel className="text-interface-type">Language distribution</MonoLabel>
              <p className="mt-2 text-sm text-muted-foreground">
                Repositories by the primary language GitHub detects. One series, so one colour.
              </p>
              <ul className="mt-6 flex flex-col gap-3">
                {activity.languages.map((language) => {
                  const barWidth = `${(language.repos / maxLanguage) * 100}%`;
                  return (
                    <li
                      key={language.name}
                      className="grid grid-cols-[7rem_1fr_1.5rem] items-center gap-3"
                    >
                      <span className="truncate font-mono text-2xs text-interface-type">
                        {language.name}
                      </span>
                      <span className="h-1.5 w-full bg-border/60" aria-hidden="true">
                        <motion.span
                          initial={enabled ? { width: 0 } : { width: barWidth }}
                          whileInView={{ width: barWidth }}
                          viewport={{ once: true }}
                          transition={{ duration: duration(0.7), ease: [0.16, 1, 0.3, 1] }}
                          className="block h-full bg-interface"
                        />
                      </span>
                      <span className="readout text-xs text-interface-type">{language.repos}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {activity.repos.length > 0 && (
          <div
            className={`${compact ? "mt-12 pt-8" : "mt-16 pt-10"} border-t border-interface/25`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <MonoLabel className="text-interface-type">Recent pushes</MonoLabel>
              <span className="readout text-2xs text-interface-type">
                {compact ? `${visibleRepos.length} recent` : activity.repos.length} of{" "}
                {profile.data.publicRepos} public repos
              </span>
            </div>

            <ul className="mt-6">
              {visibleRepos.map((repo) => (
                <li key={repo.name} className="border-b border-border py-4 first:border-t">
                  <div className="grid gap-x-8 gap-y-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline">
                    <div>
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-baseline gap-1.5 font-mono text-sm text-interface-type transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {repo.name}
                        <ExternalLink size={11} aria-hidden="true" />
                      </a>
                      {repo.description && (
                        <p className="mt-1 max-w-prose text-xs leading-relaxed text-muted-foreground">
                          {repo.description}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 sm:justify-end">
                      {repo.language && (
                        <span className="font-mono text-2xs text-cryo-type">
                          {repo.language}
                        </span>
                      )}
                      <span className="readout text-2xs text-award-type">
                        {repo.stars} <span className="label-mono">{repo.stars === 1 ? "star" : "stars"}</span>
                      </span>
                      <span className="readout text-2xs text-systems-type">
                        <span className="label-mono">pushed</span>{" "}
                        <time dateTime={repo.pushedAt}>{relativeTime(repo.pushedAt, now)}</time>
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {compact && (
              <a
                href={profile.data.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-11 items-center gap-2 font-mono text-2xs uppercase tracking-widest text-interface-type underline decoration-interface/40 underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:min-h-0"
              >
                View all repositories
                <ExternalLink size={12} aria-hidden="true" />
              </a>
            )}
          </div>
        )}

        {reading.papers.length > 0 && (
          <div
            className={`${compact ? "mt-12 pt-8" : "mt-16 pt-10"} border-t border-cryo/25`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <MonoLabel className="text-cryo-type">Reading — arXiv quant-ph and cs.DC</MonoLabel>
              <span className="readout text-2xs text-muted-foreground">
                {freshness(reading.fetchedAt, now)}
              </span>
            </div>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
              The newest preprints in the two arXiv categories this work sits in, refreshed once a
              day. These are other people&apos;s papers, listed to show where the field is — not
              authored here.
            </p>

            <ol className="mt-6">
              {visiblePapers.map((paper: Paper) => (
                <li key={paper.id} className="border-b border-border py-4 first:border-t">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className={`font-mono text-2xs ${categoryClass(paper.category)}`}>
                      {paper.category}
                    </span>
                    <span className="readout text-2xs text-muted-foreground">
                      <time dateTime={paper.published}>{formatDay(paper.published)}</time>
                    </span>
                    <span className="readout text-2xs text-muted-foreground">{paper.id}</span>
                  </div>
                  <a
                    href={paper.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group mt-1.5 inline-flex items-baseline gap-1.5 text-sm font-medium leading-snug transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${categoryClass(paper.category)}`}
                  >
                    {paper.title}
                    <ExternalLink size={11} className="shrink-0" aria-hidden="true" />
                  </a>
                  <p className="mt-1 font-mono text-2xs text-muted-foreground">
                    {authorLine(paper.authors)}
                  </p>
                  {!compact && (
                    <p className="mt-2 max-w-prose text-xs leading-relaxed text-muted-foreground">
                      {paper.summary}
                    </p>
                  )}
                </li>
              ))}
            </ol>
            {compact && (
              <a
                href={ARXIV_RECENT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-11 items-center gap-2 font-mono text-2xs uppercase tracking-widest text-cryo-type underline decoration-cryo/40 underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:min-h-0"
              >
                Browse the full arXiv feed
                <ExternalLink size={12} aria-hidden="true" />
              </a>
            )}
          </div>
        )}

        <div className={`${compact ? "mt-8" : "mt-10"} flex flex-col gap-1.5`}>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-2xs text-muted-foreground">
            <span className="label-mono">Sources</span>
            <span className="readout">GitHub REST, {freshness(profile.fetchedAt, now)}</span>
            <span className="readout">
              Contribution graph, {freshness(contributions.fetchedAt, now)}
            </span>
            <span className="readout">arXiv, build time only</span>
            <span className="readout">
              {profile.live || contributions.live
                ? "read again in your browser"
                : "from the build snapshot"}
            </span>
          </p>
          {revalidationFailed && (
            <p className="text-2xs text-muted-foreground">
              The live refresh did not answer, so these are the numbers from the last build. It
              tries again on your next visit.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
