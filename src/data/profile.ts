// Profile data derived from master_detailed_cv.tex

import type { DomainAccent } from "./taxonomy";

export const PROFESSIONAL_SUMMARY =
  "I build the systems underneath AI and HPC workloads — the bare-metal Kubernetes and HPC platforms they run on, the GPU kernels that make them fast, and the pipelines that check their own output before returning it. The work runs in three strands: infrastructure and platform engineering for enterprise GPU-as-a-Service deployments, the solution architecture and support models behind the bids for them, and the GPU, quantum and AI development the platforms exist to serve. Every number on this site is one I measured.";

export interface EducationItem {
  degree: string;
  institution: string;
  period: string;
  highlights: string[];
}

export const EDUCATION: EducationItem = {
  degree: "Bachelor of Computer Science",
  institution: "National University of Computer and Emerging Sciences (FAST-NUCES)",
  period: "Aug 2022 – Jun 2026",
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
  },
];

export interface SkillGroup {
  title: string;
  items: string[];
  accent: DomainAccent;
}

export const SKILL_GROUPS: SkillGroup[] = [
  {
    title: "High-Performance Computing & Parallelism",
    accent: "thermal",
    items: [
      "GPU computing with CUDA, Tensor Cores, mixed-precision training",
      "OpenMP, MPI, and hybrid MPI+OpenMP parallel programming",
      "Performance profiling and optimization with NVIDIA Nsight, perf, and Valgrind",
    ],
  },
  {
    title: "Machine Learning, Deep Learning & LLM Systems",
    accent: "neural",
    items: [
      "PyTorch, TensorFlow/Keras for CNNs, RNNs/LSTMs, diffusion and GAN models",
      "Retrieval-Augmented Generation (RAG), semantic search, FAISS, evaluation with NDCG/MAP",
      "Multi-agent AI workflows, prompt engineering, and tool-augmented pipelines",
    ],
  },
  {
    title: "Quantum Computing & Simulation",
    accent: "cryo",
    items: [
      "Qiskit, Cirq, PennyLane, and OpenQASM 3.0",
      "Quantum circuit simulation, tensor networks, and hybrid classical–quantum workflows",
    ],
  },
  {
    title: "Systems, Distributed & Networking",
    accent: "systems",
    items: [
      "Modern C/C++ for systems programming and algorithmic optimization",
      "Distributed hash tables, IPFS-style storage, P2P and client–server architectures",
      "Socket programming (TCP/UDP), multithreading with pthreads, concurrency control",
    ],
  },
  {
    title: "Full-Stack Development & Platforms",
    accent: "interface",
    items: [
      "React, Next.js, Node.js/Express, FastAPI, RESTful API design",
      ".NET, JavaFX, desktop applications with PostgreSQL/MySQL backends",
      "Kubernetes, Docker, GitHub Actions, and CI/CD for reproducible deployments",
    ],
  },
  {
    title: "Infrastructure, Orchestration & Automation",
    accent: "systems",
    items: [
      "Bare-metal provisioning with MAAS, Warewulf diskless imaging, and IPMI/Redfish out-of-band control",
      "Hardened Kubernetes bootstrap with Kubespray and Ansible — encrypted CNI, Pod Security Standards, least-privilege RBAC, CIS-aligned kubelet",
      "GitOps delivery with ArgoCD, Helm and Kustomize; Terraform and inventory-as-code",
      "Slurm scheduling and GPFS parallel storage; Spack and Lmod environment stacks",
      "Prometheus, Grafana and Loki observability; Keycloak OIDC single sign-on and role-based access",
    ],
  },
  {
    title: "Solution Architecture & Technical Pre-Sales",
    accent: "neural",
    items: [
      "Enterprise reference architectures and RFP-grade technical proposals for large-scale bids",
      "Multi-tenant isolation design across identity, quota, network, GPU/MIG partitioning and data",
      "SLA and incident-response frameworks — severity tiers, response and restore commitments, escalation ladders, and the RCA loop back into runbooks",
      "Compliance, RACI and architecture diagram sets that hold up under customer review",
    ],
  },
];

