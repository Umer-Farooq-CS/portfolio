import { describe, expect, it } from "vitest";
import { ROUTE_META_PATHS, routeMeta } from "@/data/routeMeta";
import { PROJECTS } from "@/data/projects";

/**
 * route-meta.json is read by two consumers — useDocumentMeta at runtime and
 * scripts/prerender-routes.mjs at build time. A route missing from it means the
 * prerender step fails the build, so catching it here gives a clearer message.
 */

// Kept in step with STATIC_ROUTES in scripts/routes.mjs. A node script can't be
// imported here, so this list is asserted rather than shared; if they diverge the
// prerender step fails loudly, and this test says which route is missing.
const STATIC_ROUTES = [
  "/",
  "/about",
  "/services",
  "/projects",
  "/lab",
  "/cv",
  "/uses",
  "/notes",
  "/thanks",
];

describe("route metadata", () => {
  it("covers every static route", () => {
    for (const path of STATIC_ROUTES) {
      expect(ROUTE_META_PATHS, `missing metadata for ${path}`).toContain(path);
    }
  });

  it("gives every route a usable title and description", () => {
    for (const path of ROUTE_META_PATHS) {
      const meta = routeMeta(path);
      expect(meta.title.trim().length, `${path} title`).toBeGreaterThan(1);
      // Long enough to be a real description, short enough that search results
      // and social cards don't truncate mid-sentence.
      expect(meta.description.trim().length, `${path} description too short`).toBeGreaterThan(40);
      expect(meta.description.trim().length, `${path} description too long`).toBeLessThan(200);
    }
  });

  it("throws on an unknown route rather than rendering a blank head", () => {
    expect(() => routeMeta("/does-not-exist")).toThrow(/No route metadata/);
  });

  it("ignores the JSON's documentation key", () => {
    expect(ROUTE_META_PATHS.every((path) => path.startsWith("/"))).toBe(true);
    expect(ROUTE_META_PATHS).not.toContain("$comment");
  });

  it("leaves project routes to the project data, not this file", () => {
    // Project pages take their title and description from PROJECTS, so they must
    // not also appear here — two sources would drift.
    for (const project of PROJECTS) {
      expect(ROUTE_META_PATHS).not.toContain(`/projects/${project.slug}`);
    }
  });
});
