import { PROJECTS } from "@/data/projects";
import type { VisualAccent } from "@/lib/accent";

export type TechnologyMarkKind =
  | "cplusplus"
  | "cuda"
  | "mpi"
  | "python"
  | "pytorch"
  | "qiskit"
  | "cirq"
  | "react"
  | "typescript"
  | "fastapi"
  | "postgresql"
  | "docker"
  | "kubernetes";

export interface TechnologyMarkDefinition {
  /** Must match the spelling in projects.ts; the mark never guesses aliases. */
  technology: string;
  label: string;
  mark: TechnologyMarkKind;
  tone: VisualAccent;
}

export const TECHNOLOGY_MARKS = [
  { technology: "CUDA", label: "CUDA", mark: "cuda", tone: "thermal" },
  { technology: "C++", label: "C++", mark: "cplusplus", tone: "thermal" },
  { technology: "MPI", label: "MPI", mark: "mpi", tone: "thermal" },
  { technology: "Python", label: "Python", mark: "python", tone: "none" },
  { technology: "PyTorch", label: "PyTorch", mark: "pytorch", tone: "neural" },
  { technology: "Qiskit", label: "Qiskit", mark: "qiskit", tone: "cryo" },
  { technology: "Cirq", label: "Cirq", mark: "cirq", tone: "cryo" },
  { technology: "React", label: "React", mark: "react", tone: "interface" },
  { technology: "TypeScript", label: "TypeScript", mark: "typescript", tone: "interface" },
  { technology: "FastAPI", label: "FastAPI", mark: "fastapi", tone: "interface" },
  { technology: "PostgreSQL", label: "PostgreSQL", mark: "postgresql", tone: "systems" },
  { technology: "Docker", label: "Docker", mark: "docker", tone: "systems" },
  { technology: "Kubernetes", label: "Kubernetes", mark: "kubernetes", tone: "systems" },
] as const satisfies readonly TechnologyMarkDefinition[];

const MARK_BY_TECHNOLOGY = new Map<string, TechnologyMarkDefinition>(
  TECHNOLOGY_MARKS.map((definition) => [definition.technology, definition]),
);

export function getTechnologyMark(technology: string): TechnologyMarkDefinition | null {
  return MARK_BY_TECHNOLOGY.get(technology) ?? null;
}

// A deliberately curated order alternates the semantic channels while keeping
// every claim grounded in an exact technology string from projects.ts.
const RAIL_ORDER = [
  "CUDA",
  "Kubernetes",
  "Qiskit",
  "PyTorch",
  "React",
  "PostgreSQL",
  "C++",
  "Cirq",
  "Python",
  "TypeScript",
  "Docker",
  "MPI",
  "FastAPI",
] as const;

export const TECHNOLOGY_RAIL_ITEMS = RAIL_ORDER.map((technology) => {
  const definition = getTechnologyMark(technology);
  if (!definition) throw new Error(`Missing technology mark for ${technology}`);

  return {
    ...definition,
    projectCount: PROJECTS.filter((project) => project.technologies.includes(technology)).length,
  };
});

export const TECHNOLOGY_RAIL_PROJECT_COUNT = PROJECTS.length;
