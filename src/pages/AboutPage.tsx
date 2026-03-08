import { motion } from "framer-motion";
import { Award, GraduationCap, Code2, Globe2, CheckCircle2, Github, Linkedin, Mail } from "lucide-react";
import { SITE_LINKS } from "@/data/siteLinks";
import { PROFESSIONAL_SUMMARY, EDUCATION, CERTIFICATIONS, SKILL_GROUPS } from "@/data/profile";

export default function AboutPage() {
  return (
    <div className="pt-24 lg:pt-28 pb-16">
      <div className="container px-4 sm:px-6 lg:px-8 max-w-5xl">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold uppercase tracking-widest">
            <Globe2 size={13} />
            About
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
            Umer <span className="text-gradient">Farooq</span>
          </h1>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            AI & HPC Infrastructure Engineer · Islamabad, Pakistan
          </p>

          {/* Quick contacts */}
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={SITE_LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <Github size={14} />
              github.com/Umer-Farooq-CS
            </a>
            <a
              href={SITE_LINKS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <Linkedin size={14} />
              LinkedIn
            </a>
            <a
              href={SITE_LINKS.email}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <Mail size={14} />
              Email
            </a>
          </div>
        </motion.header>

        {/* Summary + education + certifications */}
        <div className="grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-10 mb-12">
          {/* Summary + education */}
          <motion.section
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="space-y-6"
          >
            <div className="card-surface border border-border rounded-2xl p-6 shadow-card">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center flex-shrink-0">
                  <Code2 size={20} className="text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">
                    Professional Summary
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {PROFESSIONAL_SUMMARY}
                  </p>
                </div>
              </div>
            </div>

            <div className="card-surface border border-border rounded-2xl p-6 shadow-card">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <GraduationCap size={18} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">
                    Education
                  </h2>
                  <p className="mt-2 text-sm font-semibold text-foreground">{EDUCATION.degree}</p>
                  <p className="text-xs text-muted-foreground">{EDUCATION.institution}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{EDUCATION.period}</p>
                </div>
              </div>
              <ul className="mt-3 space-y-1.5">
                {EDUCATION.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 size={12} className="text-primary mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.section>

          {/* Certifications */}
          <motion.section
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <Award size={18} className="text-primary" />
              <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">
                Professional Certifications
              </h2>
            </div>
            <div className="space-y-3">
              {CERTIFICATIONS.map((cert) => (
                <div
                  key={cert.title}
                  className="card-surface border border-border rounded-xl p-4 flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-primary">{cert.year}</p>
                    <p className="text-[11px] text-muted-foreground">{cert.issuer}</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground leading-snug">
                    {cert.title}
                  </p>
                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 text-xs text-primary hover:underline"
                    >
                      View credential
                    </a>
                  )}
                </div>
              ))}
            </div>
          </motion.section>
        </div>

        {/* Skills */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-widest text-primary mb-4">
            Core Technical Skills
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {SKILL_GROUPS.map((group) => (
              <div
                key={group.title}
                className="card-surface border border-border rounded-2xl p-5 flex flex-col gap-2"
              >
                <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  {group.title}
                </p>
                <ul className="space-y-1.5">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed"
                    >
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}

