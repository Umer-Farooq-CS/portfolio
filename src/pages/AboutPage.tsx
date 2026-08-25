import { motion } from "motion/react";
import { ExternalLink, Github, Linkedin, Mail } from "lucide-react";
import { portrait } from "@/assets/optimized/manifest";
import Picture from "@/components/Picture";
import JsonLd from "@/components/JsonLd";
import { CERTIFICATIONS, EDUCATION, PROFESSIONAL_SUMMARY } from "@/data/profile";
import { EXPERIENCE } from "@/data/cv";
import { SITE_LINKS } from "@/data/siteLinks";
import { AccentText, ChapterHeader, Tag } from "@/components/kit/Primitives";
import SkillsSection from "@/components/kit/SkillsSection";
import { useDocumentMeta } from "@/lib/meta";
import { routeMeta } from "@/data/routeMeta";
import { personSchema } from "@/lib/seo";
import { useMotionPolicy } from "@/lib/motion-policy";
import { useActiveProfile } from "@/lib/profile";
import { accent, type VisualAccent } from "@/lib/accent";

/**
 * `period` for the three entries below that correspond to a role is read from
 * `EXPERIENCE` (cv.ts) rather than typed again, so a changed employment date
 * can't drift between /about and /cv. Throws if the organisation is renamed
 * there without updating it here — surfaced immediately by any test that
 * renders this page, rather than shipping a silently wrong date.
 */
function experiencePeriod(organisation: string): string {
  const entry = EXPERIENCE.find((item) => item.organisation === organisation);
  if (!entry) throw new Error(`AboutPage TIMELINE: no EXPERIENCE entry for organisation "${organisation}"`);
  return entry.period;
}

/** A typed timeline: order carries information here, so it is numbered and dated. */
const TIMELINE = [
  {
    period: "Aug 2022 – Jun 2026 (expected)",
    title: "BS Computer Science, FAST-NUCES",
    detail: "Islamabad. Dean's List, Spring 2023. Coursework centred on HPC, systems, and applied AI.",
    tone: "systems",
  },
  {
    period: experiencePeriod("Fiverr"),
    title: "Freelance developer, Fiverr",
    detail:
      "Level 2 seller — the top tier. 100+ projects completed at 98% client satisfaction and 80% repeat custom, including 30+ full-stack MERN and .NET applications.",
    tone: "interface",
  },
  {
    period: "2024",
    title: "Huawei ICT Competition, national finals",
    detail: "Third place with QCanvas, as part of the UniQ team.",
    tone: "award",
  },
  {
    period: experiencePeriod("NaSCon'25, FAST-NUCES"),
    title: "NaSCon'25, PR and marketing",
    detail: "Core team. Partner outreach and campaigns for a national tech event.",
    tone: "interface",
  },
  {
    period: "2025",
    title: "Oracle AI certifications",
    detail: "Generative AI Professional, and AI Foundations Associate.",
    tone: "neural",
  },
  {
    period: experiencePeriod("Open Quantum Workbench, FAST-NUCES"),
    title: "Software engineer, Open Quantum Workbench",
    detail: "FAST-NUCES. Full-stack work on an open quantum simulation and numerical computing workbench.",
    tone: "cryo",
  },
];

const LOOKING_FOR = ["HPC and GPU internships", "Research collaborations", "Infrastructure and platform roles"];

const QUICK_LINKS: { label: string; href: string; icon: typeof Github; tone: VisualAccent }[] = [
  { label: "GitHub", href: SITE_LINKS.github, icon: Github, tone: "interface" },
  { label: "LinkedIn", href: SITE_LINKS.linkedin, icon: Linkedin, tone: "neural" },
  { label: "Email", href: SITE_LINKS.email, icon: Mail, tone: "systems" },
];

export default function AboutPage() {
  const { enabled, duration } = useMotionPolicy();
  const profile = useActiveProfile();

  useDocumentMeta({ ...routeMeta("/about"), path: "/about" });

  const rise = (delay: number) => ({
    initial: enabled ? { opacity: 0, y: 14 } : { opacity: 0 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: duration(0.5), delay: enabled ? delay : 0 },
  });

  return (
    <div className="pb-20 pt-28 lg:pt-36">
      <JsonLd id="person-about" data={personSchema()} />
      <div className="container">
        <ChapterHeader
          eyebrow="About"
          title={
            <>
              Umer <AccentText tone="systems">Farooq</AccentText>
            </>
          }
          lede="Systems-focused computer scientist. High-performance and parallel computing, quantum simulation, and full-stack development — with a preference for problems where success is a measurable number."
          as="h1"
          tone="systems"
        />

        <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-16">
          {/* Left: the spec sheet. */}
          <motion.div {...rise(0)}>
            <div className="overflow-hidden rounded-lg border border-systems/25">
              <Picture
                image={portrait}
                alt="Portrait of Umer Farooq"
                sizes="(min-width: 1024px) 288px, 70vw"
                priority
                className="aspect-[4/5] w-full object-cover"
              />
            </div>

            <dl className="mt-6 flex flex-col gap-4 border-t border-border pt-5">
              <div>
                <dt className="label-mono">Based in</dt>
                <dd className="mt-1 text-sm text-foreground">{SITE_LINKS.location}</dd>
              </div>
              <div>
                <dt className="label-mono">Education</dt>
                <dd className="mt-1 text-sm text-foreground">
                  {EDUCATION.degree}
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {EDUCATION.institution}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="label-mono">Expected completion</dt>
                <dd className="readout mt-1 text-sm text-systems-type">Jun 2026</dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-5">
              {QUICK_LINKS.map(({ label, href, icon: Icon, tone: toneName }) => {
                const tone = accent(toneName);
                return (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 font-mono text-2xs uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${tone.panel} ${tone.value}`}
                >
                  <Icon size={12} aria-hidden="true" />
                  {label}
                </a>
                );
              })}
            </div>
          </motion.div>

          {/* Right: the prose and the record. */}
          <div>
            <motion.section {...rise(0.05)} aria-labelledby="summary">
              <h2 id="summary" className="label-mono text-systems-type">
                Summary
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-foreground">{PROFESSIONAL_SUMMARY}</p>
            </motion.section>

            <motion.section {...rise(0.08)} aria-labelledby="looking" className="mt-12">
              <h2 id="looking" className="label-mono text-systems-type">
                Looking for
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {LOOKING_FOR.map((item) => (
                  <li key={item}>
                    <span className="inline-block rounded-md border border-systems/30 bg-systems/5 px-2.5 py-1 font-mono text-2xs uppercase tracking-widest text-systems-type">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.section>

            <motion.section {...rise(0.1)} aria-labelledby="timeline" className="mt-12">
              <h2 id="timeline" className="label-mono text-interface-type">
                Timeline
              </h2>
              <ol className="mt-5 flex flex-col">
                {TIMELINE.map((entry) => {
                  const tone = accent(entry.tone as VisualAccent);
                  return (
                  <li
                    key={entry.title}
                    className="grid gap-1 border-t border-border py-5 sm:grid-cols-[10.5rem_1fr] sm:gap-6"
                  >
                    <span className={`readout text-2xs ${tone.value}`}>{entry.period}</span>
                    <span>
                      <span className="flex items-start gap-2">
                        <span aria-hidden="true" className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${tone.mark}`} />
                        <span className="block text-base font-semibold text-foreground">{entry.title}</span>
                      </span>
                      <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                        {entry.detail}
                      </span>
                    </span>
                  </li>
                  );
                })}
              </ol>
            </motion.section>

            <motion.section {...rise(0.12)} aria-labelledby="certs" className="mt-12">
              <h2 id="certs" className="label-mono text-award-type">
                Certifications
              </h2>
              <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                {CERTIFICATIONS.map((cert) => (
                  <li key={cert.title} className="rounded-lg border border-award/25 bg-award/5 p-4">
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
                        className="mt-3 inline-flex items-center gap-1.5 font-mono text-2xs uppercase tracking-widest text-award-type underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Verify
                        <ExternalLink size={11} aria-hidden="true" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </motion.section>

            <motion.section {...rise(0.14)} aria-labelledby="skills" className="mt-12">
              <h2 id="skills" className="label-mono text-neural-type">
                Skills
              </h2>
              <SkillsSection profile={profile} />
            </motion.section>

            <motion.section {...rise(0.16)} aria-labelledby="off" className="mt-12 border-t border-border pt-8">
              <h2 id="off" className="label-mono">
                Off compute
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
                Table tennis, games, and taking apart whatever tool shipped this week to see how it
                was built. Running outreach for NaSCon&apos;25 taught me more about explaining
                technical work to people who don&apos;t share your vocabulary than any course did.
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <Tag tone="systems">Table tennis</Tag>
                <Tag tone="neural">Games</Tag>
                <Tag tone="interface">New tooling</Tag>
                <Tag tone="award">Community events</Tag>
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </div>
  );
}
