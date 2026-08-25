import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowUpRight, ExternalLink, Github, Trophy } from "lucide-react";
import { getDomain } from "@/data/taxonomy";
import { getProjectLensView, type ProjectItem } from "@/data/projects";
import type { ProfileConfig } from "@/data/profiles";
import { accent } from "@/lib/accent";
import { useMotionPolicy } from "@/lib/motion-policy";
import { TextAction } from "@/components/kit/Primitives";
import { TechnologyChip } from "@/components/technology/TechnologyMark";

/**
 * One project, two layouts, always the same underlying facts. `variant`
 * picks the layout; the active `profile` picks which subset of the project's
 * real technologies/summary lead — via getProjectLensView, so an unauthored
 * lens degrades to the shared fields rather than showing nothing.
 */
interface ProjectCardProps {
  project: ProjectItem;
  profile: ProfileConfig;
  /** Leading URL segment for this profile, e.g. "/infrastructure" — "" for the legacy bare routes. */
  basePath: string;
  variant: "grid" | "row";
  /** Grid-variant entrance delay, in seconds — the caller computes its own stagger; ignored by "row". */
  animationDelay?: number;
}

export default function ProjectCard({ project, profile, basePath, variant, animationDelay = 0 }: ProjectCardProps) {
  const { enabled, duration } = useMotionPolicy();
  const domain = getDomain(project.domains[0]);
  const tone = accent(domain.accent);
  const lens = getProjectLensView(project, profile.id);
  const href = `${basePath}/projects/${project.slug}`;

  const limit = variant === "grid" ? profile.projectCardTechLimit.grid : profile.projectCardTechLimit.row;
  const techs = (lens.techFocus ?? project.technologies).slice(0, limit);
  const techOverflow = (lens.techFocus ?? project.technologies).length - techs.length;

  if (variant === "row") {
    // The row card is roomy enough for two lines: the short lead (unaffected
    // by lens) plus a second line of detail — an authored lens summary where
    // one exists, else the shared `objective`, exactly what this row showed
    // before any lens existed.
    const detailLine = project.lenses?.[profile.id]?.summary ?? project.objective;
    return (
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-sm border px-1.5 py-0.5 font-mono text-2xs uppercase tracking-wider ${tone.chip}`}>
            {domain.label}
          </span>
          {project.period && (
            <span className="readout text-2xs text-muted-foreground">{project.period}</span>
          )}
        </div>

        <h3 className="mt-4 text-2xl text-foreground">
          <Link
            to={href}
            className={`inline-flex items-baseline gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${tone.value}`}
          >
            {project.title}
            <ArrowUpRight size={16} className={`shrink-0 ${tone.value}`} aria-hidden="true" />
          </Link>
        </h3>

        <p className="mt-2 text-base text-muted-foreground">{project.tagline ?? project.subtitle}</p>

        {detailLine && (
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">{detailLine}</p>
        )}

        {project.award && (
          <p className="mt-5 inline-flex items-start gap-2 text-xs text-award-type">
            <Trophy size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
            {project.award}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-1.5">
          {techs.map((tech) => (
            <TechnologyChip key={tech} technology={tech} fallbackTone={domain.accent} />
          ))}
          {techOverflow > 0 && (
            <span className="readout self-center text-2xs text-muted-foreground">+{techOverflow}</span>
          )}
        </div>

        <div className="mt-7">
          <TextAction to={href} tone={domain.accent}>Read the write-up</TextAction>
        </div>
      </div>
    );
  }

  return (
    <motion.li
      initial={enabled ? { opacity: 0 } : false}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: duration(0.4), delay: enabled ? animationDelay : 0 }}
    >
      <Link
        to={href}
        className={`group flex h-full flex-col rounded-md border border-border bg-card p-5 transition-colors hover:bg-surface-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${tone.panel}`}
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className={`text-base font-semibold leading-snug ${tone.value}`}>{project.title}</h3>
          <ArrowUpRight
            size={14}
            className={`mt-1 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${tone.value}`}
            aria-hidden="true"
          />
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{lens.summary}</p>
        {project.award && (
          <p className="mt-3 flex items-start gap-1.5 text-2xs text-award-type">
            <Trophy size={11} className="mt-0.5 shrink-0" aria-hidden="true" />
            {project.award}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 border-t border-border pt-3">
          {project.githubUrl && (
            <span className={`inline-flex items-center gap-1 font-mono text-2xs uppercase tracking-wider ${tone.label}`}>
              <Github size={11} aria-hidden="true" /> Repository
            </span>
          )}
          {project.externalUrl && (
            <span className={`inline-flex items-center gap-1 font-mono text-2xs uppercase tracking-wider ${tone.label}`}>
              <ExternalLink size={11} aria-hidden="true" /> Live demo
            </span>
          )}
          {project.metrics && project.metrics.length > 0 && (
            <span className="font-mono text-2xs uppercase tracking-wider text-systems-type">Measured result</span>
          )}
          {!project.githubUrl && !project.externalUrl && !project.metrics?.length && (
            <span className="font-mono text-2xs uppercase tracking-wider text-muted-foreground">Portfolio write-up</span>
          )}
        </div>
        <div className="mt-auto pt-4">
          <div className="flex flex-wrap gap-1">
            {techs.map((tech) => (
              <TechnologyChip key={tech} technology={tech} fallbackTone={domain.accent} />
            ))}
            {techOverflow > 0 && (
              <span className="readout self-center text-2xs text-muted-foreground">+{techOverflow}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.li>
  );
}
