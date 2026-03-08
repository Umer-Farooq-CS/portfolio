import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Cpu, Atom, Network } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const floatingBadges = [
  { icon: Cpu, label: "HPC / GPU", delay: 0 },
  { icon: Atom, label: "Quantum Simulation", delay: 0.3 },
  { icon: Network, label: "AI & RAG", delay: 0.6 },
];

export default function HeroSection() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt="HPC AI Architecture"
          className="w-full h-full object-cover opacity-20 dark:opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
        <div className="absolute inset-0 grid-pattern opacity-50" />
      </div>

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none animate-float" />
      <div className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full bg-violet-500/8 blur-3xl pointer-events-none" style={{ animationDelay: "1.5s" }} />

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Open to Opportunities · Islamabad, Pakistan
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-tight mb-6"
          >
            Aspiring{" "}
            <span className="text-gradient">HPC & Quantum</span>
            <br />
            Infrastructure Engineer
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            High-performance and GPU computing first, quantum simulation and circuit systems second, and AI-augmented workflows third—building{" "}
            <span className="text-foreground font-medium">scalable, accelerated infrastructure</span>.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Link
              to="/projects"
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-accent text-primary-foreground font-semibold text-sm shadow-elevated hover:shadow-glow transition-all duration-300 hover:scale-105"
            >
              View My Projects
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            <button
              onClick={() => scrollTo("contact")}
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl border border-border bg-card/60 backdrop-blur-sm text-foreground font-semibold text-sm hover:border-primary hover:bg-muted transition-all duration-300 hover:scale-105"
            >
              Contact Me
            </button>
          </motion.div>

          {/* Floating tech badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {floatingBadges.map(({ icon: Icon, label, delay }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.6 + delay }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/70 backdrop-blur border border-border text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors duration-200 cursor-default"
              >
                <Icon size={14} className="text-primary" />
                {label}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        onClick={() => scrollTo("about")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
      >
        <span className="text-xs font-medium tracking-widest uppercase">Scroll</span>
        <ChevronDown size={18} className="animate-bounce" />
      </motion.button>
    </section>
  );
}
