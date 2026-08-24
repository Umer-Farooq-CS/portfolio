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

/** Throws on an unknown route, so a typo fails loudly at first render. */
export function routeMeta(path: string): RouteMeta {
  const entry = entries[path];
  if (!entry || typeof entry === "string") {
    throw new Error(`No route metadata for "${path}" — add it to src/data/route-meta.json`);
  }
  return entry;
}

/** Every documented route path, ignoring the JSON's leading comment key. */
export const ROUTE_META_PATHS: string[] = Object.keys(entries).filter((key) => key.startsWith("/"));
