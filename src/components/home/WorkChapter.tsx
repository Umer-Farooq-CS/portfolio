import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowUpRight, Trophy } from "lucide-react";
import { getFeaturedProjects } from "@/data/projects";
import { getDomain } from "@/data/taxonomy";
import { accent } from "@/lib/accent";
import { ChapterHeader, Metric, Tag, TextAction } from "@/components/kit/Primitives";
import { useMotionPolicy } from "@/lib/motion-policy";

/**
 * Chapter 02. Deliberately not a card grid — these are full-width rows, read like
 * entries in a log. The featured projects get room to state a result.
 */
export default function WorkChapter() {
  const featured = getFeaturedProjects();
  const { enabled, duration } = useMotionPolicy();

  return (
    <section id="work" className="scroll-mt-20 border-t border-border py-20 lg:py-28">
      <div className="container">
        <ChapterHeader
          index={1}
          eyebrow="Selected work"
          title="Two projects that show the range"
          lede="A platform that had to be fast and correct across three quantum frameworks, and an AI pipeline that had to stop being confidently wrong."
          tone="interface"
        />

        <div className="mt-14 flex flex-col">
          {featured.map((project, index) => {
            const domain = getDomain(project.domains[0]);
            const tone = accent(domain.accent);
            return (
              <motion.article
                key={project.slug}
                initial={enabled ? { opacity: 0, y: 18 } : false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: duration(0.6), delay: enabled ? index * 0.08 : 0 }}
                className={`group border-t py-10 first:border-t-0 first:pt-0 ${tone.panel}`}
              >
                <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-sm border px-1.5 py-0.5 font-mono text-2xs uppercase tracking-wider ${tone.chip}`}
                      >
                        {domain.label}
                      </span>
                      {project.period && (
                        <span className="readout text-2xs text-muted-foreground">{project.period}</span>
                      )}
                    </div>

                    <h3 className="mt-4 text-2xl text-foreground">
                      <Link
                        to={`/projects/${project.slug}`}
                        className={`inline-flex items-baseline gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${tone.value}`}
                      >
                        {project.title}
                        <ArrowUpRight
                          size={16}
                          className={`shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${tone.value}`}
                          aria-hidden="true"
                        />
                      </Link>
                    </h3>

                    <p className="mt-2 text-base text-muted-foreground">
                      {project.tagline ?? project.subtitle}
                    </p>

                    {project.objective && (
                      <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                        {project.objective}
                      </p>
                    )}

                    {project.award && (
                      <p className="mt-5 inline-flex items-start gap-2 text-xs text-award-type">
                        <Trophy size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
                        {project.award}
                      </p>
                    )}

                    <div className="mt-6 flex flex-wrap gap-1.5">
                      {project.technologies.slice(0, 7).map((tech) => (
                        <Tag key={tech} tone={domain.accent}>{tech}</Tag>
                      ))}
                    </div>

                    <div className="mt-7">
                      <TextAction to={`/projects/${project.slug}`} tone={domain.accent}>Read the write-up</TextAction>
                    </div>
                  </div>

                  <div className={`lg:border-l lg:pl-8 ${tone.panel}`}>
                    {project.metrics && project.metrics.length > 0 ? (
                      <dl className="grid grid-cols-2 gap-6">
                        {project.metrics.map((metric) => (
                          <Metric
                            key={metric.label}
                            value={metric.value}
                            label={metric.label}
                            baseline={metric.baseline}
                            note={metric.note}
                            tone={domain.accent}
                          />
                        ))}
                      </dl>
                    ) : (
                      project.strategy && (
                        <div>
                          <p className={`label-mono ${tone.label}`}>Approach</p>
                          <ul className="mt-3 flex flex-col gap-2.5">
                            {project.strategy.slice(0, 4).map((step) => (
                              <li key={step} className="flex gap-2.5 text-sm text-muted-foreground">
                                <span
                                  aria-hidden="true"
                                  className={`mt-2 h-1 w-1 shrink-0 rounded-full ${tone.mark}`}
                                />
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <TextAction to="/projects" tone="interface">All 30 projects</TextAction>
        </div>
      </div>
    </section>
  );
}
