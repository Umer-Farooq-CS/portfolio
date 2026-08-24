import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { getFeaturedProjects } from "@/data/projects";
import { AccentText, MonoLabel } from "@/components/kit/Primitives";
import { useDocumentMeta } from "@/lib/meta";
import { getDomain } from "@/data/taxonomy";
import { accent } from "@/lib/accent";

/**
 * A 404 should give directions, not an apology. It offers the three most useful
 * exits rather than a single "go home" link.
 */
export default function NotFound() {
  const location = useLocation();
  const suggestions = getFeaturedProjects().slice(0, 2);

  useDocumentMeta({ title: "Page not found", path: location.pathname, noIndex: true });

  useEffect(() => {
    console.warn("404: no route matches", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[70vh] items-center pb-20 pt-28">
      <div className="container max-w-2xl">
        <MonoLabel className="text-interface-type">404 · route miss</MonoLabel>
        <h1 className="mt-4 text-4xl text-foreground">
          That page <AccentText tone="interface">isn&apos;t here</AccentText>
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Nothing matches{" "}
          <code className="readout rounded-sm border border-border bg-card px-1.5 py-0.5 text-xs">
            {location.pathname}
          </code>
          . It may have been renamed. These are the most likely places you were headed.
        </p>

        <ul className="mt-8 grid gap-2 sm:grid-cols-2">
          <li>
            <Link
              to="/projects"
              className="block rounded-md border border-interface/30 bg-interface/5 p-5 transition-colors hover:border-interface hover:bg-interface/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="label-mono text-interface-type">Everything</span>
              <span className="mt-1.5 block text-base font-semibold text-interface-type">
                All thirty projects
              </span>
            </Link>
          </li>
          <li>
            <Link
              to="/lab"
              className="block rounded-md border border-neural/30 bg-neural/5 p-5 transition-colors hover:border-neural hover:bg-neural/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="label-mono text-neural-type">Runnable</span>
              <span className="mt-1.5 block text-base font-semibold text-cryo-type">
                The lab
              </span>
            </Link>
          </li>
          {suggestions.map((project) => {
            const tone = accent(getDomain(project.domains[0]).accent);
            return (
            <li key={project.slug}>
              <Link
                to={`/projects/${project.slug}`}
                className={`block rounded-md border bg-card p-5 transition-colors hover:bg-surface-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${tone.panel}`}
              >
                <span className={`label-mono ${tone.label}`}>Featured</span>
                <span className={`mt-1.5 block text-base font-semibold ${tone.value}`}>
                  {project.title}
                </span>
              </Link>
            </li>
            );
          })}
        </ul>

        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-md bg-thermal px-5 py-2.5 font-mono text-2xs uppercase tracking-widest text-on-thermal transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}
