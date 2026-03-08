import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Github, ArrowRight, FolderGit2, Trophy } from "lucide-react";
import { getProjectsByCategory } from "@/data/projects";

const categoryOrder: string[] = [
  "High-Performance Computing & Quantum",
  "High-Performance Computing & GPU",
  "Generative AI & RAG",
  "Generative AI",
  "Deep Learning",
  "Computer Vision",
  "NLP",
  "Information Retrieval",
  "Machine Learning",
  "Compiler Design",
  "Distributed Systems",
  "Distributed Systems & Networking",
  "Full-Stack",
  "Full-Stack / Backend",
  "Desktop Applications",
  "Game Development",
];

export default function ProjectsPage() {
  const byCategory = getProjectsByCategory();
  const orderedCategories = categoryOrder.filter((c) => byCategory[c]?.length);

  return (
    <div className="pt-24 lg:pt-28 pb-16">
      <div className="container px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-widest">Portfolio</span>
          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
            All <span className="text-gradient">Projects</span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-base">
            Technical projects across HPC, quantum computing, AI/ML, compilers, distributed systems, and full-stack development.
          </p>
        </motion.div>

        {/* Projects by category */}
        <div className="space-y-14">
          {orderedCategories.map((category, catIndex) => (
            <motion.section
              key={category}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: catIndex * 0.05 }}
            >
              <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                <FolderGit2 size={20} className="text-primary" />
                {category}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {byCategory[category].map((project, i) => (
                  <Link
                    key={project.slug}
                    to={`/projects/${project.slug}`}
                    className="group block"
                  >
                    <motion.article
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: catIndex * 0.05 + i * 0.03 }}
                      className="h-full card-surface border border-border rounded-xl p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-card"
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {project.title}
                        </h3>
                        <ArrowRight
                          size={16}
                          className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {project.subtitle}
                      </p>
                      {project.award && (
                        <div className="flex items-center gap-1.5 text-xs text-primary font-medium mb-3">
                          <Trophy size={12} />
                          {project.award}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        {project.technologies.slice(0, 4).map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded-md bg-muted/80 text-muted-foreground text-xs font-mono"
                          >
                            {t}
                          </span>
                        ))}
                        {project.technologies.length > 4 && (
                          <span className="text-xs text-muted-foreground">+{project.technologies.length - 4}</span>
                        )}
                      </div>
                      {project.githubUrl && (
                        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Github size={12} />
                          <span>View on GitHub</span>
                        </div>
                      )}
                    </motion.article>
                  </Link>
                ))}
              </div>
            </motion.section>
          ))}
        </div>
      </div>
    </div>
  );
}
