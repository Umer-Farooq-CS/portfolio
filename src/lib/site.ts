// Single source of truth for site-level identity, used by metadata, JSON-LD,
// the sitemap generator, and the OG image script.

export const SITE = {
  name: "Umer Farooq",
  /** Short role line used in titles and structured data. */
  role: "HPC, quantum simulation, and AI systems engineer",
  description:
    "Umer Farooq builds high-performance and GPU-accelerated systems, quantum circuit simulation platforms, and AI pipelines that hold up under validation.",
  /** Deploy target. Override with VITE_SITE_URL for a custom domain. */
  url: (import.meta.env.VITE_SITE_URL as string | undefined) ?? "https://umer-farooq-cs.github.io/portfolio",
  locale: "en",
  location: "Islamabad, Pakistan",
  /** Islamabad is UTC+5 year-round — no DST, so no time API is needed. */
  utcOffsetHours: 5,
  timeZoneLabel: "PKT",
  ogImage: "og-portfolio.png",
} as const;

/** Absolute URL for a route path, with exactly one slash between segments. */
export function absoluteUrl(path = "/"): string {
  const base = SITE.url.replace(/\/+$/, "");
  const suffix = path === "/" ? "" : `/${path.replace(/^\/+/, "")}`;
  return `${base}${suffix}`;
}
