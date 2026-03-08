// Profile data derived from master_detailed_cv.tex

export const PROFESSIONAL_SUMMARY =
  "Systems-focused computer scientist with deep experience in high-performance computing, parallel and distributed systems, and full‑stack development. I build efficient, scalable systems that span GPU‑accelerated algorithms, quantum simulation, multi‑agent RAG pipelines, custom languages, distributed hash tables, and real-time networked applications.";

export interface EducationItem {
  degree: string;
  institution: string;
  period: string;
  highlights: string[];
}

export const EDUCATION: EducationItem = {
  degree: "Bachelor of Computer Science",
  institution: "National University of Computer and Emerging Sciences (FAST-NUCES), Islamabad Campus",
  period: "Aug 2022 – Jun 2026 (Expected)",
  highlights: [
    "Dean's List Award – Spring 2023",
    "Relevant coursework: High-Performance Computing, Parallel & Distributed Computing, Compiler Construction, Operating Systems, Database Systems, Computer Networks, AI & Machine Learning",
  ],
};

export interface CertificationItem {
  year: string;
  title: string;
  issuer: string;
  credentialUrl?: string;
}

export const CERTIFICATIONS: CertificationItem[] = [
  {
    year: "2025",
    title: "Oracle Cloud Infrastructure Certified Generative AI Professional",
    issuer: "Oracle",
    credentialUrl:
      "https://catalog-education.oracle.com/pls/certview/sharebadge?id=BBA28841241A387615C60D761D610210FCC9BC8028300E10D96E95890EEB68B7",
  },
  {
    year: "2025",
    title: "Oracle Cloud Infrastructure Certified AI Foundations Associate",
    issuer: "Oracle",
    credentialUrl:
      "https://catalog-education.oracle.com/pls/certview/sharebadge?id=BBA28841241A387615C60D761D610210FCC9BC8028300E10D96E95890EEB68B7",
  },
];

export interface SkillGroup {
  title: string;
  items: string[];
}

export const SKILL_GROUPS: SkillGroup[] = [
  {
    title: "High-Performance Computing & Parallelism",
    items: [
      "GPU computing with CUDA, Tensor Cores, mixed-precision training",
      "OpenMP, MPI, and hybrid MPI+OpenMP parallel programming",
      "Performance profiling and optimization with NVIDIA Nsight, perf, and Valgrind",
    ],
  },
  {
    title: "Machine Learning, Deep Learning & LLM Systems",
    items: [
      "PyTorch, TensorFlow/Keras for CNNs, RNNs/LSTMs, diffusion and GAN models",
      "Retrieval-Augmented Generation (RAG), semantic search, FAISS, evaluation with NDCG/MAP",
      "Multi-agent AI workflows, prompt engineering, and tool-augmented pipelines",
    ],
  },
  {
    title: "Quantum Computing & Simulation",
    items: [
      "Qiskit, Cirq, PennyLane, and OpenQASM 3.0",
      "Quantum circuit simulation, tensor networks, and hybrid classical–quantum workflows",
    ],
  },
  {
    title: "Systems, Distributed & Networking",
    items: [
      "Modern C/C++ for systems programming and algorithmic optimization",
      "Distributed hash tables, IPFS-style storage, P2P and client–server architectures",
      "Socket programming (TCP/UDP), multithreading with pthreads, concurrency control",
    ],
  },
  {
    title: "Full-Stack Development & Platforms",
    items: [
      "React, Next.js, Node.js/Express, FastAPI, RESTful API design",
      ".NET, JavaFX, desktop applications with PostgreSQL/MySQL backends",
      "Kubernetes, Docker, GitHub Actions, and CI/CD for reproducible deployments",
    ],
  },
];

