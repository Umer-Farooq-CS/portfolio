// The actual machine and toolchain.
//
// Every entry here is either named in master_detailed_cv.tex or is the tool a
// project in projects.ts was built with — nothing is listed because it sounds
// good. Where the specific isn't recorded anywhere (the CPU, the installed CUDA
// version), the item carries `todo: true` and says so on the page instead of
// guessing. A fabricated part number is worse than an admitted gap.

import { z } from "zod";

export interface UsesItem {
  /** What the row measures. */
  label: string;
  /** The answer, plus why it's the answer where that isn't obvious. */
  value: string;
  /** Not yet confirmed by the owner. Rendered muted and marked, never invented. */
  todo?: boolean;
}

export interface UsesGroup {
  id: string;
  title: string;
  /** One line on what this group is for, where the title alone leaves it open. */
  note?: string;
  items: UsesItem[];
}

export const USES_GROUPS: UsesGroup[] = [
  {
    id: "machine",
    title: "Machine",
    note: "Every number quoted on this site was measured here.",
    items: [
      {
        label: "CPU",
        value: "Not confirmed yet — the parallel numbers on /lab read your cores, not mine.",
        todo: true,
      },
      {
        label: "GPU",
        value:
          "NVIDIA GeForce RTX 4070. The LSTM text generator trains in 1.9 GB on it at 6.4 samples/s.",
      },
      { label: "Memory", value: "Not confirmed yet.", todo: true },
      {
        label: "Operating systems",
        value:
          "Windows 11 with PowerShell for .NET, Visual Studio, and day-to-day work; Ubuntu for the MPI, perf, and Valgrind runs, because those tools only exist there.",
      },
    ],
  },
  {
    id: "compute",
    title: "GPU / compute",
    note: "The stack the HPC work is written and measured with.",
    items: [
      {
        label: "CUDA",
        value:
          "Kernel work by hand: shared-memory tiling, kernel fusion, streams, memory coalescing, and Tensor Cores for the matrix multiplies.",
      },
      {
        label: "CUDA toolkit",
        value: "Installed version not confirmed yet.",
        todo: true,
      },
      {
        label: "Profilers",
        value:
          "NVIDIA Nsight Systems for the timeline, Nsight Compute per kernel, perf for CPU hotspots and cache misses, Valgrind for memory.",
      },
      {
        label: "Parallel models",
        value: "OpenMP for shared memory, MPI across nodes, pthreads where the threading has to be explicit.",
      },
      {
        label: "Partitioning",
        value: "METIS, for balancing tensor-network partitions across MPI ranks in Q-Tensor.",
      },
      { label: "Mixed precision", value: "FP16 with PyTorch autocast and GradScaler; FP32 kept for the reductions." },
    ],
  },
  {
    id: "editor",
    title: "Editor and shell",
    items: [
      { label: "Editor", value: "VS Code for everything that isn't a solution file." },
      { label: "IDEs", value: "Visual Studio for .NET and Windows C++, IntelliJ IDEA for Java, PyCharm for larger Python." },
      { label: "Shells", value: "PowerShell on Windows, bash on Ubuntu." },
      { label: "Version control", value: "Git, with GitHub for public work and GitLab where a project already lives there." },
      { label: "API testing", value: "Postman for exploring, curl for anything that belongs in a script." },
    ],
  },
  {
    id: "toolchains",
    title: "Languages and toolchains",
    items: [
      { label: "C and C++", value: "C++17. CMake for anything with more than one target, Make below that." },
      { label: "Python", value: "pip and venv. PyTorch first, TensorFlow/Keras where a project already used it." },
      {
        label: "Quantum",
        value: "Qiskit, Cirq, and PennyLane, with OpenQASM 3.0 as the format that moves circuits between them. JAX for the differentiable parts.",
      },
      { label: "Web", value: "TypeScript throughout. Vite and React here, Next.js on QCanvas, FastAPI or Express behind them." },
      { label: "Desktop", value: ".NET 8 with WPF and Windows Forms; JavaFX with Maven." },
      { label: "Games", value: "SFML and SDL2, with hand-written physics and collision." },
      { label: "Containers", value: "Docker and Docker Compose, so a build runs the same on a marker's machine as on mine." },
    ],
  },
  {
    id: "services",
    title: "Services",
    items: [
      { label: "CI", value: "GitHub Actions — build, typecheck, tests, and the deploy for this site." },
      { label: "Hosting", value: "GitHub Pages. This site is static; there is no server at runtime." },
      { label: "Cloud", value: "Oracle Cloud Infrastructure, which is also what the two 2025 certifications cover." },
      { label: "Databases", value: "PostgreSQL by default, MySQL and MongoDB where a project arrived with them." },
      { label: "Orchestration", value: "Kubernetes, for scheduling QCanvas simulation jobs across workers." },
      { label: "Forms", value: "Formspree handles the contact form, because a static host has nothing to POST to." },
    ],
  },
];

/** Items still waiting on the owner to confirm a specific. */
export function getUnconfirmedItems(): { group: string; label: string }[] {
  return USES_GROUPS.flatMap((group) =>
    group.items.filter((item) => item.todo === true).map((item) => ({ group: group.title, label: item.label })),
  );
}

// --- schemas ---------------------------------------------------------------

const nonEmpty = z.string().trim().min(1);

export const usesItemSchema = z.object({
  label: nonEmpty,
  value: nonEmpty,
  todo: z.boolean().optional(),
});

export const usesGroupSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "id must be lowercase kebab-case"),
  title: nonEmpty,
  note: nonEmpty.optional(),
  items: z.array(usesItemSchema).min(1),
});
