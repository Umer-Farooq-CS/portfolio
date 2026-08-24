import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Printer } from "lucide-react";
import JsonLd from "@/components/JsonLd";
import { MonoLabel, QuietAction, TextAction } from "@/components/kit/Primitives";
import {
  AWARDS,
  COURSEWORK,
  CV_CONTACT,
  CV_EDUCATION_HIGHLIGHTS,
  CV_PDF_PATH,
  EXPERIENCE,
  LANGUAGES,
  cvProjectOverflow,
  getCvProjects,
} from "@/data/cv";
import { CERTIFICATIONS, EDUCATION, PROFESSIONAL_SUMMARY, SKILL_GROUPS } from "@/data/profile";
import { PROJECTS } from "@/data/projects";
import { useDocumentMeta } from "@/lib/meta";
import { personSchema } from "@/lib/seo";
import { SITE, absoluteUrl } from "@/lib/site";
import printStyles from "@/styles/print.css?raw";

/**
 * The CV, rendered from src/data rather than typed out again — so it cannot say
 * one thing here and another on /about or /projects. scripts/gen-cv-pdf.mjs
 * prints this same route to public/umer-farooq-cv.pdf, which is why the print
 * rules matter as much as the screen ones.
 *
 * Deliberately unanimated: a document that fades in can be captured mid-fade by
 * the PDF run, and a CV at 40% opacity is worse than a CV with no entrance.
 */

/** Section shell: a hairline, a mono header, then content. Mirrors the LaTeX source. */
function CvSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="cv-section mt-11 border-t border-border pt-5">
      <h2 id={id} className="label-mono text-xs text-foreground">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Entry head: what it was on the left, when it was on the right. */
function EntryHead({ title, meta }: { title: ReactNode; meta: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
      <h3 className="text-lg text-foreground">{title}</h3>
      <p className="readout text-2xs text-muted-foreground">{meta}</p>
    </div>
  );
}

/** Hairline tick instead of a bullet glyph — and it survives the print rules. */
function Bullet({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-2.5 text-sm leading-relaxed text-foreground">
      <span aria-hidden="true" className="mt-[0.7em] h-0 w-2 shrink-0 border-t border-border" />
      <span>{children}</span>
    </li>
  );
}

export default function CvPage() {
  const projects = getCvProjects();
  const overflow = cvProjectOverflow();

  useDocumentMeta({
    title: "CV",
    path: "/cv",
    description:
      "Umer Farooq — CV. High-performance and GPU computing, quantum simulation, and AI systems. Education, experience, selected projects, skills, and certifications.",
  });

  return (
    <div className="cv-page pb-20 pt-28 lg:pt-36">
      {/* Scoped so the print rules disappear with the route. See src/styles/print.css. */}
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />
      <JsonLd id="person-cv" data={personSchema()} />

      <div className="container">
        <div className="cv-sheet mx-auto max-w-3xl">
          <div className="no-print flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="group inline-flex items-center gap-2 rounded-md bg-thermal px-5 py-2.5 font-mono text-2xs uppercase tracking-widest text-on-thermal transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Print or save as PDF
              <Printer size={13} aria-hidden="true" />
            </button>
            <QuietAction href={CV_PDF_PATH}>Download the PDF</QuietAction>
          </div>
          <p className="no-print mt-3 text-xs text-muted-foreground">
            The PDF is printed from this page, so the two can&apos;t drift apart. If the download is
            missing, use the print button — it produces the same document.
          </p>

          <div className="cv-masthead cv-entry mt-10 border-t border-border pt-8">
            <h1 className="text-4xl text-foreground">{SITE.name}</h1>
            <p className="mt-2 font-mono text-xs uppercase tracking-widest text-primary-type">
              {SITE.role}
            </p>
            <dl className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5">
              {CV_CONTACT.map((item) => (
                <div key={item.label} className="flex items-baseline gap-1.5">
                  <dt className="sr-only">{item.label}</dt>
                  <dd className="text-sm text-muted-foreground">
                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.href.startsWith("http") ? "_blank" : undefined}
                        rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="underline decoration-border underline-offset-2 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {item.text}
                      </a>
                    ) : (
                      item.text
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <CvSection id="cv-summary" title="Summary">
            <p className="max-w-prose text-sm leading-relaxed text-foreground">
              {PROFESSIONAL_SUMMARY}
            </p>
          </CvSection>

          <CvSection id="cv-experience" title="Experience">
            <ul className="flex flex-col gap-7">
              {EXPERIENCE.map((job) => (
                <li key={`${job.role}-${job.period}`} className="cv-entry">
                  <EntryHead title={job.role} meta={job.period} />
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {job.organisation} · {job.location}
                  </p>
                  <ul className="mt-2.5 flex flex-col gap-1.5">
                    {job.points.map((point) => (
                      <Bullet key={point}>{point}</Bullet>
                    ))}
                  </ul>
                  {job.technologies && (
                    <p className="mt-2.5 font-mono text-2xs text-muted-foreground">
                      {job.technologies.join(" · ")}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </CvSection>

          <CvSection id="cv-education" title="Education">
            <div className="cv-entry">
              <EntryHead title={EDUCATION.degree} meta={EDUCATION.period} />
              <p className="mt-0.5 text-sm text-muted-foreground">{EDUCATION.institution}</p>
              <ul className="mt-2.5 flex flex-col gap-1.5">
                {CV_EDUCATION_HIGHLIGHTS.map((highlight) => (
                  <Bullet key={highlight}>{highlight}</Bullet>
                ))}
              </ul>
              <div className="mt-3.5">
                <MonoLabel>Coursework</MonoLabel>
                <p className="mt-1.5 font-mono text-2xs leading-relaxed text-muted-foreground">
                  {COURSEWORK.join(" · ")}
                </p>
              </div>
            </div>
          </CvSection>

          <CvSection id="cv-projects" title={`Selected projects · ${projects.length}`}>
            <ul className="flex flex-col gap-6">
              {projects.map((project) => (
                <li key={project.slug} className="cv-entry">
                  <EntryHead
                    title={
                      <Link
                        to={`/projects/${project.slug}`}
                        className="transition-colors hover:text-primary-type focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {project.title}
                      </Link>
                    }
                    meta={project.period ?? project.category}
                  />
                  <p className="mt-1 text-sm leading-relaxed text-foreground">
                    {project.tagline ?? project.subtitle}
                  </p>
                  {project.award && (
                    <p className="mt-1 text-sm text-muted-foreground">{project.award}</p>
                  )}
                  {project.metrics && (
                    <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
                      {project.metrics.map((metric) => (
                        <div key={metric.label} className="flex items-baseline gap-1.5">
                          <dt className="label-mono">{metric.label}</dt>
                          <dd className="readout text-xs text-foreground">
                            {metric.value}
                            {metric.baseline ? ` from ${metric.baseline}` : ""}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  <p className="mt-2 font-mono text-2xs text-muted-foreground">
                    {project.technologies.slice(0, 7).join(" · ")}
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t border-border pt-4">
              <p className="text-sm text-muted-foreground">
                {overflow} further projects — compilers, distributed hash tables, desktop
                applications, and games — are listed in full on the work page.
              </p>
              <div className="mt-2.5">
                <TextAction to="/projects">All {PROJECTS.length} projects</TextAction>
              </div>
            </div>
          </CvSection>

          <CvSection id="cv-skills" title="Skills">
            <dl className="cv-columns grid gap-5 sm:grid-cols-2">
              {SKILL_GROUPS.map((group) => (
                <div key={group.title} className="cv-entry border-t border-border pt-3">
                  <dt className="label-mono">{group.title}</dt>
                  <dd className="mt-1.5">
                    <ul className="flex flex-col gap-1 text-sm leading-relaxed text-muted-foreground">
                      {group.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ))}
            </dl>
          </CvSection>

          <CvSection id="cv-certifications" title="Certifications">
            <ul className="flex flex-col gap-3">
              {CERTIFICATIONS.map((cert) => (
                <li key={cert.title} className="cv-entry flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                  <span className="readout text-2xs text-muted-foreground">{cert.year}</span>
                  <span className="text-sm text-foreground">{cert.title}</span>
                  <span className="text-sm text-muted-foreground">{cert.issuer}</span>
                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-2xs uppercase tracking-widest text-primary-type transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Credential
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </CvSection>

          <CvSection id="cv-awards" title="Awards">
            <ul className="flex flex-col gap-3">
              {AWARDS.map((award) => (
                <li key={award.title} className="cv-entry flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                  <span className="readout text-2xs text-muted-foreground">{award.year}</span>
                  <span className="text-sm text-foreground">{award.title}</span>
                  <span className="text-sm text-muted-foreground">{award.detail}</span>
                </li>
              ))}
            </ul>
          </CvSection>

          <CvSection id="cv-languages" title="Languages">
            <dl className="flex flex-wrap gap-x-6 gap-y-1.5">
              {LANGUAGES.map((entry) => (
                <div key={entry.language} className="flex items-baseline gap-2">
                  <dt className="text-sm text-foreground">{entry.language}</dt>
                  <dd className="label-mono">{entry.proficiency}</dd>
                </div>
              ))}
            </dl>
          </CvSection>

          {/* Paper loses the address bar, so the sheet has to say where it came from. */}
          <div className="print-only mt-10 border-t border-border pt-3">
            <p className="readout text-2xs">
              {SITE.name} · {absoluteUrl("/cv")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
