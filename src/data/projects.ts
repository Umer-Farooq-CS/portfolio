// Project portfolio data derived from master_detailed_cv.tex
import {
  cirqRagDiagram,
  gpuCloudDiagram,
  gpuOptimizationDiagram,
  hpcClusterDiagram,
  k8sAutomationDiagram,
  slaFrameworkDiagram,
} from "@/assets/optimized/manifest";
import type { ResponsiveImage } from "@/assets/optimized/manifest";
import { DOMAIN_IDS, type Domain } from "./taxonomy";
import type { Metric } from "./schema";
import type { DetailSectionSource, ProfileConfig, ProfileId } from "./profiles";

/**
 * How this one project reads under a given profile. Every field here is a
 * *subset or relabeling* of the project's own shared facts — never new facts.
 * The schema (projectSchema, src/data/schema.ts) enforces that `techFocus` and
 * `metricFocus` can only reference technologies/metrics the project already
 * has, so a lens override cannot fabricate a capability the project lacks.
 */
export interface ProjectLensView {
  /** Replaces the shared subtitle/tagline as this lens's card/lead summary. */
  summary?: string;
  /** Subset of `technologies`, in the order this lens leads with. */
  techFocus?: string[];
  /** Subset of `metrics[].label`, in the order this lens leads with. */
  metricFocus?: string[];
  /** Authored detail-page sections for this lens, overriding the generic template. */
  sections?: { key: string; label: string; points: string[] }[];
}

export interface ProjectItem {
  slug: string;
  title: string;
  subtitle: string;
  /** Specific human-facing label shown on the project page. */
  category: string;
  /** Closed-taxonomy domains, most relevant first. Drives grouping and filters. */
  domains: Domain[];
  period?: string;
  githubUrl?: string;
  externalUrl?: string;
  award?: string;
  description: string[];
  technologies: string[];
  featured?: boolean; // shown on homepage
  image?: ResponsiveImage; // optional diagram or hero image
  architectureHighlights?: string[]; // optional key architecture bullets
  /** Structured results, so numbers can render as data instead of prose. */
  metrics?: Metric[];
  /** Punchier one-liner for cards, where the full subtitle is too long. */
  tagline?: string;
  /** The problem this project set out to solve. */
  objective?: string;
  /** How it was approached — the moves that mattered. */
  strategy?: string[];
  /**
   * Attribution for work delivered under a client NDA. Present only where the
   * engagement can't be named — the architecture and the numbers are the
   * author's own, the client isn't. Rendered as a note, never as a claim.
   */
  confidentiality?: string;
  /** Per-profile presentation overrides. Absent lenses fall back to the shared fields. */
  lenses?: Partial<Record<ProfileId, ProjectLensView>>;
}

export const PROJECTS: ProjectItem[] = [
  // --- Infrastructure & solution architecture -------------------------------
  // Delivered at MAK Technology. The engagements can't be named; the
  // architecture, the audit and the numbers are first-hand. Every figure here is
  // countable off the delivered system or its report set — see the diagram on
  // each project page.
  {
    slug: "hpc-cluster-platform",
    title: "HPC Cluster Management Platform",
    subtitle:
      "One control plane that provisions bare metal, bakes the node image, schedules the work, mounts the parallel filesystem, and streams every line back to the browser",
    category: "Infrastructure & Platform Engineering",
    domains: ["infra", "hpc", "web"],
    period: "2026",
    featured: true,
    image: hpcClusterDiagram,
    confidentiality: "Delivered at MAK Technology. Client, site and host identifiers withheld under NDA.",
    tagline: "SSH is not an operations strategy",
    description: [
      "A full-stack orchestration platform that replaces manual SSH and ad-hoc Ansible runs on a bare-metal HPC cluster with one auditable pipeline.",
      "Provision and image: dual-provisioner DHCP hands chassis to MAAS, which commissions and disk-installs them; Warewulf then boots the compute nodes diskless from a three-variant image bake.",
      "Orchestrate and execute: a FastAPI control plane turns each HTTP request into a queued Celery task that opens exactly one SSH session against the live cluster, with stdout and stderr merged and streamed.",
      "Schedule, store and stream: Slurm on the control node, a six-stage GPFS deployment for parallel storage, Spack/Lmod environment stacks, and an Open OnDemand portal so a researcher never needs an SSH client.",
      "A cross-cutting plane wraps all three stages — Keycloak realm bootstrap, three-role RBAC, a TLS edge, an SSH access proxy, and Prometheus/Grafana scraping the scheduler and the storage servers.",
      "Every long-running operation has the same shape: route to Celery to a single SSH session to the Redis ledger to a WebSocket, so a reload mid-deployment reattaches to the run instead of losing it.",
    ],
    technologies: [
      "Python",
      "FastAPI",
      "Celery",
      "Redis",
      "React",
      "TypeScript",
      "PostgreSQL",
      "Slurm",
      "GPFS",
      "MAAS",
      "Warewulf",
      "Ansible",
      "Keycloak",
      "Prometheus",
      "Grafana",
      "Docker",
      "WebSockets",
      "asyncssh",
      "Spack",
      "Lmod",
    ],
    objective:
      "A production HPC cluster was being operated by hand — SSH sessions, ad-hoc playbooks and tribal knowledge — which made every provisioning, imaging or storage change unreviewable and unrepeatable. The platform had to put one control plane over the metal without taking the cluster offline to do it.",
    strategy: [
      "Modelled every operation as a queued task rather than a request thread, so a deployment survives a browser reload and can never run twice concurrently",
      "Held a single deployment lock in the control plane, so a double-clicked wizard or a second browser tab joins the run in flight instead of racing it",
      "Made failure explicit: each task scans its own output for error markers and halts the remaining steps, rather than letting a half-provisioned node report success",
      "Persisted every task's output to a Redis ledger with a 24-hour TTL and a terminator sentinel, so the log replays from index zero on reconnect",
      "Ran a nine-part security and performance audit of the delivered platform and remediated the critical findings before handover",
    ],
    architectureHighlights: [
      "Nine containers from the TLS edge through to the dashboards, over four host tiers: orchestration, control plane, diskless HPC nodes, and disk-installed storage.",
      "Fifteen Celery tasks across nine modules, every one streaming into the same Redis log ledger and out over one WebSocket.",
      "Keycloak OIDC with three roles gating every privileged route and the log socket itself — not just the UI.",
      "A six-stage GPFS deployment that probes before each step and re-runs rather than duplicating, so a partial storage build resumes instead of restarting.",
      "Identity, transport and telemetry are a cross-cutting plane rather than a fourth stage — every request is gated before any work happens, and every stage is scraped by the same collector.",
    ],
    metrics: [
      {
        label: "Critical findings closed",
        value: "5",
        baseline: "20 tracked",
        note: "Plus one high. Nine-part security and performance audit I ran against the delivered platform; every critical closed before handover.",
      },
      {
        label: "Orchestration surface",
        value: "15 tasks",
        note: "Across nine modules, over four host tiers and nine containers.",
      },
      {
        label: "Scheduler memory accuracy",
        value: "~93%",
        note: "Slurm RealMemory pinned near 93% of physical, so the exact figure never makes a node refuse to register.",
      },
      {
        label: "Manual SSH operations",
        value: "0",
        baseline: "every change",
        note: "Provisioning, imaging, scheduling and storage all move through the same reviewable pipeline.",
      },
    ],
    lenses: {
      infrastructure: {
        summary:
          "Bare metal to running jobs in one pipeline — MAAS provisioning, Warewulf diskless imaging, Slurm scheduling and a six-stage GPFS build, all driven from one control plane with live log streaming.",
        techFocus: ["Slurm", "GPFS", "MAAS", "Warewulf", "Ansible", "Keycloak"],
        metricFocus: ["Manual SSH operations", "Orchestration surface", "Scheduler memory accuracy"],
      },
      presales: {
        summary:
          "The cluster was being run by hand, so no provisioning or storage change was reviewable. This is the control plane that made cluster operations auditable — and the audit that proved it.",
        techFocus: ["Slurm", "GPFS", "MAAS", "Keycloak", "Prometheus"],
        metricFocus: ["Critical findings closed", "Manual SSH operations"],
      },
      development: {
        summary:
          "A FastAPI and Celery control plane where every long-running operation has one shape — route, task, a single SSH session, Redis ledger, WebSocket — so a reload reattaches instead of losing the run.",
        techFocus: ["Python", "FastAPI", "Celery", "Redis", "React", "asyncssh"],
        metricFocus: ["Orchestration surface", "Critical findings closed"],
      },
    },
  },
  {
    slug: "k8s-bare-metal-automation",
    title: "Bare-Metal Kubernetes Automation Platform",
    subtitle:
      "From an empty rack to a production, GitOps-managed, security-hardened Kubernetes cluster — declarative end to end",
    category: "Infrastructure & Platform Engineering",
    domains: ["infra", "systems"],
    period: "2026",
    featured: true,
    image: k8sAutomationDiagram,
    confidentiality: "Delivered at MAK Technology. Client and product identifiers withheld under NDA.",
    tagline: "Empty rack to hardened cluster, declaratively",
    description: [
      "A three-stage infrastructure-as-code platform that takes bare chassis to a running, continuously reconciled Kubernetes cluster with no operator at the rack.",
      "Stage 01, provisioning: MAAS commissioning with PXE/iPXE boot, IPMI/Redfish out-of-band power control, hardware self-inventory, role tags that tell the bootstrap what each machine is for, and a zero-touch OS install with bonded NICs and VLANs from a machine profile.",
      "Stage 02, cluster bootstrap: idempotent Kubespray/Ansible playbooks build a highly-available control plane from a version-controlled inventory, with security hardening applied inside the same run rather than bolted on afterwards.",
      "Stage 03, GitOps delivery: one root ArgoCD Application renders every platform add-on straight from Git, detecting and reconciling drift continuously.",
      "Day-2 operations span all three stages and ship as automation against the same inventory and repository, not as wiki pages: certificate rotation, etcd backup and restore, node drain and replacement, staged cluster upgrade, and disaster recovery.",
    ],
    technologies: [
      "Kubernetes",
      "Kubespray",
      "Ansible",
      "MAAS",
      "ArgoCD",
      "Terraform",
      "Helm",
      "Calico",
      "WireGuard",
      "Longhorn",
      "Rook-Ceph",
      "Prometheus",
      "Loki",
      "Kubecost",
      "MetalLB",
      "Slurm",
      "YAML",
      "Docker",
    ],
    objective:
      "Cluster builds were manual, so no two environments matched and no rebuild was trustworthy. The platform had to make the entire path — OS, cluster, add-ons and day-2 operations — declarative, reviewable and re-runnable from an empty rack.",
    strategy: [
      "Split the path into three stages with an explicit artefact handed between them, so any stage can be re-entered on demand without unwinding the others",
      "Kept the playbooks idempotent and the inventory in version control, so a rebuild is a re-run rather than a fresh improvisation",
      "Applied security hardening inside the bootstrap run — encrypted CNI, Pod Security Standards, least-privilege RBAC, API audit logging and CIS-aligned kubelet flags — so a cluster is never briefly unhardened",
      "Delivered add-ons through one app-of-apps root so platform state is declared in Git and drift is corrected continuously rather than discovered later",
      "Wrote the five day-2 runbooks as automation against the same inventory, so the recovery path is exercised by the same code that built the cluster",
    ],
    architectureHighlights: [
      "Three control-plane replicas holding a stacked etcd quorum behind a floating virtual IP, so losing a master never loses the cluster.",
      "Calico CNI with WireGuard encryption for node-to-node pod traffic, default-deny east-west policy, and Pod Security Standards enforced per namespace.",
      "One app-of-apps ArgoCD root rendering storage, observability, logging, cost, ingress and HPC workloads — with self-heal and prune enabled.",
      "Slurm-on-Kubernetes so batch HPC scheduling runs beside the platform's own pods rather than on separate hardware.",
    ],
    metrics: [
      {
        label: "Manual OS install steps",
        value: "0",
        baseline: "every node",
        note: "Every node PXE-booted and imaged from a machine profile — no operator at the rack.",
      },
      {
        label: "Cluster & add-on state in Git",
        value: "100%",
        note: "Declared in Git and auto-synced; drift is reconciled continuously.",
      },
      {
        label: "Control-plane replicas",
        value: "3×",
        note: "Stacked etcd quorum behind a floating VIP.",
      },
      {
        label: "Day-2 runbooks as automation",
        value: "5",
        note: "Certificate rotation, etcd backup and restore, node replacement, cluster upgrade, disaster recovery — shipped as code, not documentation.",
      },
    ],
    lenses: {
      infrastructure: {
        summary:
          "MAAS zero-touch provisioning, Kubespray hardened HA bootstrap, ArgoCD GitOps delivery — with the five day-2 runbooks shipped as automation against the same inventory.",
        techFocus: ["MAAS", "Kubespray", "Ansible", "ArgoCD", "Calico", "WireGuard"],
        metricFocus: ["Manual OS install steps", "Cluster & add-on state in Git", "Day-2 runbooks as automation"],
      },
      presales: {
        summary:
          "No two environments matched and no rebuild was trustworthy. This is the declarative path from empty rack to hardened, continuously reconciled cluster — and the day-2 model that keeps it that way.",
        techFocus: ["Kubernetes", "ArgoCD", "Terraform", "MAAS"],
        metricFocus: ["Cluster & add-on state in Git", "Manual OS install steps"],
      },
      development: {
        summary:
          "Idempotent Kubespray/Ansible playbooks over a version-controlled inventory, with hardening applied inside the bootstrap run so the cluster is never briefly unhardened.",
        techFocus: ["Ansible", "Kubespray", "Helm", "YAML", "Kubernetes"],
        metricFocus: ["Control-plane replicas", "Cluster & add-on state in Git"],
      },
    },
  },
  {
    slug: "gpu-cloud-reference-architecture",
    title: "GPU Cloud Reference Architecture",
    subtitle:
      "Multi-tenant GPU-as-a-Service on one physical substrate — hard tenant boundaries at every layer, from the data plane up to identity",
    category: "Solution Architecture & Technical Pre-Sales",
    domains: ["architecture", "infra", "hpc"],
    period: "2026",
    featured: true,
    image: gpuCloudDiagram,
    confidentiality:
      "Authored at MAK Technology for enterprise bids. Client and product identifiers withheld under NDA.",
    tagline: "Five isolation layers, one physical substrate",
    description: [
      "Enterprise reference architecture and RFP-grade technical documentation for a multi-tenant GPU-as-a-Service platform, authored for large-scale bids.",
      "A five-layer tenant isolation model — data, GPU/MIG, quota, network, identity — where every layer carries its own boundary rather than relying on the one below it.",
      "Shared resource pools rather than tenant-dedicated hardware: a bin-packing GPU pool with MIG partitioning and DCGM health gating, tiered storage from NVMe hot through object capacity, and a non-blocking spine-leaf fabric with RoCEv2.",
      "One tenant-scoped control plane: Keycloak OIDC realms, namespace-per-tenant with ResourceQuota and LimitRange defaults, OPA/Gatekeeper admission policy, and per-tenant KMS keys and audit trails.",
      "Chargeback and governance designed in rather than added later — cost centre attribution per tenant, monthly showback, and a tenant onboarding path where quota and policy are inherited from a template.",
      "Around 50 architecture diagrams plus compliance and RACI documentation supporting the bid.",
    ],
    technologies: [
      "Solution Architecture",
      "Kubernetes",
      "NVIDIA MIG",
      "Keycloak",
      "OIDC",
      "OPA/Gatekeeper",
      "Terraform",
      "Calico",
      "RoCEv2",
      "Prometheus",
      "Grafana",
      "Kubecost",
      "Rook-Ceph",
      "Docker",
    ],
    objective:
      "A GPU cloud bid needed an architecture that could put many tenants on one physical substrate and still defend the isolation claim layer by layer — technically, commercially, and under RFP scrutiny.",
    strategy: [
      "Made isolation a stack rather than a feature: each of the five layers holds its own boundary, so no single control is load-bearing for the whole tenancy claim",
      "Chose shared pools with hard partitioning over dedicated hardware per tenant, so utilisation stays economic without softening the boundary",
      "Scoped every control-plane API surface to a tenant, so multi-tenancy is enforced at the control plane rather than at the UI",
      "Designed chargeback and the onboarding template alongside the architecture, so a new tenant inherits quota and policy instead of being configured by hand",
      "Wrote the compliance and RACI documentation against the same diagram set, so the technical and commercial answers cannot drift apart",
    ],
    architectureHighlights: [
      "Five isolation layers: data (per-tenant KMS key, PV/PVC, bucket scoping), GPU/MIG (isolated resource claims, no cross-tenant node sharing), quota (ResourceQuota, LimitRange, PriorityClass), network (per-tenant VRF/VLAN, default-deny east-west, isolated ingress), and identity (OIDC realm per tenant, SSO/SAML federation, MFA on admin roles).",
      "One control plane where every API surface is tenant-scoped, with OPA/Gatekeeper blocking on violation at admission.",
      "Shared GPU pool with a bin-packing scheduler, MIG partitions, node taints and tolerations, and DCGM health gating.",
      "Tiered storage — NVMe hot tier through object capacity tier — with RDMA transport over a non-blocking spine-leaf fabric.",
    ],
    metrics: [
      {
        label: "Tenant isolation layers",
        value: "5",
        note: "Data, GPU/MIG, quota, network, identity — each holding its own boundary.",
      },
      {
        label: "Architecture diagrams authored",
        value: "~50",
        note: "Plus the compliance and RACI documentation for the bid.",
      },
      {
        label: "Tenant-dedicated hardware",
        value: "0",
        note: "One physical substrate; isolation is enforced by partitioning and policy, not by separate racks.",
      },
    ],
    lenses: {
      presales: {
        summary:
          "The bid needed a multi-tenant GPU cloud whose isolation claim held up layer by layer. Five isolation layers, shared pools with hard partitioning, chargeback designed in — with ~50 diagrams and the compliance set behind it.",
        techFocus: ["Solution Architecture", "Kubernetes", "NVIDIA MIG", "Keycloak", "OIDC"],
        metricFocus: ["Tenant isolation layers", "Architecture diagrams authored", "Tenant-dedicated hardware"],
      },
      infrastructure: {
        summary:
          "Shared GPU pool with MIG partitioning and DCGM health gating, namespace-per-tenant quota, per-tenant VRF/VLAN with default-deny east-west, and RoCEv2 over a non-blocking spine-leaf fabric.",
        techFocus: ["Kubernetes", "NVIDIA MIG", "Calico", "RoCEv2", "OPA/Gatekeeper"],
        metricFocus: ["Tenant isolation layers", "Tenant-dedicated hardware"],
      },
      development: {
        summary:
          "How the isolation is actually enforced: tenant-scoped control-plane APIs, admission policy that blocks on violation, per-tenant KMS keys, and quota objects with defaults rather than conventions.",
        techFocus: ["Kubernetes", "OPA/Gatekeeper", "OIDC", "Terraform"],
        metricFocus: ["Tenant isolation layers"],
      },
    },
  },
  {
    slug: "enterprise-sla-framework",
    title: "Enterprise SLA & Incident-Response Framework",
    subtitle:
      "The support operating model behind a multi-tenant GPU platform — severity classification, response and restore commitments, escalation, and the RCA loop that feeds improvements back",
    category: "Solution Architecture & Technical Pre-Sales",
    domains: ["architecture"],
    period: "2026",
    featured: true,
    image: slaFrameworkDiagram,
    confidentiality:
      "Authored at MAK Technology for enterprise bids. Client and product identifiers withheld under NDA.",
    tagline: "What the platform promises, and who answers when it does not",
    description: [
      "The support operating model that backs a platform's contract: what counts as an incident, how fast someone answers, who they escalate to, and how the fix becomes a permanent change.",
      "A seven-step incident lifecycle — detect, triage and classify, respond and mitigate, restore service, verify with the tenant, root cause analysis, preventive action — with the tooling named at each step.",
      "A severity and commitment matrix from P0 (platform-wide outage affecting multiple tenants) to P3 (cosmetic or informational), each with a response and a restore target, and an explicit distinction between the two.",
      "A four-level escalation ladder from service desk through platform engineering and architecture/SME to vendor TAC and OEM support, with warm handoff — the raising level retains ownership until accepted.",
      "Governance designed as a cadence rather than a document: monthly service review on SLA attainment and open actions, SLA credit reporting mapped to the commitment matrix, a dependency register, and a quarterly review of the matrix and escalation contacts.",
    ],
    technologies: [
      "Solution Architecture",
      "Prometheus",
      "Grafana",
      "Loki",
      "Kubernetes",
      "Slurm",
      "GPFS",
      "Ansible",
      "ArgoCD",
      "Terraform",
    ],
    objective:
      "A multi-tenant GPU platform was going to contract without a defined support model, so the availability promise had no severity definitions, no named response commitments, and no escalation path to stand behind it.",
    strategy: [
      "Separated response from restore in the matrix — acknowledgement with a named engineer engaged is a different promise from service returned to the agreed operating state, and conflating them is how SLAs get disputed",
      "Made severity a triage decision confirmed with the tenant, with disputes resolved upward and never downward",
      "Gave P0 a bypass: exec, platform engineering and vendor support engage in parallel rather than climbing the ladder step by step",
      "Closed the loop back into the platform — every RCA produces a runbook, monitoring rule or config change that is shipped and tracked, so the framework changes the system rather than only describing it",
      "Tied SLA credit reporting to the same commitment matrix, so the commercial and operational documents cannot disagree",
    ],
    architectureHighlights: [
      "P0: 15-minute response commitment, 4-hour restore target, 24×7 on-call, immediate exec plus OEM/vendor TAC engagement in parallel.",
      "Four severity tiers each carrying a definition, a response commitment, a restore target and an escalation owner — P1 1h/8h, P2 4h/3 business days, P3 next business day and scheduled release.",
      "Warm-handoff escalation across four levels, so ownership is never dropped between tiers.",
      "The preventive-action step feeds runbook and monitoring updates back into the platform, closing the lifecycle rather than ending it at 'restored'.",
    ],
    metrics: [
      {
        label: "P0 response commitment",
        value: "15 min",
        note: "Acknowledgement with a named engineer engaged, 24×7.",
      },
      {
        label: "P0 restore target",
        value: "4 h",
        note: "Service returned to the agreed operating state — not necessarily the permanent fix.",
      },
      {
        label: "Severity tiers and escalation levels",
        value: "4 × 4",
        note: "P0 through P3 against L1 service desk through L4 vendor TAC/OEM.",
      },
      {
        label: "Service review cadence",
        value: "Monthly",
        note: "SLA attainment, trend and open actions; matrix and contacts reviewed quarterly.",
      },
    ],
    lenses: {
      presales: {
        summary:
          "The availability promise had no severity definitions and no escalation path behind it. This is the matrix, the ladder and the RCA loop that make it contractible — and reportable every month.",
        techFocus: ["Solution Architecture"],
        metricFocus: [
          "P0 response commitment",
          "P0 restore target",
          "Severity tiers and escalation levels",
          "Service review cadence",
        ],
      },
      infrastructure: {
        summary:
          "The operational side of the platform: what monitoring raises an incident, who is on call, and how an RCA turns into a shipped runbook, monitoring rule or config change.",
        techFocus: ["Prometheus", "Grafana", "Loki", "Ansible", "ArgoCD"],
        metricFocus: ["P0 response commitment", "P0 restore target"],
      },
      development: {
        summary:
          "Where the framework touches the system: the monitoring that detects, the runbooks that respond, and the preventive changes shipped through the same GitOps path as everything else.",
        techFocus: ["Prometheus", "Loki", "ArgoCD", "Terraform"],
        metricFocus: ["Severity tiers and escalation levels"],
      },
    },
  },

  // Featured (homepage) - match existing ProjectsSection
  {
    slug: "qcanvas",
    title: "QCanvas",
    subtitle: "Unified Quantum Simulator Platform",
    category: "High-Performance Computing & Quantum",
    domains: ["quantum", "hpc", "web"],
    period: "Mar 2025 – Present",
    featured: true,
    award: "3rd Prize · Huawei ICT Competition National Finals (UniQ Team)",
    description: [
      "Web-based quantum computing platform unifying Cirq, Qiskit, and PennyLane with an accessible interface for simulation, conversion, and visualization.",
      "Multi-framework support: bi-directional circuit conversion between Cirq, Qiskit, and PennyLane.",
      "Real-time simulation with multiple backend options and extensible plugins.",
      "Interactive visualization of circuits, states, operations, and measurement results in-browser.",
      "Hybrid architecture: Next.js for UI/routing and FastAPI for compute-heavy quantum operations.",
      "OpenQASM 3.0 integration for portable circuit exchange; plugin-based system for additional frameworks.",
    ],
    technologies: [
      "Next.js",
      "TypeScript",
      "FastAPI",
      "Qiskit",
      "Cirq",
      "PennyLane",
      "OpenQASM",
      "REST/Web APIs",
      "Kubernetes",
    ],
    objective:
      "Eliminate vendor lock-in by providing a unified platform where users can write and execute quantum circuits across multiple frameworks seamlessly.",
    strategy: [
      "Developed an OpenQASM 3.0 Intermediate Representation core for framework-agnostic circuit execution",
      "Built a Kubernetes-based Job Manager for distributed resource allocation",
      "Implemented priority scheduling for fair, efficient workload distribution",
      "Abstraction layer enabling cross-framework portability without code rewrites",
    ],
    architectureHighlights: [
      "OpenQASM 3.0 intermediate representation core decouples the web UI from backend simulators.",
      "Kubernetes-backed job manager schedules quantum simulations across containerized workers for fair, efficient resource usage.",
    ],
    lenses: {
      infrastructure: {
        summary:
          "A Kubernetes-backed job manager schedules quantum simulation workloads across containerized workers, behind one framework-agnostic execution core.",
        techFocus: ["Kubernetes", "FastAPI", "OpenQASM"],
      },
      presales: {
        summary:
          "Needed one interface across three incompatible quantum SDKs, so a user's circuit work wasn't locked to a single vendor's toolchain.",
        techFocus: ["Qiskit", "Cirq", "PennyLane", "OpenQASM"],
      },
    },
  },
  {
    slug: "cirq-rag",
    title: "Cirq-RAG Code Assistant",
    subtitle: "Retrieval-Augmented Generation for Cirq Quantum Code Generation",
    category: "Generative AI & RAG",
    domains: ["ai", "quantum"],
    featured: true,
    description: [
      "Multi-agent RAG system that generates executable quantum circuits from natural-language prompts with tiered educational explanations.",
      "Multi-agent pipeline: Designer → Validator (self-correction loop) → Optimizer-Validator loop → Educational agent.",
      "Validation-driven self-repair: on compiler/simulation failures, iteratively patches code and re-validates (bounded retries).",
      "Circuit optimization passes to reduce depth, total gates, and two-qubit gates; every step validated for correctness.",
      "Curated Cirq knowledge base (140+ entries) with embedding-based retrieval and vector indexing.",
      "92% success rate vs 52% single-agent baseline; reported latency/quality trade-offs.",
    ],
    technologies: ["Python", "Cirq", "RAG", "FAISS", "Multi-Agent", "Prompt Engineering"],
    tagline: "Quantum code generation without hallucinations",
    objective:
      "Generate, validate, and optimize executable quantum code reliably without AI hallucinations, achieving production-grade accuracy for quantum circuit synthesis.",
    strategy: [
      "Implemented a multi-agent workflow: Designer → Validator → Optimizer pipeline",
      "Achieved 92% quantum circuit generation success rate",
      "Significant gate-count reductions via AI-driven circuit optimization",
      "PyTorch + FAISS vector search for accurate code retrieval and generation",
    ],
    metrics: [
      { label: "Circuit generation success", value: "92%", baseline: "52%", note: "vs single-agent baseline" },
      { label: "Knowledge base entries", value: "140+" },
    ],
    image: cirqRagDiagram,
    architectureHighlights: [
      "Multi-agent pipeline orchestrates designer, validator, optimizer, and educator agents with explicit hand-off and feedback channels.",
      "FAISS-backed vector store over a curated Cirq knowledge base grounds generation and validation, minimizing hallucinations in produced circuits.",
    ],
    lenses: {
      infrastructure: {
        summary:
          "A multi-agent pipeline runs behind a FAISS-backed vector store, with bounded self-repair retries instead of a single unchecked generation pass.",
        techFocus: ["FAISS", "Multi-Agent"],
        metricFocus: ["Knowledge base entries"],
      },
      presales: {
        summary:
          "Needed quantum code generation reliable enough to trust without a human re-checking every circuit, not just plausible-looking output.",
        techFocus: ["RAG", "FAISS", "Prompt Engineering"],
        metricFocus: ["Circuit generation success"],
      },
    },
  },
  // HPC & GPU
  {
    slug: "q-tensor",
    title: "Parallel Tensor Network Quantum Simulator (Q-Tensor)",
    subtitle: "Hybrid MPI/OpenMP + CUDA Quantum Simulation",
    category: "High-Performance Computing & Quantum",
    domains: ["hpc", "quantum"],
    period: "Academic/Research",
    githubUrl: "https://github.com/Umer-Farooq-CS/Q-Tensor",
    description: [
      "Enhanced quantum circuit simulator with hybrid MPI/OpenMP parallelization and GPU acceleration via CUDA.",
      "Integrated METIS graph partitioning for load balancing; reduced inter-process communication overhead.",
      "Scalable performance for circuits with 20+ qubits; hybrid distributed (MPI) and shared-memory (OpenMP) parallelism.",
      "CUDA acceleration of tensor contractions; optimized memory access and sparse tensor networks.",
    ],
    technologies: ["C++", "CUDA", "OpenMP", "MPI", "METIS", "CMake", "Quantum Computing"],
    lenses: {
      infrastructure: {
        summary:
          "Hybrid MPI/OpenMP distributed workload with CUDA-accelerated tensor contractions and METIS-based partitioning to balance compute across ranks.",
        techFocus: ["MPI", "OpenMP", "CUDA", "METIS"],
      },
      presales: {
        summary:
          "Needed to simulate 20+ qubit circuits within a fixed compute budget, so the design split work across distributed and GPU resources rather than relying on bigger hardware alone.",
        techFocus: ["CUDA", "MPI", "OpenMP"],
      },
    },
  },
  {
    slug: "mnist-gpu",
    title: "MNIST Classification with GPU Acceleration",
    subtitle: "Deep Learning Optimization",
    category: "High-Performance Computing & GPU",
    domains: ["hpc", "ai"],
    githubUrl: "https://github.com/Umer-Farooq-CS/MNIST-Classification",
    image: gpuOptimizationDiagram,
    description: [
      "Neural network for MNIST digit classification across five versions (V1–V5) from serial CPU to highly parallel GPU.",
      "6× faster inference using NVIDIA Tensor Cores with FP16 mixed-precision training.",
      "CUDA optimizations: shared memory, kernel fusion, CUDA streams, Tensor Cores, memory coalescing.",
      "95%+ GPU utilization; 99%+ accuracy maintained; profiled with Nsight Systems and Nsight Compute.",
    ],
    technologies: ["CUDA", "Python", "PyTorch", "Nsight", "Tensor Cores", "FP16 Mixed Precision"],
    lenses: {
      infrastructure: {
        summary:
          "95%+ GPU utilization reached through CUDA streams, kernel fusion, and Tensor Core mixed precision, profiled end-to-end with Nsight Systems and Nsight Compute.",
        techFocus: ["CUDA", "Tensor Cores", "Nsight"],
      },
      presales: {
        summary:
          "Needed inference fast enough for production use without giving up accuracy, so the trade-off was mixed precision and kernel-level tuning rather than a bigger model.",
        techFocus: ["Tensor Cores", "FP16 Mixed Precision"],
      },
    },
  },
  {
    slug: "canny-edge-detector",
    title: "GPU-Accelerated Canny Edge Detection",
    subtitle: "Image Processing Optimization",
    category: "High-Performance Computing & GPU",
    domains: ["hpc"],
    githubUrl: "https://github.com/Umer-Farooq-CS/Canny-Edge-Detector",
    description: [
      "Complete Canny edge detection in CUDA with optimized memory access for high-resolution images.",
      "3.5× speedup over sequential CPU; multi-stage kernels: Gaussian blur, Sobel, non-maximum suppression, hysteresis.",
      "Shared memory tiling, texture memory, coalescing, padding to avoid bank conflicts.",
    ],
    technologies: ["C++", "CUDA", "OpenCV", "Image Processing"],
  },
  {
    slug: "rnn-text-generation",
    title: "Optimized RNN Character-Level Text Generation",
    subtitle: "Shakespeare Text Generation",
    category: "Deep Learning & NLP",
    domains: ["ai", "hpc"],
    githubUrl: "https://github.com/Umer-Farooq-CS/RNN-Character-Level-Text-Generation",
    description: [
      "LSTM-based character-level text generator on Shakespeare's works with PyTorch and GPU optimizations.",
      "55.2% accuracy; 3.5× faster training via AMP; 5.8M parameters, 3 LSTM layers, 512 hidden units.",
      "Mixed precision (FP16), large batch sizes, GPU-held data, temperature-based sampling.",
    ],
    technologies: ["Python", "PyTorch", "CUDA", "LSTM", "NLP"],
  },
  {
    slug: "parallel-graph-text",
    title: "Parallel Graph & Text Analysis",
    subtitle: "Multi-threading with pthreads",
    category: "High-Performance Computing",
    domains: ["hpc", "systems"],
    description: [
      "Multithreaded graph analysis and large-text word frequency analysis using POSIX threads.",
      "Parallel graph algorithms (node/edge counting, connectivity); chunk-based text processing with thread-safe structures.",
      "Near-linear speedup with thread affinity, cache-aware processing, fine-grained locking; profiled with perf.",
    ],
    technologies: ["C++", "pthreads", "perf", "Graph Algorithms"],
    lenses: {
      infrastructure: {
        summary:
          "Near-linear multi-core scaling from thread affinity and cache-aware chunking, verified with perf rather than assumed.",
        techFocus: ["pthreads", "perf"],
      },
      presales: {
        summary:
          "Needed throughput that actually scaled with core count, which meant measuring and fixing lock contention rather than just adding threads.",
        techFocus: ["pthreads"],
      },
    },
  },
  // Generative AI & Deep Learning
  {
    slug: "pixelrnn-cifar10",
    title: "PixelRNN Implementation",
    subtitle: "CIFAR-10 Image Generation",
    category: "Generative AI",
    domains: ["ai"],
    githubUrl: "https://github.com/Umer-Farooq-CS/PixelRNN-Implementation-CIFAR10",
    description: [
      "Pixel Recurrent Neural Networks (PixelRNN) per van den Oord et al.: PixelCNN, Row LSTM, Diagonal BiLSTM.",
      "Masked convolutions (Type A/B); skewing/unskewing for Diagonal BiLSTM; trained on CIFAR-10.",
      "NLL, bits per dimension, visual evaluation; temperature-based sampling.",
    ],
    technologies: ["Python", "TensorFlow", "Keras", "CUDA", "Generative AI"],
  },
  {
    slug: "cnn-cifar10",
    title: "CNN CIFAR-10 Classification with Hyperparameter Optimization",
    subtitle: "Systematic Model Tuning",
    category: "Deep Learning",
    domains: ["ai"],
    githubUrl: "https://github.com/Umer-Farooq-CS/CNN-CIFAR10-Classification-GPU-Optimized",
    description: [
      "88.82% accuracy on CIFAR-10 through systematic tuning (81 combinations: learning rate, batch size, filters, depth).",
      "Optimal: LR=0.0005, Batch=16, Filters=64, 7 layers; mixed precision, XLA, data pipeline optimization.",
      "Training history, confusion matrices, per-class metrics, feature map visualizations.",
    ],
    technologies: ["Python", "TensorFlow", "Keras", "CUDA", "CNN", "Hyperparameter Optimization"],
  },
  {
    slug: "cifar10-suite",
    title: "CIFAR-10 Model Suite (ANN vs CNN vs Hybrid)",
    subtitle: "Config-Driven Training Pipeline",
    category: "Deep Learning",
    domains: ["ai"],
    description: [
      "Compared ANN, CNN, and Hybrid CNN+ANN for CIFAR-10; YAML config per model; modular codebase.",
      "Early stopping, LR scheduling, checkpointing, TensorBoard, reproducibility; GPU mixed-precision and data pipelines.",
    ],
    technologies: ["Python", "TensorFlow/Keras", "YAML", "TensorBoard"],
  },
  {
    slug: "waste-detection-taco",
    title: "Waste Object Detection & Segmentation (TACO)",
    subtitle: "YOLOv8-n + U-Net",
    category: "Computer Vision",
    domains: ["ai"],
    description: [
      "YOLOv8-n for waste detection and custom U-Net for semantic segmentation on TACO dataset.",
      "5 most frequent classes; 2.2× mAP@50 improvement for YOLO; U-Net IoU/Dice evaluation.",
    ],
    technologies: ["Python", "YOLOv8", "U-Net", "Data Augmentation", "Computer Vision"],
  },
  {
    slug: "financial-sentiment-rag",
    title: "Financial Sentiment Analysis & Topic Modeling",
    subtitle: "FinBERT vs Local LLM vs RAG",
    category: "NLP",
    domains: ["ai"],
    description: [
      "Sentiment on Financial PhraseBank (3-class). Compared FinBERT, local Mistral (Ollama), RAG-augmented LLM.",
      "Best: FinBERT 94.73% accuracy; local LLM 86.42%; RAG 54.65% (retrieval/context analyzed). LDA topic modeling (15 topics).",
    ],
    technologies: ["HuggingFace", "Ollama", "Mistral", "FAISS", "scikit-learn"],
  },
  {
    slug: "multimodal-rag-pdf",
    title: "Multimodal RAG for PDF Question Answering",
    subtitle: "Text + Images",
    category: "Generative AI",
    domains: ["ai"],
    description: [
      "End-to-end multimodal RAG for PDFs (text, tables, images): OCR, semantic retrieval, grounded generation.",
      "EasyOCR, Sentence-BERT + CLIP embeddings, FAISS, Ollama; Streamlit chat UI.",
    ],
    technologies: ["Python", "PyMuPDF", "EasyOCR", "Sentence-BERT", "CLIP", "FAISS", "Ollama", "Streamlit"],
  },
  {
    slug: "semantic-product-search",
    title: "Semantic Product Search & Neural Ranking",
    subtitle: "Learning-to-Rank",
    category: "Information Retrieval",
    domains: ["ai"],
    description: [
      "Semantic product search with TF-IDF, Word2Vec, BERT-style embeddings; neural ranking model.",
      "Precision@1: 0.85; NDCG@5: 0.79; F1@10: 0.68; Streamlit UI.",
    ],
    technologies: ["Python", "Embeddings", "NDCG/MAP", "Streamlit"],
  },
  {
    slug: "english-urdu-mbart",
    title: "English-to-Urdu Machine Translation (mBART-large-50)",
    subtitle: "Fine-Tuning + Web Interface",
    category: "NLP",
    domains: ["ai"],
    description: [
      "Fine-tuned mBART-large-50 for En→Urdu on multi-domain corpus (33,020 samples); BLEU 0.302.",
      "Mixed precision, gradient accumulation, pre-tokenization; training reduced to ~1.5–3 hours. Flask interface.",
    ],
    technologies: ["Python", "HuggingFace", "mBART", "Flask", "BLEU/ROUGE/METEOR"],
  },
  {
    slug: "dit-diffusion",
    title: "Diffusion Transformers (DiT) with REG/REPA",
    subtitle: "CIFAR-10 Image Generation",
    category: "Generative AI",
    domains: ["ai"],
    description: [
      "DiT (ViT backbone) with REG/REPA vs U-Net diffusion; FID evaluation; DiT+REG FID 18.7, ~30% faster training.",
    ],
    technologies: ["Python", "Diffusion", "Vision Transformers", "CIFAR-10", "FID"],
  },
  {
    slug: "cyclegan-face-sketch",
    title: "CycleGAN Face↔Sketch Translation",
    subtitle: "Unpaired Image-to-Image",
    category: "Generative AI",
    domains: ["ai"],
    description: [
      "Full CycleGAN for face photos ↔ sketches; Person Face Sketches dataset; cycle-consistency and identity losses; Flask demo.",
    ],
    technologies: ["Python", "CycleGAN", "Flask"],
  },
  // ML & Data Science
  {
    slug: "california-housing-regression",
    title: "California Housing Regression Study",
    subtitle: "Linear Regression vs SGD, CV Protocol",
    category: "Machine Learning",
    domains: ["ai"],
    description: [
      "Five-phase protocol: EDA, single-feature, polynomial multi-feature, train/test, 5-fold CV. Closed-form vs SGDRegressor; MSE, RMSE, MAE, R².",
    ],
    technologies: ["Python", "NumPy", "scikit-learn"],
  },
  // Compiler Design
  {
    slug: "compiler-iu",
    title: "Compiler for Custom Language (IU)",
    subtitle: "Educational Language Implementation",
    category: "Compiler Design",
    domains: ["systems"],
    description: [
      "Full compiler: hajimeru/gulegule delimiters, int/float/string/boolean, custom I/O and control flow.",
      "Lexer, parser, semantic analyzer, code generator; symbol table, error reporting, optimization passes.",
    ],
    technologies: ["C++", "Compiler Design", "Context-Free Grammars"],
  },
  {
    slug: "ll1-parser",
    title: "LL(1) Parser Toolkit",
    subtitle: "Parsing Theory",
    category: "Compiler Design",
    domains: ["systems"],
    githubUrl: "https://github.com/Umer-Farooq-CS/LL1-Parser-Plus",
    description: [
      "FIRST/FOLLOW, LL(1) table construction, predictive parser; grammar validation, left recursion elimination, left factoring; step-by-step demo.",
    ],
    technologies: ["C", "Parsing Theory", "LL(1)"],
  },
  // Distributed Systems
  {
    slug: "ring-dht-ipfs",
    title: "Ring DHT with IPFS Integration",
    subtitle: "Distributed Hash Table",
    category: "Distributed Systems",
    domains: ["systems"],
    description: [
      "DHT with Chord-like ring (160-bit SHA-1); finger table O(log N) routing; IPFS integration; B-Tree local storage; console UI for nodes and file ops; replication and fault tolerance.",
    ],
    technologies: ["C++", "DHT", "SHA-1", "B-Trees", "IPFS"],
    lenses: {
      infrastructure: {
        summary:
          "Chord-style ring topology with O(log N) finger-table routing, replication, and fault tolerance — the operational concerns of running a distributed store, not just the lookup algorithm.",
        techFocus: ["DHT", "IPFS"],
      },
      presales: {
        summary:
          "Needed lookups to keep working as nodes join, leave, or fail, so replication and fault tolerance were requirements from the start, not an afterthought.",
        techFocus: ["IPFS", "DHT"],
      },
    },
  },
  {
    slug: "doodle-dash",
    title: "Doodle Dash",
    subtitle: "Multiplayer Drawing & Guessing Game",
    category: "Distributed Systems & Networking",
    domains: ["systems", "web"],
    description: [
      "Real-time multiplayer game: TCP sockets, multi-threaded server (pthreads), game rooms, stroke sync, turn-based roles, scoring; SFML canvas, custom protocol, delta encoding.",
    ],
    technologies: ["C++", "SFML", "TCP", "pthreads", "Game Development"],
    lenses: {
      infrastructure: {
        summary:
          "A multi-threaded TCP server handles game rooms and stroke sync over a custom, delta-encoded protocol — the networking layer that scales past a single game session.",
        techFocus: ["TCP", "pthreads"],
      },
      presales: {
        summary:
          "Needed multiple concurrent game rooms without one slow client blocking another, hence a multi-threaded server per room rather than a single event loop.",
        techFocus: ["TCP", "pthreads"],
      },
    },
  },
  // Full-Stack
  {
    slug: "asco-services-api",
    title: "ASCO Services API",
    subtitle: ".NET 8 Web API",
    category: "Full-Stack / Backend",
    domains: ["web"],
    description: [
      ".NET 8 Web API: users, organizations, JWT auth, RBAC, clean architecture (repository, service layer, DTOs), BCrypt, Entity Framework Core + PostgreSQL, Swagger.",
    ],
    technologies: [".NET 8", "ASP.NET Core", "EF Core", "PostgreSQL", "JWT", "Swagger", "Docker"],
    lenses: {
      infrastructure: {
        summary:
          "A dockerized .NET 8 Web API with a clean repository/service-layer split, so the deployment unit and the data access stay separable when this moves onto a container platform.",
        techFocus: ["Docker", "PostgreSQL", "EF Core"],
      },
      presales: {
        summary:
          "Needed role-based access and a documented API surface a client team could integrate against, not just working endpoints — RBAC, JWT auth, and Swagger were the answer.",
        techFocus: ["JWT", "Swagger", "ASP.NET Core"],
      },
    },
  },
  {
    slug: "harmoniq",
    title: "Harmoniq",
    subtitle: "Audio Library Explorer",
    category: "Full-Stack",
    domains: ["web"],
    githubUrl: "https://github.com/Umer-Farooq-CS/Harmoniq",
    description: [
      "Full-stack audio platform: Express REST API, playlist management, auth, range-request streaming; React UI, waveform visualization, infinite scroll; PostgreSQL schema, full-text search.",
    ],
    technologies: ["JavaScript", "React", "Node.js", "Express", "PostgreSQL", "HTML5 Audio"],
    lenses: {
      infrastructure: {
        summary:
          "Range-request audio streaming over a REST API backed by PostgreSQL full-text search — the parts of the stack that matter once this runs behind a real CDN or edge layer.",
        techFocus: ["Express", "PostgreSQL"],
      },
      presales: {
        summary:
          "Needed playback that behaves like a real audio product — seek, resume, search — rather than a file download, which drove the choice of range requests and full-text search over a flat file list.",
        techFocus: ["HTML5 Audio", "PostgreSQL"],
      },
    },
  },
  {
    slug: "dj-web-app",
    title: "DJ Web Application",
    subtitle: "Real-Time Music Streaming",
    category: "Full-Stack",
    domains: ["web"],
    description: [
      "MERN stack: React (Vite), Web Audio visualization, drag-drop playlists, mixing controls; Express, WebSockets, MongoDB/GridFS; real-time sync and chat.",
    ],
    technologies: ["React", "Vite", "Node.js", "Express", "MongoDB", "WebSockets", "Web Audio API"],
    lenses: {
      infrastructure: {
        summary:
          "Real-time sync over WebSockets with MongoDB/GridFS for media storage — the state-and-media split that matters once multiple listeners share one session.",
        techFocus: ["WebSockets", "MongoDB"],
      },
      presales: {
        summary:
          "Needed every listener to hear the same mix at the same time, which meant WebSockets carrying playback state, not just chat.",
        techFocus: ["WebSockets"],
      },
    },
  },
  // Desktop
  {
    slug: "student-management-system",
    title: "Student Management System",
    subtitle: "JavaFX Enterprise Application",
    category: "Desktop Applications",
    domains: ["apps"],
    description: [
      "JavaFX: CRUD, courses, attendance, fees, reports; PostgreSQL, JDBC, BCrypt auth, RBAC; client-server TCP, multi-threaded server, custom protocol.",
    ],
    technologies: ["Java", "JavaFX", "PostgreSQL", "JDBC", "TCP", "MVC"],
  },
  {
    slug: "torrent-management-system",
    title: "Torrent Management System",
    subtitle: "JavaFX & P2P Networking",
    category: "Desktop Applications",
    domains: ["apps", "systems"],
    description: [
      "Torrent client: file parsing, queue, multi-threaded download, upload/seeding, resume; P2P protocol, piece selection; JavaFX UI, speed/peer list, file tree.",
    ],
    technologies: ["Java", "JavaFX", "TCP", "P2P", "Multi-threading"],
  },
  {
    slug: "dotnet-desktop-apps",
    title: ".NET Desktop Applications",
    subtitle: "Enterprise Applications",
    category: "Desktop Applications",
    domains: ["apps"],
    description: [
      "Multiple .NET (C#, Windows Forms, WPF) apps; MVC/MVVM, PostgreSQL, ADO.NET/EF; 100+ concurrent users.",
    ],
    technologies: ["C#", ".NET", "WPF", "Entity Framework", "PostgreSQL", "MVC", "MVVM"],
  },
  // Game Development
  {
    slug: "pacman-ghost-ai",
    title: "Pac-Man with Multi-threaded Ghost AI",
    subtitle: "C++ & SFML",
    category: "Game Development",
    domains: ["apps"],
    description: [
      "Pac-Man clone: multi-threaded ghost AI (pthreads), A* pathfinding, Blinky/Pinky/Inky/Clyde behaviors; SFML graphics, HUD, 60+ FPS.",
    ],
    technologies: ["C++", "SFML", "pthreads", "A*", "Game AI"],
  },
  {
    slug: "2d-game-suite",
    title: "2D Game Suite",
    subtitle: "Snake, Tetris, RPG Prototype",
    category: "Game Development",
    domains: ["apps"],
    description: [
      "Snake, Tetris, RPG prototype in C++/SFML/SDL2; OOP, MVC; 30%+ performance improvements, custom physics, collision, rendering optimizations.",
    ],
    technologies: ["C++", "SFML", "SDL2", "OOP", "MVC"],
  },
];

/** Derived, not hand-maintained — a new category label can never be left out. */
export const PROJECT_CATEGORIES: string[] = [...new Set(PROJECTS.map((p) => p.category))].sort();

export function getProjectBySlug(slug: string): ProjectItem | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

export function getFeaturedProjects(): ProjectItem[] {
  return PROJECTS.filter((p) => p.featured);
}

export function getProjectsByCategory(): Record<string, ProjectItem[]> {
  const byCat: Record<string, ProjectItem[]> = {};
  for (const p of PROJECTS) {
    if (!byCat[p.category]) byCat[p.category] = [];
    byCat[p.category].push(p);
  }
  return byCat;
}

/**
 * Groups every project under its primary domain, in taxonomy order. Iterating the
 * taxonomy (not a separate ordering array) is what guarantees full coverage.
 */
export function getProjectsByDomain(): { domain: Domain; projects: ProjectItem[] }[] {
  return DOMAIN_IDS.map((domain) => ({
    domain,
    projects: PROJECTS.filter((p) => p.domains[0] === domain),
  })).filter((group) => group.projects.length > 0);
}

/** All projects that touch a domain, primary or not — used by the filter facets. */
export function getProjectsInDomain(domain: Domain): ProjectItem[] {
  return PROJECTS.filter((p) => p.domains.includes(domain));
}

/** Every technology tag with its usage count, most-used first. Powers tag facets. */
export function getTechnologyFacets(): { tech: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const project of PROJECTS) {
    for (const tech of project.technologies) {
      counts.set(tech, (counts.get(tech) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tech, count]) => ({ tech, count }))
    .sort((a, b) => b.count - a.count || a.tech.localeCompare(b.tech));
}

/**
 * How a project reads under a given profile — falling back to the shared
 * fields when no lens override is authored, so an unauthored lens degrades to
 * the same facts under a plainer label rather than showing nothing.
 */
export function getProjectLensView(project: ProjectItem, profileId: ProfileId): ProjectLensView {
  const lens = project.lenses?.[profileId];
  return {
    summary: lens?.summary ?? project.tagline ?? project.subtitle,
    techFocus: lens?.techFocus ?? project.technologies,
    metricFocus: lens?.metricFocus ?? project.metrics?.map((m) => m.label),
    sections: lens?.sections,
  };
}

/** The label a profile wants for a section whose rendering stays fixed (brief, metrics). */
export function detailLabel(profile: ProfileConfig, source: DetailSectionSource, fallback: string): string {
  return profile.detailTemplate.find((section) => section.source === source)?.label ?? fallback;
}

export interface ResolvedDetailSection {
  key: string;
  label: string;
  kind: "list" | "orderedList" | "highlights" | "techChips";
  content: string[];
}

/**
 * The generic, reorderable detail-page sections for a project under a
 * profile — everything except "objective" and "metrics", which keep their
 * own fixed, bespoke rendering in ProjectDetailPage (a highlighted lead
 * paragraph and a measurement grid, not a simple list) and are looked up via
 * detailLabel() instead. A project's authored `lenses[x].sections`, if any,
 * are returned verbatim in their authored order; otherwise this maps the
 * profile's template over the shared fields, in the order that profile lists
 * them, dropping any section whose source field is empty.
 */
export function resolveDetailSections(project: ProjectItem, profile: ProfileConfig): ResolvedDetailSection[] {
  const authored = project.lenses?.[profile.id]?.sections;
  if (authored && authored.length > 0) {
    return authored.map((section) => ({
      key: section.key,
      label: section.label,
      kind: "list",
      content: section.points,
    }));
  }

  const sections: ResolvedDetailSection[] = [];
  for (const template of profile.detailTemplate) {
    switch (template.source) {
      case "description": {
        const points = project.objective ? project.description : project.description.slice(1);
        if (points.length > 0) {
          sections.push({ key: "description", label: template.label, kind: "list", content: points });
        }
        break;
      }
      case "strategy":
        if (project.strategy && project.strategy.length > 0) {
          sections.push({ key: "strategy", label: template.label, kind: "orderedList", content: project.strategy });
        }
        break;
      case "architectureHighlights":
        if (project.architectureHighlights && project.architectureHighlights.length > 0) {
          sections.push({
            key: "architectureHighlights",
            label: template.label,
            kind: "highlights",
            content: project.architectureHighlights,
          });
        }
        break;
      case "technologies":
        if (project.technologies.length > 0) {
          sections.push({ key: "technologies", label: template.label, kind: "techChips", content: project.technologies });
        }
        break;
      // "objective" and "metrics" are rendered directly by ProjectDetailPage via detailLabel().
      case "objective":
      case "metrics":
        break;
    }
  }
  return sections;
}

/** Previous/next in display order, for project-page navigation. Wraps around. */
export function getAdjacentProjects(slug: string): {
  prev: ProjectItem | undefined;
  next: ProjectItem | undefined;
} {
  const ordered = getProjectsByDomain().flatMap((group) => group.projects);
  const index = ordered.findIndex((p) => p.slug === slug);
  if (index === -1) return { prev: undefined, next: undefined };
  return {
    prev: ordered[(index - 1 + ordered.length) % ordered.length],
    next: ordered[(index + 1) % ordered.length],
  };
}
