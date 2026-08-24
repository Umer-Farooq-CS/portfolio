// Runtime schemas for the content files.
//
// These run in two places:
//   1. `src/test/content.test.ts` — CI fails before deploy if content is invalid.
//   2. `assertValidContent()` below, called in dev only, so a bad edit surfaces
//      immediately in the browser instead of rendering a silently broken page.

import { z } from "zod";
import { DOMAIN_IDS } from "./taxonomy";

const domainSchema = z.enum(DOMAIN_IDS as [string, ...string[]]);

const nonEmpty = z.string().trim().min(1);

export const metricSchema = z.object({
  label: nonEmpty,
  value: nonEmpty,
  /** Optional baseline for before/after comparisons, e.g. "52%" against a value of "92%". */
  baseline: nonEmpty.optional(),
  note: nonEmpty.optional(),
});

/** Shape emitted by scripts/optimize-images.mjs. */
export const responsiveImageSchema = z.object({
  fallback: nonEmpty,
  sources: z
    .array(z.object({ type: nonEmpty, srcSet: nonEmpty }))
    .min(1),
  width: z.number().positive(),
  height: z.number().positive(),
});

export const projectSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase kebab-case"),
  title: nonEmpty,
  subtitle: nonEmpty,
  /** Specific human-facing label, e.g. "High-Performance Computing & Quantum". */
  category: nonEmpty,
  /** Closed-taxonomy domains, most relevant first. Drives grouping and filters. */
  domains: z.array(domainSchema).min(1),
  period: nonEmpty.optional(),
  githubUrl: z.string().url().optional(),
  externalUrl: z.string().url().optional(),
  award: nonEmpty.optional(),
  description: z.array(nonEmpty).min(1),
  technologies: z.array(nonEmpty).min(1),
  featured: z.boolean().optional(),
  image: responsiveImageSchema.optional(),
  architectureHighlights: z.array(nonEmpty).optional(),
  metrics: z.array(metricSchema).optional(),
  tagline: nonEmpty.optional(),
  objective: nonEmpty.optional(),
  strategy: z.array(nonEmpty).optional(),
});

export const projectsSchema = z
  .array(projectSchema)
  .min(1)
  .superRefine((projects, ctx) => {
    const seen = new Set<string>();
    for (const project of projects) {
      if (seen.has(project.slug)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate project slug: ${project.slug}`,
        });
      }
      seen.add(project.slug);
    }
  });

export const educationSchema = z.object({
  degree: nonEmpty,
  institution: nonEmpty,
  period: nonEmpty,
  highlights: z.array(nonEmpty).min(1),
});

export const certificationSchema = z.object({
  year: z.string().regex(/^\d{4}$/, "year must be a 4-digit string"),
  title: nonEmpty,
  issuer: nonEmpty,
  credentialUrl: z.string().url().optional(),
});

export const skillGroupSchema = z.object({
  title: nonEmpty,
  items: z.array(nonEmpty).min(1),
  accent: z.enum(["thermal", "cryo", "neural", "systems", "interface", "none"]),
});

export const siteLinksSchema = z.object({
  github: z.string().url(),
  linkedin: z.string().url(),
  email: z.string().startsWith("mailto:"),
  phone: z.string().startsWith("tel:"),
  location: nonEmpty,
});

export type ProjectInput = z.infer<typeof projectSchema>;
export type Metric = z.infer<typeof metricSchema>;

/**
 * Throws on invalid content. Called from the data modules in dev only — production
 * builds are already gated by the content test in CI, so the schemas stay out of
 * the shipped bundle.
 */
export function assertValidContent(content: {
  projects: unknown;
  education: unknown;
  certifications: unknown;
  skillGroups: unknown;
  siteLinks: unknown;
}): void {
  projectsSchema.parse(content.projects);
  educationSchema.parse(content.education);
  z.array(certificationSchema).parse(content.certifications);
  z.array(skillGroupSchema).min(1).parse(content.skillGroups);
  siteLinksSchema.parse(content.siteLinks);
}
