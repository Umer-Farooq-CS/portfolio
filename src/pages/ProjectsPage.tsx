import { useDeferredValue, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { PROJECTS, getFeaturedProjects, getTechnologyFacets } from "@/data/projects";
import { DOMAINS, getDomain, type Domain } from "@/data/taxonomy";
import { accent, type VisualAccent } from "@/lib/accent";
import { AccentText, ChapterHeader, MonoLabel } from "@/components/kit/Primitives";
import ProjectCard from "@/components/kit/ProjectCard";
import { useDocumentMeta } from "@/lib/meta";
import { routeMeta } from "@/data/routeMeta";
import { pathForProfile, useActiveProfile } from "@/lib/profile";

/**
 * Thirty projects is too many to read as a wall, so the page opens with a
 * deliberately curated view and keeps the full archive one explicit choice away.
 *
 * Grouping comes from the closed domain taxonomy, which is what makes it
 * impossible for a project to be missing here — the previous version iterated a
 * hand-written list of category strings and silently dropped two.
 */
export default function ProjectsPage() {
  const [view, setView] = useState<"best" | "all">("best");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState<Domain | "all">("all");
  const [tech, setTech] = useState<string | null>(null);
  const profile = useActiveProfile();
  const basePath = pathForProfile("/", profile.id);

  const deferredQuery = useDeferredValue(query);

  useDocumentMeta({ ...routeMeta("/projects"), path: "/projects" });

  const topTech = useMemo(() => getTechnologyFacets().slice(0, 14), []);
  const featured = useMemo(() => getFeaturedProjects(), []);

  const filtered = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    const candidates = view === "best" ? featured : PROJECTS;
    return candidates.filter((project) => {
      if (domain !== "all" && !project.domains.includes(domain)) return false;
      if (tech && !project.technologies.includes(tech)) return false;
      if (!needle) return true;
      const haystack = [
        project.title,
        project.subtitle,
        project.tagline ?? "",
        project.category,
        project.technologies.join(" "),
        project.description.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [deferredQuery, domain, featured, tech, view]);

  // Group the filtered set by primary domain, in taxonomy order.
  const groups = useMemo(() => {
    return DOMAINS.map((entry) => ({
      domain: entry.id,
      projects: filtered.filter((project) => project.domains[0] === entry.id),
    })).filter((group) => group.projects.length > 0);
  }, [filtered]);

  const domainCounts = useMemo(() => {
    const counts = new Map<Domain, number>();
    for (const entry of DOMAINS) {
      counts.set(
        entry.id,
        PROJECTS.filter((project) => project.domains.includes(entry.id)).length,
      );
    }
    return counts;
  }, []);

  const hasFilters = query !== "" || domain !== "all" || tech !== null;
  const clearAll = () => {
    setQuery("");
    setDomain("all");
    setTech(null);
  };

  const showAllForFiltering = () => setView("all");

  return (
    <div className="pb-20 pt-28 lg:pt-36">
      <div className="container">
        <ChapterHeader
          eyebrow="Work"
          title={
            <>
              <AccentText tone="interface">Best work first</AccentText>. Every build behind it.
            </>
          }
          lede="Start with the two projects that best show the range, then open the full archive to search HPC, quantum, AI, systems, and product work."
          as="h1"
          tone="interface"
        />

        {/* Controls */}
        <div className="mt-12 border-y border-border py-5">
          <div className="flex flex-col gap-5">
            <div>
              <MonoLabel>View</MonoLabel>
              <div
                className="mt-2 grid max-w-md grid-cols-2 gap-1.5"
                role="group"
                aria-label="Project view"
              >
                <button
                  type="button"
                  onClick={() => {
                    setView("best");
                    clearAll();
                  }}
                  aria-pressed={view === "best"}
                  className={`min-h-11 rounded-md border px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    view === "best"
                      ? "border-interface bg-interface/10 text-interface-type"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="block font-mono text-2xs uppercase tracking-widest">Best work</span>
                  <span className="readout mt-1 block text-2xs">{featured.length} case studies</span>
                </button>
                <button
                  type="button"
                  onClick={() => setView("all")}
                  aria-pressed={view === "all"}
                  className={`min-h-11 rounded-md border px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    view === "all"
                      ? "border-interface bg-interface/10 text-interface-type"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="block font-mono text-2xs uppercase tracking-widest">All projects</span>
                  <span className="readout mt-1 block text-2xs">{PROJECTS.length} total</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setView("all");
                setFiltersOpen((open) => !open);
              }}
              aria-expanded={filtersOpen}
              aria-controls="project-filters"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-interface/30 px-4 py-2 font-mono text-2xs uppercase tracking-widest text-interface-type focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:hidden"
            >
              <SlidersHorizontal size={13} aria-hidden="true" />
              {filtersOpen ? "Hide archive filters" : "Search and filter archive"}
            </button>

            <div
              id="project-filters"
              className={`${filtersOpen ? "flex" : "hidden"} flex-col gap-5 sm:flex`}
            >
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[14rem] flex-1">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => {
                    showAllForFiltering();
                    setQuery(event.target.value);
                  }}
                  placeholder="Search titles, tech, descriptions…"
                  aria-label="Search projects"
                  className="min-h-11 w-full rounded-md border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-interface focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <p className="readout shrink-0 text-2xs text-interface-type">
                {filtered.length} of {view === "best" ? featured.length : PROJECTS.length}
              </p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-md border border-border px-3 py-2 font-mono text-2xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X size={11} aria-hidden="true" />
                  Clear
                </button>
              )}
            </div>

            <div>
              <MonoLabel>Domain</MonoLabel>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <FacetButton
                  active={domain === "all"}
                  onClick={() => {
                    showAllForFiltering();
                    setDomain("all");
                  }}
                >
                  All <span className="readout ml-1">{PROJECTS.length}</span>
                </FacetButton>
                {DOMAINS.map((entry) => (
                  <FacetButton
                    key={entry.id}
                    active={domain === entry.id}
                    onClick={() => {
                      showAllForFiltering();
                      setDomain(domain === entry.id ? "all" : entry.id);
                    }}
                    tone={entry.accent}
                  >
                    {entry.label}
                    <span className="readout ml-1">{domainCounts.get(entry.id)}</span>
                  </FacetButton>
                ))}
              </div>
            </div>

            <div>
              <MonoLabel>Technology</MonoLabel>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {topTech.map((facet) => (
                  <FacetButton
                    key={facet.tech}
                    active={tech === facet.tech}
                    onClick={() => {
                      showAllForFiltering();
                      setTech(tech === facet.tech ? null : facet.tech);
                    }}
                  >
                    {facet.tech}
                    <span className="readout ml-1">{facet.count}</span>
                  </FacetButton>
                ))}
              </div>
            </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {groups.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-xl text-foreground">Nothing matches that</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try a broader search, or clear the filters to see the current view.
            </p>
            <button
              type="button"
              onClick={clearAll}
              className="mt-5 min-h-11 rounded-md border border-interface/30 px-4 py-2 font-mono text-2xs uppercase tracking-widest text-interface-type transition-colors hover:border-interface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="mt-12 flex flex-col gap-14">
            {groups.map(({ domain: domainId, projects }, groupIndex) => {
              const meta = getDomain(domainId);
              const tone = accent(meta.accent);
              return (
                <section key={domainId} aria-labelledby={`domain-${domainId}`}>
                  <div className="flex flex-wrap items-baseline gap-3 border-b border-border pb-3">
                    <h2
                      id={`domain-${domainId}`}
                      className={`font-mono text-2xs uppercase tracking-widest ${tone.label}`}
                    >
                      {meta.label}
                    </h2>
                    <span className={`readout text-2xs ${tone.value}`}>{projects.length}</span>
                    <p className="ml-auto hidden max-w-md text-right text-xs text-muted-foreground sm:block">
                      {meta.blurb}
                    </p>
                  </div>

                  <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project, index) => (
                      <ProjectCard
                        key={project.slug}
                        project={project}
                        profile={profile}
                        basePath={basePath}
                        variant="grid"
                        animationDelay={Math.min(groupIndex * 0.03 + index * 0.02, 0.3)}
                      />
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function FacetButton({
  active,
  onClick,
  children,
  tone = "interface",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  tone?: VisualAccent;
}) {
  const toneClasses = accent(tone);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-11 rounded-md border px-3 py-2 font-mono text-2xs uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        active
          ? `${toneClasses.selected} ${toneClasses.value}`
          : "border-border text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
