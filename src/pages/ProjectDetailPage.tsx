import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Github, ExternalLink, Calendar, FolderGit2, Trophy, Network } from "lucide-react";
import { getProjectBySlug } from "@/data/projects";
import NotFound from "./NotFound";

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const project = slug ? getProjectBySlug(slug) : undefined;

  if (!project) {
    return <NotFound />;
  }

  return (
    <div className="pt-24 lg:pt-28 pb-16">
      <div className="container px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft size={16} />
            All projects
          </Link>
        </motion.div>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-2">
            {project.category}
          </p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-2">
            {project.title}
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            {project.subtitle}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {project.period && (
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                {project.period}
              </span>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-primary hover:underline"
              >
                <Github size={14} />
                View on GitHub
              </a>
            )}
            {project.externalUrl && (
              <a
                href={project.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-primary hover:underline"
              >
                <ExternalLink size={14} />
                External link
              </a>
            )}
          </div>
          {project.award && (
            <div className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm font-medium w-fit">
              <Trophy size={16} />
              {project.award}
            </div>
          )}
        </motion.header>

        {/* Diagram / hero image */}
        {project.image && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="mb-10"
          >
            <div className="relative rounded-2xl overflow-hidden border border-border/70 bg-card">
              <img
                src={project.image}
                alt={`${project.title} architecture diagram`}
                className="w-full h-full object-contain bg-gradient-to-br from-background via-background to-muted"
              />
            </div>
          </motion.div>
        )}

        {/* Description */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-10"
        >
          <h2 className="text-sm font-semibold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
            <FolderGit2 size={14} />
            Overview
          </h2>
          <ul className="space-y-3">
            {project.description.map((point) => (
              <li
                key={point.slice(0, 40)}
                className="flex items-start gap-3 text-muted-foreground leading-relaxed"
              >
                <span className="text-primary mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        </motion.section>

        {/* Key architecture */}
        {project.architectureHighlights && project.architectureHighlights.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
            className="mb-10"
          >
            <h2 className="text-sm font-semibold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
              <Network size={14} />
              Key Architecture
            </h2>
            <ul className="space-y-3">
              {project.architectureHighlights.map((point) => (
                <li
                  key={point.slice(0, 40)}
                  className="flex items-start gap-3 text-muted-foreground leading-relaxed"
                >
                  <span className="text-primary mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </motion.section>
        )}

        {/* Technologies */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <h2 className="text-sm font-semibold text-primary uppercase tracking-widest mb-4">
            Technologies
          </h2>
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="px-3 py-1.5 rounded-lg bg-muted/80 text-foreground text-sm font-mono border border-border"
              >
                {tech}
              </span>
            ))}
          </div>
        </motion.section>

        {/* CTA back to projects */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-12 pt-8 border-t border-border"
        >
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card hover:border-primary hover:bg-muted/50 text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            Back to all projects
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
