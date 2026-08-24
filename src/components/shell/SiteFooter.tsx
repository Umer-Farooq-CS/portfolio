import { Link } from "react-router-dom";
import { Github, Linkedin, Mail, Phone } from "lucide-react";
import { SITE_LINKS } from "@/data/siteLinks";
import { useIslamabadClock } from "@/lib/clock";
import { MonoLabel } from "@/components/kit/Primitives";
import { NOTES_ARE_PUBLIC } from "@/data/notes";

const SOCIAL = [
  { label: "GitHub", href: SITE_LINKS.github, icon: Github },
  { label: "LinkedIn", href: SITE_LINKS.linkedin, icon: Linkedin },
  { label: "Email", href: SITE_LINKS.email, icon: Mail },
  { label: "Phone", href: SITE_LINKS.phone, icon: Phone },
];

const PAGES = [
  { label: "Work", to: "/projects" },
  { label: "Services", to: "/services" },
  { label: "About", to: "/about" },
  { label: "Lab", to: "/lab" },
  { label: "CV", to: "/cv" },
  { label: "Uses", to: "/uses" },
  ...(NOTES_ARE_PUBLIC ? [{ label: "Notes", to: "/notes" }] : []),
];

export default function SiteFooter() {
  const clock = useIslamabadClock();

  return (
    <footer className="mt-24 border-t border-border">
      <div className="container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="flex h-7 w-7 items-center justify-center rounded-sm bg-thermal font-mono text-2xs font-semibold text-on-thermal"
            >
              UF
            </span>
            <span className="font-display text-sm font-semibold text-foreground">Umer Farooq</span>
          </div>
          <p className="mt-3 max-w-[26ch] text-xs leading-relaxed text-muted-foreground">
            High-performance and GPU computing, quantum simulation, and AI systems that hold up under
            validation.
          </p>
        </div>

        <div>
          <MonoLabel>Pages</MonoLabel>
          <ul className="mt-3 flex flex-col gap-2">
            {PAGES.map((page) => (
              <li key={page.to}>
                <Link
                  to={page.to}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {page.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <MonoLabel>Elsewhere</MonoLabel>
          <ul className="mt-3 flex flex-col gap-2">
            {SOCIAL.map(({ label, href, icon: Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Icon size={13} aria-hidden="true" />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <MonoLabel>Status</MonoLabel>
          <dl className="mt-3 flex flex-col gap-2 text-sm">
            <div className="flex items-baseline gap-2">
              <dt className="sr-only">Local time</dt>
              <dd className="readout text-foreground">
                {clock.hh}:{clock.mm} {clock.label}
              </dd>
            </div>
            <div className="flex items-baseline gap-2">
              <dt className="sr-only">Location</dt>
              <dd className="text-muted-foreground">{SITE_LINKS.location}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full ${clock.awake ? "bg-thermal" : "bg-graphite"}`}
                aria-hidden="true"
              />
              <dt className="sr-only">Availability</dt>
              <dd className="label-mono">Open to work</dd>
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
            className="text-primary-type underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            GitHub
          </a>
        </p>
      </div>
    </footer>
  );
}
