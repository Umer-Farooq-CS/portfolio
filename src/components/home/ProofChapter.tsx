import { motion } from "motion/react";
import { PROJECTS } from "@/data/projects";
import { DOMAINS } from "@/data/taxonomy";
import { getProjectsInDomain } from "@/data/projects";
import { accent } from "@/lib/accent";
import { AccentText, ChapterHeader, Metric, MonoLabel, TextAction } from "@/components/kit/Primitives";
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
          initial={enabled ? { opacity: 0, y: 16 } : false}
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
                        initial={enabled ? { scaleX: 0 } : false}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: duration(0.7), ease: [0.16, 1, 0.3, 1] }}
                        className={`block h-full origin-left ${tone.mark}`}
                        style={{ width }}
                      />
                    </span>
                    <span className={`readout text-xs ${tone.value}`}>{domain.count}</span>
                  </li>
                );
              })}
            </ul>

          </div>

          <div className="rounded-lg border border-systems/25 bg-systems/5 p-5 lg:self-end">
            <MonoLabel className="text-systems-type">Evidence paths</MonoLabel>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Inspect the implementation, run the instruments, or open the complete record. The deeper proof stays one click away while this overview remains focused.
            </p>
            <div className="mt-6 flex flex-col items-start gap-4 border-t border-systems/20 pt-5">
              <TextAction to="/projects" tone="interface">Read the project write-ups</TextAction>
              <TextAction to="/lab" tone="cryo">Run the interactive lab</TextAction>
              <TextAction to="/cv" tone="systems">Open the complete CV</TextAction>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
