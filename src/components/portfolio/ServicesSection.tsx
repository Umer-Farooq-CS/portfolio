import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { Gauge, BrainCircuit, Cloud, CheckCircle2, TrendingUp, ArrowRight } from "lucide-react";

const services = [
  {
    icon: Gauge,
    accent: "blue",
    title: "HPC Optimization",
    subtitle: "High-Performance Computing",
    description:
      "Accelerating computational workloads using GPU optimization (CUDA) and parallel processing techniques tailored for your infrastructure.",
    benefits: [
      "Reduces infrastructure & operational costs",
      "Dramatically speeds up data processing",
      "Optimized CUDA kernel development",
      "Simulation time reduction for compute-heavy apps",
    ],
    tags: ["CUDA", "OpenMP", "MPI", "GPU Profiling"],
  },
  {
    icon: BrainCircuit,
    accent: "violet",
    title: "Agentic AI & RAG Systems",
    subtitle: "AI Pipeline Development",
    description:
      "Designing robust, multi-agent AI pipelines and tool-augmented workflows that automate complex reasoning with validated, reliable outputs.",
    benefits: [
      "Automates complex enterprise reasoning tasks",
      "92%+ validated AI output success rate",
      "Eliminates AI hallucinations in production",
      "Scalable multi-agent orchestration",
    ],
    tags: ["PyTorch", "FAISS", "RAG", "LLM Agents"],
  },
  {
    icon: Cloud,
    accent: "cyan",
    title: "Cloud-Native Infrastructure",
    subtitle: "Job Orchestration & DevOps",
    description:
      "Building scalable backend platforms using Kubernetes, Docker, and customized job managers for fault-tolerant, predictable deployments.",
    benefits: [
      "Eliminates vendor lock-in completely",
      "Fault-tolerant resource allocation",
      "Priority scheduling for large-scale tasks",
      "Cost-predictable cloud deployments",
    ],
    tags: ["Kubernetes", "Docker", "Job Scheduler", "OpenQASM"],
  },
];

const accentMap: Record<string, string> = {
  blue: "from-blue-500/20 to-blue-600/5 border-blue-500/25 hover:border-blue-500/50",
  violet: "from-violet-500/20 to-violet-600/5 border-violet-500/25 hover:border-violet-500/50",
  cyan: "from-cyan-500/20 to-cyan-600/5 border-cyan-500/25 hover:border-cyan-500/50",
};

const iconAccentMap: Record<string, string> = {
  blue: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  violet: "bg-violet-500/15 text-violet-400 border-violet-500/25",
  cyan: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
};

const tagAccentMap: Record<string, string> = {
  blue: "bg-blue-500/10 text-blue-400",
  violet: "bg-violet-500/10 text-violet-400",
  cyan: "bg-cyan-500/10 text-cyan-400",
};

export default function ServicesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="services" className="py-24 lg:py-32 bg-muted/30 relative">
      <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
      <div className="container px-4 sm:px-6 lg:px-8 relative z-10" ref={ref}>
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-widest">Services</span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
            How I Help Your <span className="text-gradient">Business</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-base">
            Specialized technical services designed to accelerate your infrastructure and AI capabilities.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map(({ icon: Icon, accent, title, subtitle, description, benefits, tags }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className={`group relative rounded-2xl border bg-gradient-to-b p-7 transition-all duration-300 hover:shadow-elevated ${accentMap[accent]}`}
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 ${iconAccentMap[accent]}`}>
                <Icon size={22} />
              </div>

              {/* Title */}
              <div className="mb-4">
                <span className={`text-xs font-semibold uppercase tracking-wider ${tagAccentMap[accent].split(" ")[1]}`}>
                  {subtitle}
                </span>
                <h3 className="mt-1.5 text-xl font-bold text-foreground">{title}</h3>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">{description}</p>

              {/* Business Value */}
              <div className="mb-5">
                <div className="flex items-center gap-1.5 mb-3">
                  <TrendingUp size={13} className="text-primary" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide">Business Value</span>
                </div>
                <ul className="flex flex-col gap-2">
                  {benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 size={13} className="text-primary flex-shrink-0 mt-0.5" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-4 border-t border-border/50">
                {tags.map((tag) => (
                  <span key={tag} className={`px-2 py-0.5 rounded-md text-xs font-mono font-medium ${tagAccentMap[accent]}`}>
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* More details CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mt-10 text-center"
        >
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-primary hover:underline"
          >
            View detailed services
            <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
