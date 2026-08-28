import { Link, useLocation } from "react-router-dom";
import { Github, Linkedin, Mail, Phone } from "lucide-react";
import { SITE_LINKS } from "@/data/siteLinks";
import { useIslamabadClock } from "@/lib/clock";
import { MonoLabel } from "@/components/kit/Primitives";
import { NOTES_ARE_PUBLIC } from "@/data/notes";
import { PROFILES } from "@/data/profiles";
import { accent, type VisualAccent } from "@/lib/accent";
import { pathForProfile, useActiveProfile } from "@/lib/profile";
import UFMark from "@/components/brand/UFMark";

const SOCIAL: { label: string; href: string; icon: typeof Github; tone: VisualAccent }[] = [
  { label: "GitHub", href: SITE_LINKS.github, icon: Github, tone: "interface" },
  { label: "LinkedIn", href: SITE_LINKS.linkedin, icon: Linkedin, tone: "neural" },
  { label: "Email", href: SITE_LINKS.email, icon: Mail, tone: "systems" },
  { label: "Phone", href: SITE_LINKS.phone, icon: Phone, tone: "cryo" },
];

const PAGES: { label: string; to: string; tone: VisualAccent }[] = [
  { label: "Work", to: "/projects", tone: "interface" },
  { label: "Services", to: "/services", tone: "systems" },
  { label: "About", to: "/about", tone: "systems" },
  { label: "Lab", to: "/lab", tone: "neural" },
  { label: "CV", to: "/cv", tone: "cryo" },
  { label: "Uses", to: "/uses", tone: "thermal" },
  ...(NOTES_ARE_PUBLIC ? [{ label: "Notes", to: "/notes", tone: "neural" as const }] : []),
];

export default function SiteFooter() {
  const clock = useIslamabadClock();
  const { pathname } = useLocation();
  const profile = useActiveProfile();
  const onSelector = pathname === "/";

  return (
    <footer className="mt-24 border-t border-border bg-surface-alt/25">
      <div aria-hidden="true" className="grid h-1 grid-cols-6">
        <span className="bg-thermal" />
        <span className="bg-cryo" />
        <span className="bg-neural" />
        <span className="bg-systems" />
        <span className="bg-interface" />
        <span className="bg-award" />
      </div>
      <div className="container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <UFMark height={32} />
            <span className="font-display text-sm font-semibold text-foreground">Umer Farooq</span>
          </div>
          {onSelector ? (
            <>
              <p className="mt-2 font-mono text-2xs uppercase tracking-widest text-primary-type">
                One person · three lenses
              </p>
              <p className="mt-3 max-w-[26ch] text-xs leading-relaxed text-muted-foreground">
                HPC and AI development, infrastructure, and solution architecture — the same
                evidence, read differently.
              </p>
            </>
          ) : (
            <>
              <p className="mt-2 font-mono text-2xs uppercase tracking-widest text-primary-type">
                Performance · simulation · validation
              </p>
              <p className="mt-3 max-w-[26ch] text-xs leading-relaxed text-muted-foreground">
                High-performance and <span className="text-primary-type">GPU computing</span>,{" "}
                <span className="text-cryo-type">quantum simulation</span>, and{" "}
                <span className="text-neural-type">AI systems</span> that hold up under validation.
              </p>
            </>
          )}
        </div>

        <div>
          <MonoLabel className="text-interface-type">{onSelector ? "Profiles" : "Pages"}</MonoLabel>
          <ul className="mt-3 flex flex-col gap-2">
            {onSelector
              ? PROFILES.map((viewProfile) => {
                  const tone = accent(viewProfile.accent);
                  return (
                    <li key={viewProfile.id}>
                      <Link
                        to={`/${viewProfile.path}`}
                        className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${tone.mark}`} />
                        <span className={tone.hoverText}>{viewProfile.navLabel}</span>
                      </Link>
                    </li>
                  );
                })
              : PAGES.map((page) => {
                  const tone = accent(page.tone);
                  return (
                    <li key={page.to}>
                      <Link
                        to={pathForProfile(page.to, profile.id)}
                        className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${tone.mark}`} />
                        <span className={tone.hoverText}>{page.label}</span>
                      </Link>
                    </li>
                  );
                })}
          </ul>
        </div>

        <div>
          <MonoLabel className="text-neural-type">Elsewhere</MonoLabel>
          <ul className="mt-3 flex flex-col gap-2">
            {SOCIAL.map(({ label, href, icon: Icon, tone: toneName }) => (
              <li key={label}>
                <a
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Icon size={13} className={accent(toneName).value} aria-hidden="true" />
                  <span className={accent(toneName).hoverText}>{label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <MonoLabel className="text-systems-type">Status</MonoLabel>
          <dl className="mt-3 flex flex-col gap-2 text-sm">
            <div className="flex items-baseline gap-2">
              <dt className="sr-only">Local time</dt>
              <dd className="readout text-systems-type">
                {clock.hh}:{clock.mm} {clock.label}
              </dd>
            </div>
            <div className="flex items-baseline gap-2">
              <dt className="sr-only">Location</dt>
              <dd className="text-interface-type">{SITE_LINKS.location}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full ${clock.awake ? "bg-systems" : "bg-graphite"}`}
                aria-hidden="true"
              />
              <dt className="sr-only">Availability</dt>
              <dd className="label-mono text-systems-type">Open to work</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="container flex flex-wrap items-center justify-between gap-3 border-t border-border py-5">
        <p className="readout text-2xs text-muted-foreground">
          © {new Date().getFullYear()} Umer Farooq
        </p>
        <p className="readout text-2xs text-muted-foreground">
          Built with React, Vite, and Tailwind · source on{" "}
          <a
            href={`${SITE_LINKS.github}/portfolio`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-interface-type underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            GitHub
          </a>
        </p>
      </div>
    </footer>
  );
}
