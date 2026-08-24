// Dev-only content validation. Imported from main.tsx behind `import.meta.env.DEV`,
// so Vite drops this module (and zod) from production builds. CI enforces the same
// schemas via src/test/content.test.ts.

import { assertValidContent } from "./schema";
import { PROJECTS } from "./projects";
import { CERTIFICATIONS, EDUCATION, SKILL_GROUPS } from "./profile";
import { SITE_LINKS } from "./siteLinks";

try {
  assertValidContent({
    projects: PROJECTS,
    education: EDUCATION,
    certifications: CERTIFICATIONS,
    skillGroups: SKILL_GROUPS,
    siteLinks: SITE_LINKS,
  });
} catch (error) {
  console.error(
    "[content] Invalid data in src/data — fix this before committing:\n",
    error instanceof Error ? error.message : error,
  );
}
