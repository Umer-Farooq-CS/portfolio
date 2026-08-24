// Closed taxonomy for grouping and filtering work.
//
// Why this exists: /projects used to render only the categories listed in a
// hand-maintained array, so any project whose free-text `category` was missing
// from that array silently disappeared. Grouping now comes from this closed
// union, and `src/test/content.test.ts` fails the build if a project references
// a domain that isn't here. A project can no longer go invisible.

export const DOMAINS = [
  {
    id: "hpc",
    label: "HPC & GPU",
    blurb: "Parallel and accelerated computing — CUDA, MPI, OpenMP, pthreads, profiling.",
    accent: "thermal",
  },
  {
    id: "quantum",
    label: "Quantum",
    blurb: "Circuit simulation, multi-framework tooling, hybrid classical–quantum systems.",
    accent: "cryo",
  },
  {
    id: "ai",
    label: "AI & ML",
    blurb: "Deep learning, generative models, retrieval-augmented and multi-agent systems.",
    accent: "none",
  },
  {
    id: "systems",
    label: "Systems & Distributed",
    blurb: "Compilers, distributed hash tables, networking, concurrency.",
    accent: "none",
  },
  {
    id: "web",
    label: "Full-stack",
    blurb: "Web platforms, APIs, and real-time services.",
    accent: "none",
  },
  {
    id: "apps",
    label: "Apps & Games",
    blurb: "Desktop applications and game engines.",
    accent: "none",
  },
] as const;

export type Domain = (typeof DOMAINS)[number]["id"];
export type DomainAccent = (typeof DOMAINS)[number]["accent"];

export const DOMAIN_IDS = DOMAINS.map((d) => d.id) as readonly Domain[];

export function getDomain(id: Domain) {
  const domain = DOMAINS.find((d) => d.id === id);
  if (!domain) throw new Error(`Unknown domain: ${id}`);
  return domain;
}

export function domainLabel(id: Domain): string {
  return getDomain(id).label;
}
