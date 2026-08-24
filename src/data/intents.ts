import type { DomainAccent } from "./taxonomy";

/**
 * Intents are the services page written from the visitor's side of the screen:
 * the problem they arrived with, not the capability I want to advertise.
 *
 * Each one pre-fills the contact form, so "this is my problem" and "tell Umer
 * about it" are the same click.
 */
export interface Intent {
  id: string;
  /** The visitor's problem, in their words. */
  title: string;
  /** What I actually do about it. */
  response: string;
  /** What they get back. */
  deliverables: string[];
  accent: DomainAccent;
  /** Pre-filled contact subject. */
  subject: string;
  /** Pre-filled message scaffold — prompts for the details I'd have to ask for anyway. */
  template: string;
}

export const INTENTS: Intent[] = [
  {
    id: "cuda-kernel",
    title: "My GPU kernel is slower than it should be",
    response:
      "Profile it properly, find where the time actually goes, then fix the memory access pattern before touching anything clever.",
    deliverables: [
      "Nsight profile with the bottleneck named",
      "Optimized kernel with before/after timings",
      "A note on what to do next, and what isn't worth doing",
    ],
    accent: "thermal",
    subject: "GPU kernel performance",
    template:
      "What the kernel does:\n\nCurrent timing and hardware:\n\nWhat you've already tried:\n",
  },
  {
    id: "parallelize",
    title: "This job takes hours and I need it to take minutes",
    response:
      "Work out what's actually parallel, pick the right model — threads, MPI, GPU, or all three — and measure the scaling honestly.",
    deliverables: [
      "Scaling study with a speedup curve, not a single number",
      "Parallel implementation with correctness checks",
      "The serial fraction, so you know the ceiling",
    ],
    accent: "thermal",
    subject: "Parallelizing a slow workload",
    template: "What the job does:\n\nHow long it takes now:\n\nHardware available:\n",
  },
  {
    id: "quantum-sim",
    title: "I need to simulate or compare quantum circuits",
    response:
      "Build the simulation, or the platform around it — Qiskit, Cirq, PennyLane, and OpenQASM, with conversion between them.",
    deliverables: [
      "Working simulation with visualized states and measurements",
      "Cross-framework circuit conversion where you need it",
      "A path to scale past what one machine can hold",
    ],
    accent: "cryo",
    subject: "Quantum simulation work",
    template: "What you're simulating:\n\nFramework you're on:\n\nQubit count and depth:\n",
  },
  {
    id: "rag",
    title: "My AI system is confidently wrong",
    response:
      "Add the thing most pipelines skip: validation. Generate, check the output actually runs, repair it, then check again.",
    deliverables: [
      "Multi-agent pipeline with a real validation loop",
      "Retrieval grounded in your own sources",
      "Evaluation harness, so 'better' means something",
    ],
    accent: "none",
    subject: "Making an AI pipeline reliable",
    template:
      "What the system does:\n\nHow it fails right now:\n\nWhat 'correct' means for you:\n",
  },
  {
    id: "full-stack",
    title: "I need the whole thing built, not just the fast part",
    response:
      "React or Next on the front, FastAPI or Node behind it, Postgres under that, containerized and deployed.",
    deliverables: [
      "Working application, deployed",
      "API with real error handling and validation",
      "CI that runs the tests before anything ships",
    ],
    accent: "none",
    subject: "Full-stack build",
    template: "What you're building:\n\nWho uses it:\n\nTimeline:\n",
  },
  {
    id: "review",
    title: "I want someone to check our architecture",
    response:
      "Read the system, find where it will break first, and say so plainly — with the reasoning, not just a verdict.",
    deliverables: [
      "Written review, ordered by what will hurt soonest",
      "Concrete fixes, with effort estimates",
      "A walkthrough call to argue about it",
    ],
    accent: "none",
    subject: "Architecture review",
    template: "What the system does:\n\nWhat worries you about it:\n\nStack:\n",
  },
];

export function getIntent(id: string | null | undefined): Intent | undefined {
  if (!id) return undefined;
  return INTENTS.find((intent) => intent.id === id);
}
