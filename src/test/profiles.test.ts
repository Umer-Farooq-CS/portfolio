import { describe, expect, it } from "vitest";
import {
  DETAIL_SECTION_SOURCES,
  HOME_CHAPTER_KEYS,
  PROFILES,
  getProfile,
  getProfileByPath,
  isProfileId,
} from "@/data/profiles";
import { SKILL_GROUPS } from "@/data/profile";
import { PROJECTS } from "@/data/projects";

// Kept in step with PROFILE_ROUTE_PATHS/PROFILE_LABELS in scripts/routes.mjs.
// A node script can't be imported into a typechecked test (same trade-off
// route-meta.test.ts already makes for STATIC_ROUTES) — asserted, not shared.
const ROUTE_PROFILE_PATHS = ["development", "infrastructure", "solutions"];
const ROUTE_PROFILE_LABELS: Record<string, string> = {
  development: "HPC & AI Development",
  infrastructure: "HPC & AI Infrastructure",
  solutions: "Pre-Sales Solution Architect",
};

describe("profile configuration", () => {
  it("has a unique id and a unique URL path per profile", () => {
    expect(new Set(PROFILES.map((p) => p.id)).size).toBe(PROFILES.length);
    expect(new Set(PROFILES.map((p) => p.path)).size).toBe(PROFILES.length);
  });

  it("orders every home chapter exactly once", () => {
    for (const profile of PROFILES) {
      expect([...profile.homeChapterOrder].sort()).toEqual([...HOME_CHAPTER_KEYS].sort());
    }
  });

  it("orders every real skill group exactly once, with no invented groups", () => {
    const realTitles = SKILL_GROUPS.map((g) => g.title);
    for (const profile of PROFILES) {
      expect([...profile.skillGroupOrder].sort()).toEqual([...realTitles].sort());
      for (const overriddenTitle of Object.keys(profile.skillGroupLabelOverride ?? {})) {
        expect(realTitles).toContain(overriddenTitle);
      }
    }
  });

  it("only builds detail sections from known project fields", () => {
    for (const profile of PROFILES) {
      for (const section of profile.detailTemplate) {
        expect(DETAIL_SECTION_SOURCES).toContain(section.source);
      }
    }
  });

  it("keeps its URL paths and full labels in step with scripts/routes.mjs", () => {
    expect(PROFILES.map((p) => p.path)).toEqual(ROUTE_PROFILE_PATHS);
    for (const profile of PROFILES) {
      expect(ROUTE_PROFILE_LABELS[profile.path]).toBe(profile.fullLabel);
    }
  });

  it("resolves every profile's real URL path via getProfileByPath, not its id", () => {
    // Regression: the :profile route param is a `path` (e.g. "solutions" for
    // presales), not an `id` — a lookup that used isProfileId/getProfile on
    // the raw param 404s presales, since "solutions" !== "presales", while
    // development/infrastructure pass by coincidence (id === path for them).
    for (const profile of PROFILES) {
      expect(getProfileByPath(profile.path)).toBe(profile);
    }
    expect(getProfileByPath("presales")).toBeUndefined();
    expect(getProfileByPath("not-a-real-path")).toBeUndefined();
  });

  // A lens picks which flagships lead the homepage; it must not invent one, and
  // it must not quietly promote a project that isn't featured — otherwise
  // /projects and the homepage disagree about what the best work is.
  it("leads the homepage with real, featured projects under every lens", () => {
    const featured = new Set(PROJECTS.filter((p) => p.featured).map((p) => p.slug));
    for (const profile of PROFILES) {
      expect(profile.workChapter.slugs.length).toBeGreaterThan(0);
      expect(new Set(profile.workChapter.slugs).size).toBe(profile.workChapter.slugs.length);
      for (const slug of profile.workChapter.slugs) {
        expect(featured).toContain(slug);
      }
      expect(profile.workChapter.title.trim()).not.toBe("");
      expect(profile.workChapter.lede.trim()).not.toBe("");
    }
  });

  it("isProfileId/getProfile agree with the PROFILES list", () => {
    for (const profile of PROFILES) {
      expect(isProfileId(profile.id)).toBe(true);
      expect(getProfile(profile.id)).toBe(profile);
    }
    expect(isProfileId("not-a-profile")).toBe(false);
    expect(() => getProfile("not-a-profile" as never)).toThrow();
  });
});
