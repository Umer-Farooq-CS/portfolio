import { describe, expect, it } from "vitest";
import {
  PROJECTS,
  getAdjacentProjects,
  getFeaturedProjects,
  getProjectBySlug,
  getProjectsByDomain,
  getTechnologyFacets,
} from "@/data/projects";
import { CERTIFICATIONS, EDUCATION, SKILL_GROUPS } from "@/data/profile";
import { SITE_LINKS } from "@/data/siteLinks";
import { DOMAIN_IDS } from "@/data/taxonomy";
import {
  certificationSchema,
  educationSchema,
  projectsSchema,
  siteLinksSchema,
  skillGroupSchema,
} from "@/data/schema";

describe("content schemas", () => {
  it("every project matches the schema and slugs are unique", () => {
    expect(() => projectsSchema.parse(PROJECTS)).not.toThrow();
  });

  it("profile, certifications, and links match their schemas", () => {
    expect(() => educationSchema.parse(EDUCATION)).not.toThrow();
    for (const cert of CERTIFICATIONS) {
      expect(() => certificationSchema.parse(cert)).not.toThrow();
    }
    for (const group of SKILL_GROUPS) {
      expect(() => skillGroupSchema.parse(group)).not.toThrow();
    }
    expect(() => siteLinksSchema.parse(SITE_LINKS)).not.toThrow();
  });
});

describe("project taxonomy coverage", () => {
  // This is the regression test for the bug where two projects were unreachable
  // on /projects because their category strings were missing from a hand-written
  // ordering array. Grouping now iterates the closed taxonomy, so the only way to
  // hide a project is an invalid domain — which this test catches.
  it("groups every project exactly once, with none dropped", () => {
    const grouped = getProjectsByDomain().flatMap((group) => group.projects);
    expect(grouped).toHaveLength(PROJECTS.length);
    expect(new Set(grouped.map((p) => p.slug)).size).toBe(PROJECTS.length);
  });

  it("uses only known domains", () => {
    for (const project of PROJECTS) {
      expect(project.domains.length).toBeGreaterThan(0);
      for (const domain of project.domains) {
        expect(DOMAIN_IDS).toContain(domain);
      }
    }
  });

  it("every project is reachable by its slug", () => {
    for (const project of PROJECTS) {
      expect(getProjectBySlug(project.slug)).toBe(project);
    }
  });

  it("has at least one featured project for the homepage", () => {
    expect(getFeaturedProjects().length).toBeGreaterThan(0);
  });
});

describe("derived helpers", () => {
  it("builds technology facets with real counts", () => {
    const facets = getTechnologyFacets();
    expect(facets.length).toBeGreaterThan(0);
    const cuda = facets.find((f) => f.tech === "CUDA");
    expect(cuda?.count).toBeGreaterThan(1);
    // sorted by count desc
    for (let i = 1; i < facets.length; i++) {
      expect(facets[i - 1].count).toBeGreaterThanOrEqual(facets[i].count);
    }
  });

  it("wraps prev/next navigation around the full ordered list", () => {
    const ordered = getProjectsByDomain().flatMap((group) => group.projects);
    const first = getAdjacentProjects(ordered[0].slug);
    expect(first.next?.slug).toBe(ordered[1].slug);
    expect(first.prev?.slug).toBe(ordered[ordered.length - 1].slug);
  });

  it("returns nothing adjacent for an unknown slug", () => {
    expect(getAdjacentProjects("does-not-exist")).toEqual({ prev: undefined, next: undefined });
  });
});
