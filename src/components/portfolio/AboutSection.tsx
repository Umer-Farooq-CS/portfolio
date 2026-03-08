import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { Server, GitBranch, Brain, MapPin, Code2, Award, ArrowRight } from "lucide-react";
import { CERTIFICATIONS } from "@/data/profile";

const strengths = [
  {
    icon: GitBranch,
    title: "Parallel & Distributed Computing",
    tags: ["MPI", "OpenMP", "Kubernetes"],
    description: "Designing scalable, fault-tolerant distributed systems that harness multi-node parallelism.",
  },
  {
    icon: Server,
    title: "GPU & Accelerated Computing",
    tags: ["CUDA", "Tensor Cores", "Profiling"],
    description: "Optimizing compute-heavy workloads on GPU architectures for maximum throughput and efficiency.",
  },
  {
    icon: Brain,
    title: "Agentic AI & ML Frameworks",
    tags: ["PyTorch", "RAG Pipelines", "FAISS"],
    description: "Building multi-agent AI systems with robust validation and hallucination-free outputs.",
  },
];

const stats = [
  { value: "92%", label: "RAG Success Rate" },
  { value: "3rd", label: "Huawei ICT Finals" },
  { value: "2+", label: "HPC Projects" },
  { value: "∞", label: "Curiosity" },
];

export default function AboutSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const highlightedCerts = CERTIFICATIONS.slice(0, 2);

  return (
    <section id="about" className="py-24 lg:py-32 relative">
      <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
      <div className="container px-4 sm:px-6 lg:px-8 relative z-10" ref={ref}>
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-widest">About Me</span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
            Who I <span className="text-gradient">Am</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: profile + stats */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            {/* Profile card */}
            <div className="card-surface shadow-card border border-border rounded-2xl p-8 mb-8">
              <div className="flex items-start gap-5 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-accent flex items-center justify-center shadow-glow flex-shrink-0">
                  <Code2 size={28} className="text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Umer Farooq</h3>
                  <div className="flex items-center gap-1.5 mt-1 text-muted-foreground text-sm">
                    <MapPin size={13} />
                    <span>Islamabad, Pakistan</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                      HPC Engineer
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400 text-xs font-semibold border border-violet-500/20">
                      AI Researcher
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed text-sm">
                I am an HPC enthusiast and Software Engineer based in Islamabad, Pakistan. I specialize in{" "}
                <span className="text-foreground font-medium">GPU acceleration</span>, parallel and distributed computing, and{" "}
                <span className="text-foreground font-medium">multi-agent AI architectures</span>. My passion lies in solving compute-intensive problems through innovative infrastructure design.
              </p>

              {/* Compact certifications preview */}
              {highlightedCerts.length > 0 && (
                <div className="mt-4 border-t border-border/60 pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Award size={14} className="text-primary" />
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">
                      Recent Certifications
                    </p>
                  </div>
                  <ul className="space-y-1.5">
                    {highlightedCerts.map((cert) => (
                      <li key={cert.title} className="text-[11px] text-muted-foreground leading-snug">
                        <span className="font-semibold text-foreground">{cert.year}</span> · {cert.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map(({ value, label }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                  className="card-surface border border-border rounded-xl p-5 text-center hover:border-primary/50 hover:shadow-card transition-all duration-300"
                >
                  <div className="text-2xl font-black text-gradient mb-1">{value}</div>
                  <div className="text-xs text-muted-foreground font-medium">{label}</div>
                </motion.div>
              ))}
            </div>

            {/* More details CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="mt-6"
            >
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-primary hover:underline"
              >
                More about my background
                <ArrowRight size={14} />
              </Link>
            </motion.div>
          </motion.div>

          {/* Right: strengths */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-col gap-5"
          >
            <h3 className="text-lg font-bold text-foreground mb-2">Key Strengths</h3>
            {strengths.map(({ icon: Icon, title, tags, description }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.12 }}
                className="group card-surface border border-border rounded-2xl p-6 hover:border-primary/50 hover:shadow-elevated transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors duration-200">
                    <Icon size={18} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground mb-1">{title}</h4>
                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{description}</p>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span key={tag} className="px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-mono font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
