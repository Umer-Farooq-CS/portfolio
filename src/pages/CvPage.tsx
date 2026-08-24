import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Printer } from "lucide-react";
import JsonLd from "@/components/JsonLd";
import { AccentText, MonoLabel, QuietAction, TextAction } from "@/components/kit/Primitives";
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
import { routeMeta } from "@/data/routeMeta";
import { personSchema } from "@/lib/seo";
import { SITE, absoluteUrl } from "@/lib/site";
import printStyles from "@/styles/print.css?raw";
import { accent, type VisualAccent } from "@/lib/accent";
import { getDomain } from "@/data/taxonomy";

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
function CvSection({
  id,
  title,
  children,
  tone = "none",
}: {
  id: string;
  title: string;
  children: ReactNode;
  tone?: VisualAccent;
}) {
  const toneClasses = accent(tone);

  return (
    <section aria-labelledby={id} className={`cv-section mt-11 border-t pt-5 ${toneClasses.panel}`}>
      <h2 id={id} className={`label-mono flex items-center gap-2 text-xs ${toneClasses.value}`}>
        <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${toneClasses.mark}`} />
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Entry head: what it was on the left, when it was on the right. */
function EntryHead({
  title,
  meta,
  tone = "none",
}: {
  title: ReactNode;
  meta: string;
  tone?: VisualAccent;
}) {
  const toneClasses = accent(tone);

  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
      <h3 className={`text-lg ${toneClasses.value}`}>{title}</h3>
      <p className={`readout text-2xs ${toneClasses.label}`}>{meta}</p>
    </div>
  );
}

/** Hairline tick instead of a bullet glyph — and it survives the print rules. */
function Bullet({ children, tone = "none" }: { children: ReactNode; tone?: VisualAccent }) {
  const toneClasses = accent(tone);

  return (
    <li className="flex gap-2.5 text-sm leading-relaxed text-foreground">
      <span aria-hidden="true" className={`mt-[0.7em] h-0 w-2 shrink-0 border-t ${toneClasses.panel}`} />
      <span>{children}</span>
    </li>
  );
}

export default function CvPage() {
  const projects = getCvProjects();
  const overflow = cvProjectOverflow();

  useDocumentMeta({ ...routeMeta("/cv"), path: "/cv" });

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
            <QuietAction href={CV_PDF_PATH} tone="interface" download="umer-farooq-cv.pdf">
              Download the PDF
            </QuietAction>
          </div>
          <p className="no-print mt-3 text-xs text-muted-foreground">
            The PDF is printed from this page, so the two can&apos;t drift apart. If the download is
            missing, use the print button — it produces the same document.
          </p>

          <div className="cv-masthead cv-entry mt-10 border-t border-interface/30 pt-8">
            <div aria-hidden="true" className="mb-6 grid h-1 grid-cols-5">
              <span className="bg-thermal" />
              <span className="bg-cryo" />
              <span className="bg-neural" />
              <span className="bg-systems" />
              <span className="bg-interface" />
            </div>
            <h1 className="text-4xl text-foreground">
              Umer <AccentText tone="interface">Farooq</AccentText>
            </h1>
            <p className="mt-2 font-mono text-xs uppercase tracking-widest text-primary-type">
              {SITE.role}
            </p>
            <dl className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5">
              {CV_CONTACT.map((item, index) => {
                const contactTone = accent((["systems", "neural", "cryo", "interface", "neural"] as VisualAccent[])[index] ?? "interface");
                return (
                <div key={item.label} className="flex items-baseline gap-1.5">
                  <dt className="sr-only">{item.label}</dt>
                  <dd className="text-sm text-muted-foreground">
                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.href.startsWith("http") ? "_blank" : undefined}
                        rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className={`underline decoration-border underline-offset-2 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${contactTone.value}`}
                      >
                        {item.text}
                      </a>
                    ) : (
                      item.text
                    )}
                  </dd>
                </div>
                );
              })}
            </dl>
          </div>

          <CvSection id="cv-summary" title="Summary" tone="neural">
            <p className="max-w-prose text-sm leading-relaxed text-foreground">
              {PROFESSIONAL_SUMMARY}
            </p>
          </CvSection>

          <CvSection id="cv-experience" title="Experience" tone="interface">
            <ul className="flex flex-col gap-7">
              {EXPERIENCE.map((job) => (
                <li key={`${job.role}-${job.period}`} className="cv-entry">
                  <EntryHead title={job.role} meta={job.period} tone="interface" />
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {job.organisation} · {job.location}
                  </p>
                  <ul className="mt-2.5 flex flex-col gap-1.5">
                    {job.points.map((point) => (
                      <Bullet key={point} tone="interface">{point}</Bullet>
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

          <CvSection id="cv-education" title="Education" tone="systems">
            <div className="cv-entry">
              <EntryHead title={EDUCATION.degree} meta={EDUCATION.period} tone="systems" />
              <p className="mt-0.5 text-sm text-muted-foreground">{EDUCATION.institution}</p>
              <ul className="mt-2.5 flex flex-col gap-1.5">
                {CV_EDUCATION_HIGHLIGHTS.map((highlight) => (
                  <Bullet key={highlight} tone="systems">{highlight}</Bullet>
                ))}
              </ul>
              <div className="mt-3.5">
                <MonoLabel className="text-systems-type">Coursework</MonoLabel>
                <p className="mt-1.5 font-mono text-2xs leading-relaxed text-muted-foreground">
                  {COURSEWORK.join(" · ")}
                </p>
              </div>
            </div>
          </CvSection>

          <CvSection id="cv-projects" title={`Selected projects · ${projects.length}`} tone="interface">
            <ul className="flex flex-col gap-6">
              {projects.map((project) => {
                const projectToneName = getDomain(project.domains[0]).accent;
                const projectTone = accent(projectToneName);
                return (
                <li key={project.slug} className={`cv-entry border-l-2 pl-4 ${projectTone.panel}`}>
                  <EntryHead
                    tone={projectToneName}
                    title={
                      <Link
                        to={`/projects/${project.slug}`}
                        className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                    <p className="mt-1 text-sm text-award-type">{project.award}</p>
                  )}
                  {project.metrics && (
                    <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
                      {project.metrics.map((metric) => (
                        <div key={metric.label} className="flex items-baseline gap-1.5">
                          <dt className="label-mono">{metric.label}</dt>
                          <dd className={`readout text-xs ${projectTone.value}`}>
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
                );
              })}
            </ul>
            <div className="mt-6 border-t border-border pt-4">
              <p className="text-sm text-muted-foreground">
                {overflow} further projects — compilers, distributed hash tables, desktop
                applications, and games — are listed in full on the work page.
              </p>
              <div className="mt-2.5">
                <TextAction to="/projects" tone="interface">All {PROJECTS.length} projects</TextAction>
              </div>
            </div>
          </CvSection>

          <CvSection id="cv-skills" title="Skills" tone="neural">
            <dl className="cv-columns grid gap-5 sm:grid-cols-2">
              {SKILL_GROUPS.map((group) => {
                const tone = accent(group.accent);
                return (
                <div key={group.title} className={`cv-entry border-t pt-3 ${tone.panel}`}>
                  <dt className={`label-mono ${tone.label}`}>{group.title}</dt>
                  <dd className="mt-1.5">
                    <ul className="flex flex-col gap-1 text-sm leading-relaxed text-muted-foreground">
                      {group.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
                );
              })}
            </dl>
          </CvSection>

          <CvSection id="cv-certifications" title="Certifications" tone="award">
            <ul className="flex flex-col gap-3">
              {CERTIFICATIONS.map((cert) => (
                <li key={cert.title} className="cv-entry flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                  <span className="readout text-2xs text-award-type">{cert.year}</span>
                  <span className="text-sm text-foreground">{cert.title}</span>
                  <span className="text-sm text-muted-foreground">{cert.issuer}</span>
                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-2xs uppercase tracking-widest text-award-type transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Credential
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </CvSection>

          <CvSection id="cv-awards" title="Awards" tone="award">
            <ul className="flex flex-col gap-3">
              {AWARDS.map((award) => (
                <li key={award.title} className="cv-entry flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                  <span className="readout text-2xs text-award-type">{award.year}</span>
                  <span className="text-sm text-award-type">{award.title}</span>
                  <span className="text-sm text-muted-foreground">{award.detail}</span>
                </li>
              ))}
            </ul>
          </CvSection>

          <CvSection id="cv-languages" title="Languages" tone="cryo">
            <dl className="flex flex-wrap gap-x-6 gap-y-1.5">
              {LANGUAGES.map((entry) => (
                <div key={entry.language} className="flex items-baseline gap-2">
                  <dt className="text-sm text-foreground">{entry.language}</dt>
                  <dd className="label-mono text-cryo-type">{entry.proficiency}</dd>
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
