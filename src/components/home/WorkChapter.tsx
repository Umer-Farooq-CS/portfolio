import { motion } from "motion/react";
import { PROJECTS, getProjectBySlug } from "@/data/projects";
import { getDomain } from "@/data/taxonomy";
import { accent } from "@/lib/accent";
import { ChapterHeader, Metric, TextAction } from "@/components/kit/Primitives";
import ProjectCard from "@/components/kit/ProjectCard";
import { useMotionPolicy } from "@/lib/motion-policy";
import { useActiveProfile } from "@/lib/profile";

/**
 * Chapter 02. Deliberately not a card grid — these are full-width rows, read like
 * entries in a log. The featured projects get room to state a result.
 *
 * Which projects lead, and the copy above them, come from the active lens
 * (`profile.workChapter`) — an ordered subset of the projects already flagged
 * `featured` in projects.ts, resolved by slug so a rename drops the row rather
 * than rendering an empty one.
 */
export default function WorkChapter({ index = 1, basePath = "" }: { index?: number; basePath?: string }) {
  const profile = useActiveProfile();
  const { enabled, reveal } = useMotionPolicy();
  const featured = profile.workChapter.slugs
    .map(getProjectBySlug)
    .filter((project): project is NonNullable<typeof project> => project !== undefined);

  return (
    <section id="work" className="scroll-mt-20 border-t border-border py-20 lg:py-28">
      <div className="container">
        <ChapterHeader
          index={index}
          eyebrow="Selected work"
          title={profile.workChapter.title}
          lede={profile.workChapter.lede}
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
                transition={{ duration: reveal.section, delay: index * reveal.stagger }}
                className={`group border-t py-10 first:border-t-0 first:pt-0 ${tone.panel}`}
              >
                <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14">
                  <ProjectCard project={project} profile={profile} basePath={basePath} variant="row" />

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
          <TextAction to={`${basePath}/projects`} tone="interface">All {PROJECTS.length} projects</TextAction>
        </div>
      </div>
    </section>
  );
}
