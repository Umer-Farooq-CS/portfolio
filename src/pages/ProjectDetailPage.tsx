import { Suspense, lazy } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, ExternalLink, Github } from "lucide-react";
import { getAdjacentProjects, getProjectBySlug } from "@/data/projects";
import { getDomain } from "@/data/taxonomy";
import { accent } from "@/lib/accent";
import Picture from "@/components/Picture";
import JsonLd from "@/components/JsonLd";
import { Metric, Tag } from "@/components/kit/Primitives";
import { useDocumentMeta } from "@/lib/meta";
import { breadcrumbSchema, projectSchema } from "@/lib/seo";
import { useMotionPolicy } from "@/lib/motion-policy";
import NotFound from "./NotFound";

// Both load on demand: the pipeline diagram carries anime.js, and the figures are
// only relevant to a handful of slugs.
const PipelineTrace = lazy(() => import("@/components/lab/PipelineTrace"));
const ProjectFigures = lazy(() => import("@/components/charts/ProjectFigures"));

/**
 * A project page leads with the result. Bullet lists are still here — they carry
 * real detail — but a reader who only sees the first screen should come away with
 * what it does, what it achieved, and where the code is.
 */
export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const project = slug ? getProjectBySlug(slug) : undefined;
  const { prev, next } = getAdjacentProjects(slug ?? "");
  const { enabled, duration } = useMotionPolicy();

  // Hooks run before the early return, so the order stays stable either way.
  useDocumentMeta({
    title: project ? project.title : "Project not found",
    path: project ? `/projects/${project.slug}` : "/projects",
    description: project ? `${project.subtitle} — ${project.description[0]}` : undefined,
    type: "article",
    noIndex: !project,
  });

  if (!project) return <NotFound />;

  const domain = getDomain(project.domains[0]);
  const tone = accent(domain.accent);
  const prevTone = prev ? accent(getDomain(prev.domains[0]).accent) : null;
  const nextTone = next ? accent(getDomain(next.domains[0]).accent) : null;
  const rise = (delay: number) => ({
    initial: enabled ? { opacity: 0, y: 14 } : { opacity: 0 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: duration(0.5), delay: enabled ? delay : 0 },
  });

  return (
    <div className="pb-20 pt-28 lg:pt-32">
      <JsonLd id={`project-${project.slug}`} data={projectSchema(project)} />
      <JsonLd
        id="project-breadcrumb"
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Work", path: "/projects" },
          { name: project.title, path: `/projects/${project.slug}` },
        ])}
      />

      <div className="container max-w-4xl">
        <motion.div {...rise(0)}>
          <Link
            to="/projects"
            className={`inline-flex items-center gap-1.5 font-mono text-2xs uppercase tracking-widest transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${tone.value}`}
          >
            <ArrowLeft size={12} aria-hidden="true" />
            All work
          </Link>
        </motion.div>

        <motion.header {...rise(0.05)} className="mt-8">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-sm border px-1.5 py-0.5 font-mono text-2xs uppercase tracking-wider ${tone.chip}`}
            >
              {domain.label}
            </span>
            <span className="label-mono">{project.category}</span>
            {project.period && (
              <span className="readout text-2xs text-muted-foreground">{project.period}</span>
            )}
          </div>

          <h1 className={`mt-5 text-4xl ${tone.value}`}>{project.title}</h1>
          <p className="mt-3 text-lg text-muted-foreground">{project.subtitle}</p>

          {project.award && (
            <p className="mt-5 border-l-2 border-award pl-3 text-sm text-award-type">
              {project.award}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-4">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-mono text-2xs uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${tone.panel} ${tone.value}`}
              >
                <Github size={12} aria-hidden="true" />
                Source
              </a>
            )}
            {project.externalUrl && (
              <a
                href={project.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-mono text-2xs uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${tone.panel} ${tone.value}`}
              >
                <ExternalLink size={12} aria-hidden="true" />
                Live
              </a>
            )}
          </div>
        </motion.header>

        {/* Results first, when there are measured results to show. */}
        {project.metrics && project.metrics.length > 0 && (
          <motion.section {...rise(0.1)} aria-labelledby="results" className="mt-12">
            <h2 id="results" className={`label-mono ${tone.label}`}>
              Results
            </h2>
            <dl className="mt-5 grid gap-8 border-y border-border py-7 sm:grid-cols-2 lg:grid-cols-3">
              {project.metrics.map((metric) => (
                <Metric key={metric.label} {...metric} tone={domain.accent} />
              ))}
            </dl>
          </motion.section>
        )}

        {project.image && project.slug !== "cirq-rag" && (
          <motion.figure {...rise(0.12)} className="mt-12">
            <div className={`overflow-hidden rounded-lg border bg-card ${tone.panel}`}>
              <Picture
                image={project.image}
                alt={`${project.title} architecture diagram`}
                sizes="(min-width: 1024px) 896px, 100vw"
                className="h-auto w-full object-contain"
              />
            </div>
            <figcaption className="mt-2 text-2xs text-muted-foreground">
              Architecture of {project.title}.
            </figcaption>
          </motion.figure>
        )}

        {project.slug === "cirq-rag" && (
          <motion.div {...rise(0.12)} className="mt-12">
            <Suspense fallback={null}>
              <PipelineTrace />
            </Suspense>
          </motion.div>
        )}

        <Suspense fallback={null}>
          <ProjectFigures slug={project.slug} tone={domain.accent} className="mt-12" />
        </Suspense>

        {project.objective && (
          <motion.section {...rise(0.14)} aria-labelledby="objective" className="mt-14">
            <h2 id="objective" className={`label-mono ${tone.label}`}>
              The problem
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-foreground">{project.objective}</p>
          </motion.section>
        )}

        <motion.section {...rise(0.16)} aria-labelledby="overview" className="mt-14">
          <h2 id="overview" className={`label-mono ${tone.label}`}>
            What it does
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {project.description.map((point) => (
              <li key={point.slice(0, 40)} className="flex gap-3 text-base leading-relaxed text-muted-foreground">
                <span aria-hidden="true" className={`mt-2.5 h-1 w-1 shrink-0 rounded-full ${tone.mark}`} />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </motion.section>

        {project.strategy && project.strategy.length > 0 && (
          <motion.section {...rise(0.18)} aria-labelledby="approach" className="mt-14">
            <h2 id="approach" className={`label-mono ${tone.label}`}>
              How it was built
            </h2>
            {/* Numbered, because these steps happened in this order. */}
            <ol className="mt-4 flex flex-col gap-4">
              {project.strategy.map((step, index) => (
                <li key={step} className="flex gap-4">
                  <span className={`readout shrink-0 text-2xs ${tone.value}`}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-base leading-relaxed text-muted-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </motion.section>
        )}

        {project.architectureHighlights && project.architectureHighlights.length > 0 && (
          <motion.section {...rise(0.2)} aria-labelledby="architecture" className="mt-14">
            <h2 id="architecture" className={`label-mono ${tone.label}`}>
              Key architecture
            </h2>
            <ul className="mt-4 flex flex-col gap-3">
              {project.architectureHighlights.map((point) => (
                <li
                  key={point.slice(0, 40)}
                  className={`border-l-2 pl-4 text-base leading-relaxed text-muted-foreground ${tone.panel}`}
                >
                  {point}
                </li>
              ))}
            </ul>
          </motion.section>
        )}

        <motion.section {...rise(0.22)} aria-labelledby="stack" className="mt-14">
          <h2 id="stack" className={`label-mono ${tone.label}`}>
            Stack
          </h2>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.technologies.map((tech) => (
              <Tag key={tech} tone={domain.accent}>{tech}</Tag>
            ))}
          </div>
        </motion.section>

        <nav aria-label="Project navigation" className="mt-16 grid gap-2 border-t border-border pt-8 sm:grid-cols-2">
          {prev && prevTone && (
            <Link
              to={`/projects/${prev.slug}`}
              className={`group rounded-md border p-5 transition-colors hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${prevTone.panel}`}
            >
              <span className="flex items-center gap-1.5 font-mono text-2xs uppercase tracking-widest text-muted-foreground">
                <ArrowLeft size={11} aria-hidden="true" />
                Previous
              </span>
              <span className={`mt-2 block text-sm font-semibold ${prevTone.value}`}>
                {prev.title}
              </span>
            </Link>
          )}
          {next && nextTone && (
            <Link
              to={`/projects/${next.slug}`}
              className={`group rounded-md border p-5 transition-colors hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-right ${nextTone.panel}`}
            >
              <span className="flex items-center gap-1.5 font-mono text-2xs uppercase tracking-widest text-muted-foreground sm:justify-end">
                Next
                <ArrowRight size={11} aria-hidden="true" />
              </span>
              <span className={`mt-2 block text-sm font-semibold ${nextTone.value}`}>
                {next.title}
              </span>
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
}
