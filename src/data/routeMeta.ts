import raw from "./route-meta.json";

/**
 * Typed access to route-meta.json.
 *
 * The JSON is the single source for a route's title and description, read both
 * here (at runtime, by useDocumentMeta) and by scripts/prerender-routes.mjs,
 * which stamps the same values into the built HTML. Keeping the strings in the
 * page components instead meant a social scraper — which never runs JavaScript —
 * saw the homepage title on every route.
 */
export interface RouteMeta {
  title: string;
  description: string;
}

const entries = raw as Record<string, RouteMeta | string>;

/**
 * A trailing slash is the *served* form, not an edge case.
 *
 * GitHub Pages serves every prerendered route as `<route>/index.html` and
 * 301-redirects the slashless form to it, so the URL a visitor actually lands
 * on — from search, from a shared link, or by refreshing — is `/development/`,
 * not `/development`. `src/lib/site.ts` already builds canonicals that way for
 * the same reason.
 *
 * This bit the lens home pages specifically: every other page passes a literal
 * path here, but Index.tsx has to pass the live pathname to resolve which lens
 * it is, so it was the only caller that ever saw the served form. Loading
 * /development/ threw and the error boundary took the page.
 */
function canonicalise(path: string): string {
  return path.length > 1 && path.endsWith("/") ? path.replace(/\/+$/, "") : path;
}

/** Throws on an unknown route, so a typo fails loudly at first render. */
export function routeMeta(path: string): RouteMeta {
  const entry = entries[canonicalise(path)];
  if (!entry || typeof entry === "string") {
    throw new Error(`No route metadata for "${path}" — add it to src/data/route-meta.json`);
  }
  return entry;
}

/** Every documented route path, ignoring the JSON's leading comment key. */
export const ROUTE_META_PATHS: string[] = Object.keys(entries).filter((key) => key.startsWith("/"));
