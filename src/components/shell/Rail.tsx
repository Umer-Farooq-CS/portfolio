import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useIslamabadClock } from "@/lib/clock";
import { sectionIndex, sectionsForRoute } from "@/lib/sections";

/**
 * The rail is the site's status display and its section index at once — the one
 * element that earns its place by doing two jobs. Desktop only; on smaller
 * screens the scroll progress bar and the top nav cover the same ground.
 */
export default function Rail() {
  const { pathname } = useLocation();
  const sections = sectionsForRoute(pathname);
  const clock = useIslamabadClock();
  const [active, setActive] = useState<string | null>(sections[0]?.id ?? null);
  const [cores, setCores] = useState<number | null>(null);

  useEffect(() => {
    setCores(navigator.hardwareConcurrency ?? null);
  }, []);

  // Track which section is in view so the index reads like a position indicator.
  useEffect(() => {
    if (sections.length === 0) return;
    const nodes = sections
      .map((section) => document.getElementById(section.id))
      .filter((node): node is HTMLElement => node !== null);
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5] },
    );
    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, [pathname, sections]);

  if (sections.length === 0) return null;

  return (
    <aside
      aria-label="Page sections and status"
      className="pointer-events-none fixed left-0 top-0 z-30 hidden h-screen w-24 flex-col justify-between py-6 xl:flex"
    >
      <nav aria-label="Sections" className="pointer-events-auto mt-24 pl-6">
        <ul className="flex flex-col gap-3">
          {sections.map((section, index) => {
            const isActive = active === section.id;
            return (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  aria-current={isActive ? "true" : undefined}
                  className={`group flex items-baseline gap-1.5 font-mono text-2xs uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    isActive ? "text-primary-type" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="readout">{sectionIndex(index)}</span>
                  <span
                    aria-hidden="true"
                    className={`h-px transition-all duration-300 ${
                      isActive ? "w-3 bg-thermal" : "w-1.5 bg-border group-hover:w-3"
                    }`}
                  />
                  <span>{section.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Live readouts: where I am, what time it is there, what this machine has. */}
      <div className="pointer-events-auto flex flex-col gap-2.5 pl-6">
        <dl className="flex flex-col gap-2.5">
          <div>
            <dt className="label-mono">Local</dt>
            <dd className="readout text-xs text-foreground">
              {clock.hh}:{clock.mm} {clock.label}
            </dd>
          </div>
          <div>
            <dt className="label-mono">Cores</dt>
            <dd className="readout text-xs text-foreground">{cores ?? "—"}</dd>
          </div>
        </dl>
        <p className="flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${clock.awake ? "bg-thermal" : "bg-graphite"}`}
            aria-hidden="true"
          />
          <span className="label-mono">{clock.awake ? "Open" : "Asleep"}</span>
        </p>
      </div>
    </aside>
  );
}
