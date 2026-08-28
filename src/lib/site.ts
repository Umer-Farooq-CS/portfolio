// Single source of truth for site-level identity, used by metadata, JSON-LD,
// the sitemap generator, and the OG image script.

export const SITE = {
  name: "Umer Farooq",
  /** Short role line used in titles and structured data. */
  role: "HPC & AI infrastructure engineer, and solution architect",
  description:
    "Umer Farooq builds the infrastructure underneath HPC and AI workloads — bare-metal Kubernetes and HPC platforms, GPU-accelerated systems, and the reference architectures behind enterprise GPU cloud bids.",
  /** Deploy target. Override with VITE_SITE_URL for a custom domain. */
  // `||`, not `??`: CI passes an unset repository variable as an empty string,
  // which would otherwise make every canonical URL and JSON-LD id relative.
  url:
    ((import.meta.env.VITE_SITE_URL as string | undefined) || "").trim() ||
    "https://umer-farooq-cs.github.io/portfolio",
  locale: "en",
  location: "Islamabad, Pakistan",
  /** Islamabad is UTC+5 year-round — no DST, so no time API is needed. */
  utcOffsetHours: 5,
  timeZoneLabel: "PKT",
  ogImage: "og-portfolio.png",
} as const;

/**
 * Absolute URL for a route or an asset.
 *
 * Routes get a trailing slash because that is what GitHub Pages actually serves:
 * each route is a prerendered <route>/index.html, and Pages 301s the slashless
 * form to it. A canonical URL that redirects is a weak signal, so the canonical,
 * the sitemap and the served URL all need to agree.
 *
 * Assets must NOT get one — this function also builds the social-card URL, and
 * "og-portfolio.png/" is not a file. The extension test is what separates them.
 */
export function absoluteUrl(path = "/"): string {
  const base = SITE.url.replace(/\/+$/, "");
  const clean = path.replace(/^\/+/, "").replace(/\/+$/, "");
  if (!clean) return `${base}/`;
  const isAsset = /\.[a-z0-9]{2,5}$/i.test(clean);
  return `${base}/${clean}${isAsset ? "" : "/"}`;
}
