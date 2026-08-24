import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { INTENTS } from "@/data/intents";
import { getProjectBySlug, type ProjectItem } from "@/data/projects";
import { accent } from "@/lib/accent";
import { AccentText, ChapterHeader, MonoLabel } from "@/components/kit/Primitives";
import { useDocumentMeta } from "@/lib/meta";
import { routeMeta } from "@/data/routeMeta";
import { useMotionPolicy } from "@/lib/motion-policy";

const RELATED_PROJECT_SLUGS: Record<string, string[]> = {
  "cuda-kernel": ["canny-edge-detector", "mnist-gpu"],
  parallelize: ["q-tensor", "parallel-graph-text"],
  "quantum-sim": ["qcanvas", "q-tensor"],
  rag: ["cirq-rag", "multimodal-rag-pdf"],
  "full-stack": ["qcanvas", "harmoniq"],
  review: ["ring-dht-ipfs", "asco-services-api"],
};

function getRelatedProjects(intentId: string): ProjectItem[] {
  return (RELATED_PROJECT_SLUGS[intentId] ?? [])
    .map(getProjectBySlug)
    .filter((project): project is ProjectItem => project !== undefined);
}

/**
 * Services, written as the problems people arrive with rather than the
 * capabilities I'd like to list. Each one opens to show what it involves, what
 * comes back, and project records that demonstrate the adjacent work.
 */
export default function ServicesPage() {
  const [open, setOpen] = useState<string | null>(INTENTS[0].id);
  const { enabled, duration } = useMotionPolicy();

  useDocumentMeta({ ...routeMeta("/services"), path: "/services" });

  return (
    <div className="pb-20 pt-28 lg:pt-36">
      <div className="container">
        <ChapterHeader
          eyebrow="Services"
          title={
            <>
              Start from the <AccentText tone="systems">problem</AccentText>, not the toolchain
            </>
          }
          lede="Six things people usually need. Open one to see the approach, the concrete deliverables, and relevant project evidence before starting a conversation."
          as="h1"
          tone="systems"
        />

        <ul className="mt-14 border-t border-border">
          {INTENTS.map((intent, index) => {
            const tone = accent(intent.accent);
            const isOpen = open === intent.id;
            const relatedProjects = getRelatedProjects(intent.id);
            return (
              <motion.li
                key={intent.id}
                initial={enabled ? { opacity: 0, y: 10 } : false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: duration(0.45), delay: enabled ? index * 0.04 : 0 }}
                className="border-b border-border"
                id={intent.id}
              >
                <h2>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : intent.id)}
                    aria-expanded={isOpen}
                    aria-controls={`${intent.id}-panel`}
                    className="group flex w-full items-baseline gap-4 py-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className={`readout shrink-0 text-2xs ${tone.value}`}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1">
                      <span className={`block text-xl sm:text-2xl ${tone.value}`}>
                        {intent.title}
                      </span>
                      <span className={`mt-1.5 block font-mono text-2xs uppercase tracking-widest ${tone.label}`}>
                        {intent.subject}
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className={`shrink-0 font-mono text-lg transition-transform ${
                        isOpen ? `rotate-45 ${tone.value}` : "text-muted-foreground"
                      }`}
                    >
                      +
                    </span>
                  </button>
                </h2>

                {isOpen && (
                  <div id={`${intent.id}-panel`} className={`grid gap-8 border-l-2 pb-9 pl-5 sm:pl-7 lg:grid-cols-2 lg:gap-x-14 lg:gap-y-8 ${tone.panel}`}>
                    <div>
                      <MonoLabel className={tone.label}>What I do</MonoLabel>
                      <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                        {intent.response}
                      </p>
                      <Link
                        to={`/#talk`}
                        className="group mt-6 inline-flex min-h-11 items-center gap-2 rounded-md bg-thermal px-4 py-2 font-mono text-2xs uppercase tracking-widest text-on-thermal transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Start this conversation
                        <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                      </Link>
                    </div>
                    <div>
                      <MonoLabel className={tone.label}>What you get</MonoLabel>
                      <ul className="mt-3 flex flex-col gap-2.5">
                        {intent.deliverables.map((item) => (
                          <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
                            <Check size={13} className={`mt-1 shrink-0 ${tone.value}`} aria-hidden="true" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {relatedProjects.length > 0 && (
                      <div className="border-t border-border pt-6 lg:col-span-2">
                        <MonoLabel className={tone.label}>Relevant work</MonoLabel>
                        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                          {relatedProjects.map((project) => (
                            <li key={project.slug}>
                              <Link
                                to={`/projects/${project.slug}`}
                                className={`group flex min-h-11 items-center gap-3 rounded-md border px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${tone.panel}`}
                              >
                                <span className="min-w-0 flex-1">
                                  <span className={`block text-sm font-semibold ${tone.value}`}>
                                    {project.title}
                                  </span>
                                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                                    {project.tagline ?? project.subtitle}
                                  </span>
                                </span>
                                <ArrowUpRight
                                  size={14}
                                  className={`shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${tone.value}`}
                                  aria-hidden="true"
                                />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </motion.li>
            );
          })}
        </ul>

        <p className="mt-10 max-w-2xl text-sm text-muted-foreground">
          Not on the list? The pattern is the same either way — tell me what the system does and
          where it hurts, and I&apos;ll tell you honestly whether I&apos;m the right person for it.
        </p>
      </div>
    </div>
  );
}
