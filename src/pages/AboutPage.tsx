import { motion } from "motion/react";
import { ExternalLink, Github, Linkedin, Mail } from "lucide-react";
import { portrait } from "@/assets/optimized/manifest";
import Picture from "@/components/Picture";
import JsonLd from "@/components/JsonLd";
import { CERTIFICATIONS, EDUCATION, PROFESSIONAL_SUMMARY, SKILL_GROUPS } from "@/data/profile";
import { SITE_LINKS } from "@/data/siteLinks";
import { ChapterHeader, Tag } from "@/components/kit/Primitives";
import { useDocumentMeta } from "@/lib/meta";
import { personSchema } from "@/lib/seo";
import { useMotionPolicy } from "@/lib/motion-policy";

/** A typed timeline: order carries information here, so it is numbered and dated. */
const TIMELINE = [
  {
    period: "Aug 2022 – Jun 2026",
    title: "BS Computer Science, FAST-NUCES",
    detail: "Islamabad. Dean's List, Spring 2023. Coursework centred on HPC, systems, and applied AI.",
  },
  {
    period: "Aug 2023 – Aug 2024",
    title: "Freelance developer, Fiverr",
    detail:
      "Level 2 seller — the top tier. 100+ projects completed at 98% client satisfaction and 80% repeat custom, including 30+ full-stack MERN and .NET applications.",
  },
  {
    period: "2024",
    title: "Huawei ICT Competition, national finals",
    detail: "Third place with QCanvas, as part of the UniQ team.",
  },
  {
    period: "Feb – May 2025",
    title: "NaSCon'25, PR and marketing",
    detail: "Core team. Partner outreach and campaigns for a national tech event.",
  },
  {
    period: "2025",
    title: "Oracle AI certifications",
    detail: "Generative AI Professional, and AI Foundations Associate.",
  },
  {
    period: "Sep 2025 – present",
    title: "Software engineer, Open Quantum Workbench",
    detail: "FAST-NUCES. Full-stack work on an open quantum simulation and numerical computing workbench.",
  },
];

const LOOKING_FOR = ["HPC and GPU internships", "Research collaborations", "Infrastructure and platform roles"];

const QUICK_LINKS = [
  { label: "GitHub", href: SITE_LINKS.github, icon: Github },
  { label: "LinkedIn", href: SITE_LINKS.linkedin, icon: Linkedin },
  { label: "Email", href: SITE_LINKS.email, icon: Mail },
];

export default function AboutPage() {
  const { enabled, duration } = useMotionPolicy();

  useDocumentMeta({
    title: "About",
    path: "/about",
    description:
      "Umer Farooq — a systems-focused computer scientist in Islamabad working across high-performance computing, quantum simulation, and applied AI.",
  });

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
          title="Umer Farooq"
          lede="Systems-focused computer scientist. High-performance and parallel computing, quantum simulation, and full-stack development — with a preference for problems where success is a measurable number."
        />

        <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-16">
          {/* Left: the spec sheet. */}
          <motion.div {...rise(0)}>
            <div className="overflow-hidden rounded-lg border border-border">
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
                <dt className="label-mono">Studying</dt>
                <dd className="mt-1 text-sm text-foreground">
                  {EDUCATION.degree}
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {EDUCATION.institution}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="label-mono">Graduating</dt>
                <dd className="readout mt-1 text-sm text-foreground">Jun 2026</dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-5">
              {QUICK_LINKS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 font-mono text-2xs uppercase tracking-widest text-muted-foreground transition-colors hover:border-thermal hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Icon size={12} aria-hidden="true" />
                  {label}
                </a>
              ))}
            </div>
          </motion.div>

          {/* Right: the prose and the record. */}
          <div>
            <motion.section {...rise(0.05)} aria-labelledby="summary">
              <h2 id="summary" className="label-mono">
                Summary
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-foreground">{PROFESSIONAL_SUMMARY}</p>
            </motion.section>

            <motion.section {...rise(0.08)} aria-labelledby="looking" className="mt-12">
              <h2 id="looking" className="label-mono">
                Looking for
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {LOOKING_FOR.map((item) => (
                  <li key={item}>
                    <span className="inline-block rounded-md border border-thermal/30 bg-thermal/5 px-2.5 py-1 font-mono text-2xs uppercase tracking-widest text-primary-type">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.section>

            <motion.section {...rise(0.1)} aria-labelledby="timeline" className="mt-12">
              <h2 id="timeline" className="label-mono">
                Timeline
              </h2>
              <ol className="mt-5 flex flex-col">
                {TIMELINE.map((entry) => (
                  <li
                    key={entry.title}
                    className="grid gap-1 border-t border-border py-5 sm:grid-cols-[10.5rem_1fr] sm:gap-6"
                  >
                    <span className="readout text-2xs text-muted-foreground">{entry.period}</span>
                    <span>
                      <span className="block text-base font-semibold text-foreground">{entry.title}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                        {entry.detail}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </motion.section>

            <motion.section {...rise(0.12)} aria-labelledby="certs" className="mt-12">
              <h2 id="certs" className="label-mono">
                Certifications
              </h2>
              <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                {CERTIFICATIONS.map((cert) => (
                  <li key={cert.title} className="rounded-lg border border-border bg-card p-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="readout text-2xs text-primary-type">{cert.year}</span>
                      <span className="label-mono">{cert.issuer}</span>
                    </div>
                    <p className="mt-2 text-sm font-medium leading-snug text-foreground">{cert.title}</p>
                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 font-mono text-2xs uppercase tracking-widest text-primary-type underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
              <h2 id="skills" className="label-mono">
                Skills
              </h2>
              <dl className="mt-5 flex flex-col">
                {SKILL_GROUPS.map((group) => (
                  <div key={group.title} className="border-t border-border py-5">
                    <dt className="text-sm font-semibold text-foreground">{group.title}</dt>
                    <dd className="mt-2.5">
                      <ul className="flex flex-col gap-2">
                        {group.items.map((item) => (
                          <li
                            key={item}
                            className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
                          >
                            <span
                              aria-hidden="true"
                              className="mt-2 h-1 w-1 shrink-0 rounded-full bg-border"
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                ))}
              </dl>
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
                <Tag>Table tennis</Tag>
                <Tag>Games</Tag>
                <Tag>New tooling</Tag>
                <Tag>Community events</Tag>
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </div>
  );
}
