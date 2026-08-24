import { motion } from "motion/react";
import { ExternalLink } from "lucide-react";
import { CERTIFICATIONS, SKILL_GROUPS } from "@/data/profile";
import { PROJECTS } from "@/data/projects";
import { DOMAINS } from "@/data/taxonomy";
import { getProjectsInDomain } from "@/data/projects";
import { accent } from "@/lib/accent";
import { AccentText, ChapterHeader, Metric, MonoLabel } from "@/components/kit/Primitives";
import { useMotionPolicy } from "@/lib/motion-policy";

/**
 * Chapter 03. A measurement band: dense, tabular, no cards. Claims elsewhere on
 * the page get their evidence here.
 *
 * The freelance figures are the ones master_detailed_cv.tex actually states: 100+
 * projects completed at 98% satisfaction, of which 30+ were full-stack MERN/.NET
 * builds. The old site's "50+" understated it.
 */
const HEADLINE_METRICS = [
  {
    value: "6×",
    label: "Faster inference",
    baseline: "FP32",
    note: "FP16 Tensor Cores, MNIST",
    tone: "thermal",
  },
  {
    value: "92%",
    label: "Circuit generation",
    baseline: "52%",
    note: "vs single-agent baseline",
    tone: "neural",
  },
  {
    value: "20+",
    label: "Qubits simulated",
    note: "hybrid MPI + OpenMP + CUDA",
    tone: "cryo",
  },
  { value: "3rd", label: "Huawei ICT finals", note: "national, UniQ team", tone: "award" },
] as const;

export default function ProofChapter() {
  const { enabled, duration } = useMotionPolicy();
  const domainCounts = DOMAINS.map((domain) => ({
    ...domain,
    count: getProjectsInDomain(domain.id).length,
  })).filter((domain) => domain.count > 0);
  const maxCount = Math.max(...domainCounts.map((d) => d.count));

  return (
    <section id="proof" className="scroll-mt-20 border-t border-border bg-surface-alt/40 py-20 lg:py-28">
      <div className="container">
        <ChapterHeader
          index={2}
          eyebrow="Evidence"
          title={
            <>
              <AccentText tone="systems">Numbers</AccentText>, and where they came from
            </>
          }
          lede="Every claim above has a project behind it. These are the results, with the baselines they improved on."
          tone="systems"
        />

        <motion.dl
          initial={enabled ? { opacity: 0, y: 16 } : { opacity: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: duration(0.6) }}
          className="mt-12 grid grid-cols-2 gap-x-8 gap-y-10 border-t border-border pt-10 lg:grid-cols-4"
        >
          {HEADLINE_METRICS.map((metric) => (
            <Metric key={metric.label} {...metric} />
          ))}
        </motion.dl>

        <div className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:gap-16">
          {/* Where the work actually sits, as counts rather than adjectives. */}
          <div>
            <MonoLabel>Project distribution</MonoLabel>
            <p className="mt-2 text-sm text-muted-foreground">
              {PROJECTS.length} documented projects. A project can touch more than one domain, so these
              overlap.
            </p>

            <ul className="mt-6 flex flex-col gap-3">
              {domainCounts.map((domain) => {
                const tone = accent(domain.accent);
                const width = `${(domain.count / maxCount) * 100}%`;
                return (
                  <li key={domain.id} className="grid grid-cols-[8.5rem_1fr_2rem] items-center gap-3">
                    <span className={`font-mono text-2xs uppercase tracking-widest ${tone.label}`}>
                      {domain.label}
                    </span>
                    <span className="h-1.5 w-full bg-border/60" aria-hidden="true">
                      <motion.span
                        initial={enabled ? { width: 0 } : { width }}
                        whileInView={{ width }}
                        viewport={{ once: true }}
                        transition={{ duration: duration(0.7), ease: [0.16, 1, 0.3, 1] }}
                        className={`block h-full ${tone.mark}`}
                      />
                    </span>
                    <span className={`readout text-xs ${tone.value}`}>{domain.count}</span>
                  </li>
                );
              })}
            </ul>

            <div className="mt-10 border-t border-border pt-8">
              <MonoLabel className="text-neural-type">Core skills</MonoLabel>
              <dl className="mt-5 grid gap-x-10 gap-y-6 sm:grid-cols-2">
                {SKILL_GROUPS.map((group) => {
                  const tone = accent(group.accent);
                  return (
                  <div key={group.title} className={`border-l-2 pl-3 ${tone.panel}`}>
                    <dt className={`text-sm font-semibold ${tone.value}`}>{group.title}</dt>
                    <dd className="mt-2">
                      <ul className="flex flex-col gap-1.5">
                        {group.items.map((item) => (
                          <li key={item} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
                            <span
                              aria-hidden="true"
                              className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${tone.mark}`}
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                  );
                })}
              </dl>
            </div>
          </div>

          <div className="lg:border-l lg:border-border lg:pl-10">
            <MonoLabel className="text-award-type">Certifications</MonoLabel>
            <ul className="mt-5 flex flex-col gap-5">
              {CERTIFICATIONS.map((cert) => (
                <li key={cert.title} className="border-b border-border pb-5 last:border-0 last:pb-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="readout text-2xs text-award-type">{cert.year}</span>
                    <span className="label-mono">{cert.issuer}</span>
                  </div>
                  <p className="mt-2 text-sm font-medium leading-snug text-foreground">{cert.title}</p>
                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 font-mono text-2xs uppercase tracking-widest text-award-type hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Verify
                      <ExternalLink size={11} aria-hidden="true" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
