import { motion } from "framer-motion";
import { Gauge, Atom, BrainCircuit, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

// Order: 1 HPC, 2 Quantum, 3 AI
const detailedServices = [
  {
    icon: Gauge,
    accent: "blue",
    title: "HPC Optimization",
    subtitle: "High-Performance Computing",
    summary:
      "End-to-end performance engineering for compute-heavy systems, from CUDA kernels and data pipelines to profiling and tuning.",
    scenarios: [
      "You have GPU-capable hardware but your workloads are still CPU-bound or under-utilizing devices.",
      "Training or simulation jobs take hours or days and need to be reduced to minutes.",
      "You need a clear performance baseline and optimization roadmap for a critical system.",
    ],
    outcomes: [
      "Optimized CUDA kernels (memory access, shared memory, streams, Tensor Cores).",
      "Multi-threaded and distributed variants using OpenMP and MPI where appropriate.",
      "Profiling reports with concrete bottleneck analysis and before/after metrics.",
    ],
    keywords: ["CUDA", "Tensor Cores", "OpenMP", "MPI", "Nsight profiling"],
  },
  {
    icon: Atom,
    accent: "cyan",
    title: "Quantum Simulation & Platforms",
    subtitle: "Quantum Computing",
    summary:
      "Quantum circuit simulation, multi-framework tooling, and web-based platforms for research and education—Qiskit, Cirq, PennyLane, OpenQASM.",
    scenarios: [
      "You need a unified platform to run or compare circuits across multiple quantum frameworks.",
      "You want to bring quantum simulation to the browser or to non-expert users.",
      "You are building hybrid classical–quantum pipelines or teaching materials.",
    ],
    outcomes: [
      "Multi-framework support and circuit conversion (e.g. Cirq ↔ Qiskit ↔ PennyLane).",
      "Real-time simulation and visualization for circuits and states.",
      "Scalable, vendor-neutral tooling with extensible backends.",
    ],
    keywords: ["Qiskit", "Cirq", "PennyLane", "OpenQASM", "Quantum simulation"],
  },
  {
    icon: BrainCircuit,
    accent: "violet",
    title: "Agentic AI & RAG Systems",
    subtitle: "AI Pipeline Development",
    summary:
      "Designing reliable multi-agent pipelines and retrieval-augmented generation systems that prioritize correctness over one-shot answers.",
    scenarios: [
      "You need an AI assistant that can read your docs/codebase and answer with citations.",
      "You want to automate a complex reasoning workflow with validation and self-repair.",
      "You are hitting hallucination issues in production and need safety mechanisms.",
    ],
    outcomes: [
      "Task-specific multi-agent architectures (designer, validator, optimizer, educator).",
      "Document indexing and retrieval pipelines with embeddings and vector search.",
      "Evaluation harnesses using ranking/IR metrics (NDCG, MAP) and quality dashboards.",
    ],
    keywords: ["RAG", "Multi-agent", "PyTorch", "FAISS", "LLMs"],
  },
];

const accentCard: Record<string, string> = {
  blue: "from-blue-500/20 to-blue-600/5 border-blue-500/25 hover:border-blue-500/50",
  violet: "from-violet-500/20 to-violet-600/5 border-violet-500/25 hover:border-violet-500/50",
  cyan: "from-cyan-500/20 to-cyan-600/5 border-cyan-500/25 hover:border-cyan-500/50",
};

const accentIcon: Record<string, string> = {
  blue: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  violet: "bg-violet-500/15 text-violet-400 border-violet-500/25",
  cyan: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
};

export default function ServicesPage() {
  return (
    <div className="pt-24 lg:pt-28 pb-16">
      <div className="container px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-14"
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-widest">
            Services
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
            How I Help <span className="text-gradient">Teams Ship Faster</span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            HPC and GPU first, quantum simulation and platforms second, AI and RAG third—turning demanding
            infrastructure and research ideas into well-architected, measurable systems.
          </p>
        </motion.div>

        {/* Services grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {detailedServices.map(
            ({ icon: Icon, accent, title, subtitle, summary, scenarios, outcomes, keywords }, i) => (
              <motion.article
                key={title}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`group rounded-2xl border bg-gradient-to-b p-6 sm:p-7 transition-all duration-300 hover:shadow-elevated ${accentCard[accent]}`}
              >
                {/* Icon + title */}
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 ${accentIcon[accent]}`}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      {subtitle}
                    </p>
                    <h2 className="text-base sm:text-lg font-bold text-foreground">{title}</h2>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{summary}</p>

                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-[11px] font-semibold text-primary uppercase tracking-wide mb-1.5">
                      When this is a good fit
                    </p>
                    <ul className="space-y-1.5">
                      {scenarios.map((s) => (
                        <li
                          key={s}
                          className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed"
                        >
                          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-primary uppercase tracking-wide mb-1.5">
                      What you get
                    </p>
                    <ul className="space-y-1.5">
                      {outcomes.map((o) => (
                        <li
                          key={o}
                          className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed"
                        >
                          <CheckCircle2 size={12} className="mt-0.5 text-primary flex-shrink-0" />
                          {o}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {keywords.map((k) => (
                    <span
                      key={k}
                      className="px-2 py-0.5 rounded-md bg-card/80 border border-border text-[11px] font-mono text-muted-foreground"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </motion.article>
            ),
          )}
        </div>

        {/* CTA back to contact */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <p className="text-xs sm:text-sm text-muted-foreground mb-3">
            Have a specific HPC, AI, or infrastructure challenge in mind?
          </p>
          <Link
            to="/#contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card text-sm font-semibold text-foreground hover:border-primary hover:text-primary transition-colors"
          >
            Discuss a potential project
            <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

