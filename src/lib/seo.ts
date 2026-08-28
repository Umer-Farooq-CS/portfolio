// JSON-LD builders. Structured data links this site to the real person and
// projects behind it, which plain meta tags can't express.

import { SITE, absoluteUrl } from "./site";
import { SITE_LINKS } from "@/data/siteLinks";
import { EDUCATION } from "@/data/profile";
import type { ProjectItem } from "@/data/projects";

export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE.name,
    url: absoluteUrl("/"),
    jobTitle: SITE.role,
    description: SITE.description,
    alumniOf: { "@type": "CollegeOrUniversity", name: EDUCATION.institution },
    sameAs: [SITE_LINKS.github, SITE_LINKS.linkedin],
  };
}

export function projectSchema(project: ProjectItem) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    headline: project.subtitle,
    description: project.description[0],
    url: absoluteUrl(`/projects/${project.slug}`),
    author: { "@type": "Person", name: SITE.name, url: absoluteUrl("/") },
    keywords: project.technologies.join(", "),
    ...(project.githubUrl ? { codeRepository: project.githubUrl } : {}),
    ...(project.award ? { award: project.award } : {}),
  };
}

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}
