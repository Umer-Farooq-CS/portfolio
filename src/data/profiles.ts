// The three professional lenses this portfolio can be viewed through.
//
// Same split as taxonomy.ts: identity (this file) versus content (per-record
// fields on ProjectItem/ExperienceItem in projects.ts/cv.ts). A profile is
// config, not data — adding a fourth lens later means adding one entry here,
// not touching the shared project/experience/skill records.

import type { DomainAccent } from "./taxonomy";
import type { VisualAccent } from "@/lib/accent";

export type ProfileId = "development" | "infrastructure" | "presales";

export const PROFILE_IDS: readonly ProfileId[] = ["development", "infrastructure", "presales"];

/** The homepage's five chapters (LiveActivity is the sixth, always fixed at "activity"). */
export type HomeChapterKey = "bench" | "techLogos" | "work" | "proof" | "activity" | "about" | "talk";

export const HOME_CHAPTER_KEYS: readonly HomeChapterKey[] = [
  "bench",
  "techLogos",
  "work",
  "proof",
  "activity",
  "about",
  "talk",
];

/** A hero headline is a sentence with a couple of accented words, not one string. */
export interface ProfileHeroPart {
  text: string;
  tone?: VisualAccent;
}

export interface ProfileHeroSignal {
  label: string;
  detail: string;
  tone: VisualAccent;
}

/**
 * The fields a project-detail section can be built from — the same generic
 * fields ProjectDetailPage already renders conditionally today. A lens only
 * relabels and reorders these; it cannot introduce a field the project data
 * doesn't have.
 */
export type DetailSectionSource =
  | "objective"
  | "description"
  | "strategy"
  | "architectureHighlights"
  | "metrics"
  | "technologies";

export const DETAIL_SECTION_SOURCES: readonly DetailSectionSource[] = [
  "objective",
  "description",
  "strategy",
  "architectureHighlights",
  "metrics",
  "technologies",
];

export interface ProfileDetailSection {
  source: DetailSectionSource;
  label: string;
}

/**
 * The homepage "selected work" chapter, per lens. `slugs` is an ordered subset
 * of the projects already flagged `featured` in projects.ts — a lens chooses
 * which of the flagships lead and in what order, it does not promote a project
 * that isn't featured. `src/test/profiles.test.ts` enforces both halves.
 */
export interface ProfileWorkChapter {
  title: string;
  lede: string;
  slugs: string[];
}

export interface ProjectCardTechLimits {
  /** Chips shown on the dense /projects grid card. */
  grid: number;
  /** Chips shown on the full-width homepage row card. */
  row: number;
}

export interface ProfileConfig {
  id: ProfileId;
  /** URL segment: "/{path}". */
  path: string;
  /** Short label for the nav/switcher, e.g. "Infrastructure". */
  navLabel: string;
  /** Full name shown on the selector and in page titles, e.g. "HPC & AI Infrastructure". */
  fullLabel: string;
  accent: DomainAccent;
  /** One-line description on the profile selector. */
  selectorBlurb: string;
  heroHeadline: ProfileHeroPart[];
  heroSubhead: string;
  heroSignals: ProfileHeroSignal[];
  /** Order the homepage chapters render in. Must be a permutation of HOME_CHAPTER_KEYS. */
  homeChapterOrder: HomeChapterKey[];
  /** SKILL_GROUPS titles, in the priority order this lens shows them. */
  skillGroupOrder: string[];
  /** Optional relabeling of a skill group's displayed title for this lens. */
  skillGroupLabelOverride?: Partial<Record<string, string>>;
  projectCardTechLimit: ProjectCardTechLimits;
  /** Which featured projects lead the homepage under this lens, and the copy above them. */
  workChapter: ProfileWorkChapter;
  /** Default project-detail section order/labels when a project has no authored lens sections. */
  detailTemplate: ProfileDetailSection[];
}

export const PROFILES: readonly ProfileConfig[] = [
  {
    id: "development",
    path: "development",
    navLabel: "Development",
    fullLabel: "HPC & AI Development",
    accent: "thermal",
    selectorBlurb: "Software, accelerated computing, AI, parallel systems, and technical development.",
    heroHeadline: [
      { text: "I make slow systems " },
      { text: "fast", tone: "thermal" },
      { text: ", and hard systems " },
      { text: "runnable", tone: "cryo" },
      { text: "." },
    ],
    heroSubhead:
      "I work on high-performance and GPU computing, quantum simulation platforms, and AI pipelines that are checked rather than trusted — a 6× inference speedup taken through five profiled versions to Tensor Cores, and 92% task success where a single-pass baseline managed 52%. Every number here is one I measured.",
    heroSignals: [
      { label: "Compute", detail: "CUDA · MPI", tone: "thermal" },
      { label: "Quantum", detail: "Qiskit · Cirq", tone: "cryo" },
      { label: "Verified AI", detail: "PyTorch · RAG", tone: "neural" },
      { label: "Platforms", detail: "React · FastAPI", tone: "interface" },
    ],
    homeChapterOrder: ["bench", "techLogos", "work", "proof", "activity", "about", "talk"],
    skillGroupOrder: [
      "High-Performance Computing & Parallelism",
      "Machine Learning, Deep Learning & LLM Systems",
      "Quantum Computing & Simulation",
      "Systems, Distributed & Networking",
      "Full-Stack Development & Platforms",
      "Infrastructure, Orchestration & Automation",
      "Solution Architecture & Technical Pre-Sales",
    ],
    projectCardTechLimit: { grid: 3, row: 7 },
    workChapter: {
      title: "Three projects that show the range",
      lede: "An AI pipeline that had to stop being confidently wrong, a platform that had to be fast and correct across three quantum frameworks, and a control plane that had to run a cluster without an SSH session.",
      slugs: ["cirq-rag", "qcanvas", "hpc-cluster-platform"],
    },
    detailTemplate: [
      { source: "objective", label: "The problem" },
      { source: "description", label: "What it does" },
      { source: "strategy", label: "How it was built" },
      { source: "metrics", label: "Measured result" },
      { source: "architectureHighlights", label: "Key architecture" },
      { source: "technologies", label: "Stack" },
    ],
  },
  {
    id: "infrastructure",
    path: "infrastructure",
    navLabel: "Infrastructure",
    fullLabel: "HPC & AI Infrastructure",
    accent: "systems",
    selectorBlurb: "Bare-metal provisioning, Kubernetes and HPC clusters, GitOps delivery, and enterprise GPU platforms.",
    heroHeadline: [
      { text: "I turn raw compute into platforms that " },
      { text: "scale", tone: "systems" },
      { text: ", and " },
      { text: "stay up", tone: "thermal" },
      { text: "." },
    ],
    heroSubhead:
      "I design and automate the infrastructure underneath HPC and AI workloads — zero-touch bare-metal provisioning, hardened Kubernetes bootstrap, GitOps delivery, and Slurm/GPFS scheduling over parallel storage. Enterprise GPU-as-a-Service platforms delivered at MAK Technology: no manual OS installs, all cluster state in Git.",
    heroSignals: [
      { label: "Bare metal", detail: "MAAS · Warewulf · IPMI", tone: "systems" },
      { label: "Orchestration", detail: "Kubernetes · ArgoCD · Slurm", tone: "systems" },
      { label: "Compute", detail: "CUDA · MPI · GPFS", tone: "thermal" },
      { label: "Platforms", detail: "React · FastAPI", tone: "interface" },
    ],
    homeChapterOrder: ["bench", "work", "techLogos", "proof", "activity", "about", "talk"],
    skillGroupOrder: [
      "Infrastructure, Orchestration & Automation",
      "Full-Stack Development & Platforms",
      "Systems, Distributed & Networking",
      "High-Performance Computing & Parallelism",
      "Solution Architecture & Technical Pre-Sales",
      "Machine Learning, Deep Learning & LLM Systems",
      "Quantum Computing & Simulation",
    ],
    skillGroupLabelOverride: {
      "Full-Stack Development & Platforms": "Platforms & Deployment",
      "Systems, Distributed & Networking": "Systems & Infrastructure",
    },
    projectCardTechLimit: { grid: 4, row: 6 },
    workChapter: {
      title: "Three platforms, from bare metal upward",
      lede: "A control plane over a bare-metal HPC cluster, a declarative path from an empty rack to a hardened Kubernetes cluster, and the multi-tenant GPU cloud architecture they were built to serve.",
      slugs: ["hpc-cluster-platform", "k8s-bare-metal-automation", "gpu-cloud-reference-architecture"],
    },
    detailTemplate: [
      { source: "objective", label: "Infrastructure challenge" },
      { source: "architectureHighlights", label: "Architecture" },
      { source: "strategy", label: "Deployment approach" },
      { source: "metrics", label: "Operational results" },
      { source: "description", label: "Platform detail" },
      { source: "technologies", label: "Platform stack" },
    ],
  },
  {
    id: "presales",
    path: "solutions",
    navLabel: "Solutions",
    fullLabel: "Pre-Sales Solution Architect",
    accent: "neural",
    selectorBlurb: "Reference architectures, multi-tenant design, technical proposals, SLA models, and customer-facing engineering.",
    heroHeadline: [
      { text: "I turn " },
      { text: "requirements", tone: "neural" },
      { text: " into architectures that " },
      { text: "hold up", tone: "systems" },
      { text: "." },
    ],
    heroSubhead:
      "I translate HPC and AI requirements into architectures that survive customer review — multi-tenant GPU cloud reference designs, five-layer tenant isolation models, and the SLA and incident-response frameworks that let a platform be sold with a support commitment. Around 50 architecture diagrams authored for enterprise bids.",
    heroSignals: [
      { label: "Architecture", detail: "reference designs · RFP", tone: "neural" },
      { label: "Isolation", detail: "5 layers · multi-tenant", tone: "systems" },
      { label: "Support model", detail: "P0–P3 · SLA · RCA", tone: "systems" },
      { label: "Validation", detail: "measured, not claimed", tone: "thermal" },
    ],
    homeChapterOrder: ["bench", "proof", "work", "techLogos", "activity", "about", "talk"],
    skillGroupOrder: [
      "Solution Architecture & Technical Pre-Sales",
      "Infrastructure, Orchestration & Automation",
      "Full-Stack Development & Platforms",
      "High-Performance Computing & Parallelism",
      "Machine Learning, Deep Learning & LLM Systems",
      "Quantum Computing & Simulation",
      "Systems, Distributed & Networking",
    ],
    skillGroupLabelOverride: {
      "Full-Stack Development & Platforms": "Solution Delivery & Platforms",
      "High-Performance Computing & Parallelism": "HPC & Accelerated Computing",
      "Quantum Computing & Simulation": "Quantum Computing Platforms",
    },
    projectCardTechLimit: { grid: 3, row: 5 },
    workChapter: {
      title: "Three engagements, architecture through to contract",
      lede: "A multi-tenant GPU cloud reference architecture, the SLA and incident-response model that lets it be sold with a support commitment, and the HPC platform whose delivery I audited before handover.",
      slugs: ["gpu-cloud-reference-architecture", "enterprise-sla-framework", "hpc-cluster-platform"],
    },
    detailTemplate: [
      { source: "objective", label: "Requirements" },
      { source: "strategy", label: "Proposed approach" },
      { source: "architectureHighlights", label: "Solution architecture" },
      { source: "technologies", label: "Technology selection" },
      { source: "metrics", label: "Validation & outcome" },
      { source: "description", label: "Solution detail" },
    ],
  },
] as const satisfies readonly ProfileConfig[];

export function isProfileId(value: string): value is ProfileId {
  return (PROFILE_IDS as readonly string[]).includes(value);
}

export function getProfile(id: ProfileId): ProfileConfig {
  const profile = PROFILES.find((p) => p.id === id);
  if (!profile) throw new Error(`Unknown profile: ${id}`);
  return profile;
}

/**
 * Looks up a profile by its URL segment (`path`), not its internal `id` —
 * they differ for presales (`id: "presales"`, `path: "solutions"`), so the
 * `:profile` route param must always be resolved through this, never through
 * isProfileId/getProfile directly.
 */
export function getProfileByPath(path: string): ProfileConfig | undefined {
  return PROFILES.find((p) => p.path === path);
}

export const DEFAULT_PROFILE_ID: ProfileId = "development";
