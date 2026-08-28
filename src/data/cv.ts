// CV content that the rest of the site doesn't already carry.
//
// Everything /cv can read from profile.ts (summary, education, certifications,
// skills) and projects.ts, it reads from there — so the CV cannot drift from
// /about or /projects. What lives here is only what those files lack: work
// history, coursework as data, awards, spoken languages, and which projects the
// CV puts forward.
//
// Source: master_detailed_cv.tex at the repo root.

import { z } from "zod";
import { EDUCATION } from "./profile";
import { PROJECTS, getProjectBySlug, type ProjectItem } from "./projects";
import { SITE_LINKS } from "./siteLinks";
import { PROFILE_IDS, type ProfileId } from "./profiles";

export interface ExperienceItem {
  role: string;
  organisation: string;
  location: string;
  period: string;
  /** One clause per line. Numbers carry their unit and, where one exists, a baseline. */
  points: string[];
  technologies?: string[];
  /**
   * Per-profile emphasis: which `points` this lens leads with, and in what
   * order (indices into `points`, a subset allowed). The role and dates never
   * change between lenses — only which of its real bullet points lead.
   */
  lensEmphasis?: Partial<Record<ProfileId, number[]>>;
}

/** `points` reordered/subset for a lens, or the full list in written order if none is authored. */
export function getExperiencePoints(item: ExperienceItem, profileId: ProfileId): string[] {
  const indices = item.lensEmphasis?.[profileId];
  if (!indices) return item.points;
  return indices.map((i) => item.points[i]);
}

export const EXPERIENCE: ExperienceItem[] = [
  {
    role: "Software engineer",
    organisation: "Open Quantum Workbench, FAST-NUCES",
    location: "Islamabad, Pakistan",
    period: "Sep 2025 – present",
    points: [
      "Build the browser-side simulation interface and the Python compute services behind it, so a circuit can be run and inspected without a local quantum toolchain.",
      "Put Qiskit, Cirq, and PennyLane behind one interface, with OpenQASM 3.0 as the exchange format between them.",
      "Turn requirements from the group's researchers into APIs and UI that keep the physics legible.",
    ],
    technologies: ["Python", "FastAPI", "React", "Qiskit", "PennyLane", "OpenQASM 3.0"],
    lensEmphasis: {
      infrastructure: [0, 1],
      presales: [2, 1, 0],
    },
  },
  {
    role: "Freelance developer — Level 2 seller",
    organisation: "Fiverr",
    location: "Remote",
    period: "Aug 2023 – Aug 2024",
    points: [
      "Delivered 30+ full-stack applications on the MERN stack and .NET, reaching roughly 500 end users.",
      "Wrote 2D games in C++ with SFML and SDL2 — custom physics, collision detection, and a rendering path 30% faster than the first working version.",
      "Built desktop line-of-business applications in C# and Java over PostgreSQL and MySQL, MVC throughout, sized for 100+ concurrent users.",
      "Closed 100+ projects at 98% client satisfaction and 80% repeat custom, delivering about 20% ahead of the agreed date.",
    ],
    technologies: [
      "React",
      "Node.js",
      "Express",
      "MongoDB",
      "PostgreSQL",
      "C++",
      "C#",
      "Java",
      ".NET",
      "SFML",
      "SDL2",
    ],
    lensEmphasis: {
      presales: [3, 0, 2, 1],
    },
  },
  {
    role: "Core team member — PR and marketing",
    organisation: "NaSCon'25, FAST-NUCES",
    location: "Islamabad, Pakistan",
    period: "Feb – May 2025",
    points: [
      "Managed community partners at 15+ universities: inter-university meetings, RSVP tracking, and campaign content across LinkedIn, Instagram, and Facebook.",
      "Ran partner-facing promotion for one of Pakistan's largest student-run technology conferences.",
    ],
  },
  {
    role: "Officer — communications and outreach",
    organisation: "NaSCon'25, FAST-NUCES",
    location: "Islamabad, Pakistan",
    period: "Feb – May 2025",
    points: [
      "Handled correspondence between FAST-NUCES Islamabad and partner universities, and confirmed speaker and sponsor invitations.",
    ],
  },
];

/** Coursework as data rather than prose, so it can be set in the mono face. */
export const COURSEWORK: string[] = [
  "High-Performance Computing",
  "Parallel & Distributed Computing",
  "Compiler Construction",
  "Operating Systems",
  "Advanced Programming",
  "Data Structures & Algorithms",
  "Database Systems",
  "Computer Networks",
  "Artificial Intelligence",
  "Machine Learning",
];

/**
 * profile.ts folds coursework into a prose highlight, and this page lists it as
 * data instead. Dropping that one line here is what keeps it from appearing twice.
 */
export const CV_EDUCATION_HIGHLIGHTS: string[] = EDUCATION.highlights.filter(
  (highlight) => !/^relevant coursework/i.test(highlight),
);

export interface AwardItem {
  year: string;
  title: string;
  detail: string;
}

export const AWARDS: AwardItem[] = [
  {
    year: "2024",
    title: "3rd prize — Huawei ICT Competition, national finals",
    detail: "With the UniQ team, for QCanvas.",
  },
  {
    year: "2023",
    title: "Dean's List",
    detail: "Spring 2023, FAST-NUCES.",
  },
  {
    year: "2024",
    title: "Level 2 seller, Fiverr",
    detail: "100+ projects delivered at 98% satisfaction.",
  },
];

export interface LanguageItem {
  language: string;
  proficiency: string;
}

export const LANGUAGES: LanguageItem[] = [
  { language: "Urdu", proficiency: "Native or bilingual" },
  { language: "English", proficiency: "Native or bilingual" },
  { language: "Japanese", proficiency: "Elementary" },
];

/**
 * The eight the CV puts forward: both featured projects, then the HPC, quantum,
 * and AI work with measured results. The rest stay on /projects — a CV that lists
 * all 30 is a list, not an argument.
 */
export const CV_PROJECT_SLUGS: string[] = [
  "qcanvas",
  "cirq-rag",
  "q-tensor",
  "mnist-gpu",
  "canny-edge-detector",
  "rnn-text-generation",
  "parallel-graph-text",
  "pixelrnn-cifar10",
];

/** Resolved against projects.ts, so a renamed slug drops out instead of 404-ing. */
export function getCvProjects(): ProjectItem[] {
  return CV_PROJECT_SLUGS.map(getProjectBySlug).filter(
    (project): project is ProjectItem => project !== undefined,
  );
}

/** How many projects the CV leaves out — stated rather than quietly dropped. */
export function cvProjectOverflow(): number {
  return PROJECTS.length - getCvProjects().length;
}

export interface CvContactItem {
  label: string;
  /** What the reader sees. On paper a URL has to be readable, not clickable. */
  text: string;
  href?: string;
}

/** Splits a tel: URI into country code, operator, and subscriber number. */
function formatPhone(tel: string): string {
  const digits = tel.replace(/^tel:/, "");
  const parts = /^(\+\d{2})(\d{3})(\d{7})$/.exec(digits);
  return parts ? `${parts[1]} ${parts[2]} ${parts[3]}` : digits;
}

const bareUrl = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/+$/, "");

export const CV_CONTACT: CvContactItem[] = [
  { label: "Location", text: SITE_LINKS.location },
  { label: "Email", text: SITE_LINKS.email.replace(/^mailto:/, ""), href: SITE_LINKS.email },
  { label: "Phone", text: formatPhone(SITE_LINKS.phone), href: SITE_LINKS.phone },
  { label: "GitHub", text: bareUrl(SITE_LINKS.github), href: SITE_LINKS.github },
  { label: "LinkedIn", text: bareUrl(SITE_LINKS.linkedin), href: SITE_LINKS.linkedin },
];

/**
 * The PDF is printed from this page by scripts/gen-cv-pdf.mjs, so the two can't
 * disagree. BASE_URL keeps the link correct under the /portfolio/ subpath.
 */
export const CV_PDF_PATH = `${import.meta.env.BASE_URL}umer-farooq-cv.pdf`;

// --- schemas ---------------------------------------------------------------
// Kept beside the content, and exercised by src/test/pages.test.tsx, so a bad
// edit fails CI rather than shipping a half-empty CV section.

const nonEmpty = z.string().trim().min(1);

const profileIdSchema = z.enum(PROFILE_IDS as [ProfileId, ...ProfileId[]]);

export const experienceSchema = z
  .object({
    role: nonEmpty,
    organisation: nonEmpty,
    location: nonEmpty,
    period: nonEmpty,
    points: z.array(nonEmpty).min(1),
    technologies: z.array(nonEmpty).min(1).optional(),
    lensEmphasis: z.record(profileIdSchema, z.array(z.number().int().nonnegative())).optional(),
  })
  .superRefine((experience, ctx) => {
    if (!experience.lensEmphasis) return;
    for (const [profileId, indices] of Object.entries(experience.lensEmphasis)) {
      for (const index of indices) {
        if (index >= experience.points.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${experience.role}: lensEmphasis.${profileId} references point index ${index}, out of range (points.length=${experience.points.length})`,
          });
        }
      }
    }
  });

export const awardSchema = z.object({
  year: z.string().regex(/^\d{4}$/, "year must be a 4-digit string"),
  title: nonEmpty,
  detail: nonEmpty,
});

export const languageSchema = z.object({
  language: nonEmpty,
  proficiency: nonEmpty,
});

export const cvContactSchema = z.object({
  label: nonEmpty,
  text: nonEmpty,
  href: nonEmpty.optional(),
});
