import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { ExternalLink, Trophy, GitBranch, Cpu, Layers, CheckCircle2, ArrowRight } from "lucide-react";

const projects = [
  {
    id: "01",
    slug: "qcanvas",
    title: "QCanvas",
    subtitle: "Unified Quantum Simulator Platform",
    icon: Layers,
    accent: "blue",
    award: {
      show: true,
      text: "3rd Prize · Huawei ICT Competition National Finals (UniQ Team)",
    },
    objective:
      "Eliminate vendor lock-in by providing a unified platform where users can write and execute quantum circuits across multiple frameworks seamlessly.",
    strategy: [
      "Developed an OpenQASM 3.0 Intermediate Representation core for framework-agnostic circuit execution",
      "Built a Kubernetes-based Job Manager for distributed resource allocation",
      "Implemented priority scheduling for fair, efficient workload distribution",
      "Abstraction layer enabling cross-framework portability without code rewrites",
    ],
    tags: ["OpenQASM 3.0", "Kubernetes", "Job Scheduler", "Quantum Computing", "Distributed Systems"],
    color: "blue",
  },
  {
    id: "02",
    slug: "cirq-rag",
    title: "Cirq-RAG Code Assistant",
    subtitle: "Quantum Code Generation Without Hallucinations",
    icon: Cpu,
    accent: "violet",
    award: { show: false, text: "" },
    objective:
      "Generate, validate, and optimize executable quantum code reliably without AI hallucinations, achieving production-grade accuracy for quantum circuit synthesis.",
    strategy: [
      "Implemented a multi-agent workflow: Designer → Validator → Optimizer pipeline",
      "Achieved 92% quantum circuit generation success rate",
      "Significant gate-count reductions via AI-driven circuit optimization",
      "PyTorch + FAISS vector search for accurate code retrieval and generation",
    ],
    tags: ["PyTorch", "FAISS", "Multi-Agent", "RAG", "Cirq", "LLM"],
    color: "violet",
  },
];

const accentMap: Record<string, { border: string; iconBg: string; tagBg: string; badge: string }> = {
  blue: {
    border: "border-blue-500/25 hover:border-blue-500/50",
    iconBg: "bg-blue-500/15 text-blue-400 border-blue-500/25",
    tagBg: "bg-blue-500/10 text-blue-400",
    badge: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  },
  violet: {
    border: "border-violet-500/25 hover:border-violet-500/50",
    iconBg: "bg-violet-500/15 text-violet-400 border-violet-500/25",
    tagBg: "bg-violet-500/10 text-violet-400",
    badge: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  },
};

export default function ProjectsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="projects" className="py-24 lg:py-32 relative">
      <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
      <div className="container px-4 sm:px-6 lg:px-8 relative z-10" ref={ref}>
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-widest">Portfolio</span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
            Featured <span className="text-gradient">Projects</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-base">
            Real-world systems built with cutting-edge HPC and AI technologies.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {projects.map(({ id, slug, title, subtitle, icon: Icon, accent, award, objective, strategy, tags }, i) => {
            const styles = accentMap[accent];
            return (
              <motion.article
                key={title}
                initial={{ opacity: 0, y: 32 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.18 }}
                className={`group card-surface border rounded-2xl p-8 transition-all duration-300 hover:shadow-elevated ${styles.border}`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${styles.iconBg}`}>
                      <Icon size={22} />
                    </div>
                    <div>
                      <span className="text-xs font-mono text-muted-foreground">Project {id}</span>
                      <h3 className="text-xl font-black text-foreground">{title}</h3>
                      <p className="text-sm text-muted-foreground">{subtitle}</p>
                    </div>
                  </div>
                  <Link
                    to={`/projects/${slug}`}
                    className="text-muted-foreground hover:text-primary transition-colors mt-1 flex-shrink-0"
                    aria-label={`View ${title} details`}
                  >
                    <ExternalLink size={16} />
                  </Link>
                </div>

                {/* Award badge */}
                {award.show && (
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold mb-5 ${styles.badge}`}>
                    <Trophy size={13} />
                    {award.text}
                  </div>
                )}

                {/* Objective */}
                <div className="mb-5">
                  <h4 className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Objective</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{objective}</p>
                </div>

                {/* Strategy */}
                <div className="mb-6">
                  <div className="flex items-center gap-1.5 mb-3">
                    <GitBranch size={13} className="text-primary" />
                    <h4 className="text-xs font-semibold text-primary uppercase tracking-widest">Strategy</h4>
                  </div>
                  <ul className="flex flex-col gap-2">
                    {strategy.map((s, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 size={13} className="text-primary flex-shrink-0 mt-0.5" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
                  {tags.map((tag) => (
                    <span key={tag} className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium ${styles.tagBg}`}>
                      {tag}
                    </span>
                  ))}
                </div>

                {/* More details CTA */}
                <div className="mt-6">
                  <Link
                    to={`/projects/${slug}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                  >
                    More details
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
