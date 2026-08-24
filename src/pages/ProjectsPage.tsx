import { useDeferredValue, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowUpRight, Search, Trophy, X } from "lucide-react";
import { PROJECTS, getTechnologyFacets } from "@/data/projects";
import { DOMAINS, getDomain, type Domain } from "@/data/taxonomy";
import { accent } from "@/lib/accent";
import { ChapterHeader, MonoLabel, Tag } from "@/components/kit/Primitives";
import { useDocumentMeta } from "@/lib/meta";
import { routeMeta } from "@/data/routeMeta";
import { useMotionPolicy } from "@/lib/motion-policy";

/**
 * Thirty projects is too many to read as a wall, so this page is a filter first
 * and a list second: search, domain, and technology facets, with live counts.
 *
 * Grouping comes from the closed domain taxonomy, which is what makes it
 * impossible for a project to be missing here — the previous version iterated a
 * hand-written list of category strings and silently dropped two.
 */
export default function ProjectsPage() {
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState<Domain | "all">("all");
  const [tech, setTech] = useState<string | null>(null);
  const { enabled, duration } = useMotionPolicy();

  const deferredQuery = useDeferredValue(query);

  useDocumentMeta({ ...routeMeta("/projects"), path: "/projects" });

  const topTech = useMemo(() => getTechnologyFacets().slice(0, 14), []);

  const filtered = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    return PROJECTS.filter((project) => {
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
  }, [deferredQuery, domain, tech]);

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

  return (
    <div className="pb-20 pt-28 lg:pt-36">
      <div className="container">
        <ChapterHeader
          eyebrow="Work"
          title="Thirty projects, filtered how you like"
          lede="HPC and GPU acceleration, quantum simulation, AI systems, compilers, distributed systems, and full-stack builds. Most have a repository."
          as="h1"
        />

        {/* Controls */}
        <div className="mt-12 border-y border-border py-5">
          <div className="flex flex-col gap-5">
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
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search titles, tech, descriptions…"
                  aria-label="Search projects"
                  className="w-full rounded-md border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-thermal focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <p className="readout shrink-0 text-2xs text-muted-foreground">
                {filtered.length} of {PROJECTS.length}
              </p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 font-mono text-2xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X size={11} aria-hidden="true" />
                  Clear
                </button>
              )}
            </div>

            <div>
              <MonoLabel>Domain</MonoLabel>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <FacetButton active={domain === "all"} onClick={() => setDomain("all")}>
                  All <span className="readout ml-1 text-muted-foreground">{PROJECTS.length}</span>
                </FacetButton>
                {DOMAINS.map((entry) => (
                  <FacetButton
                    key={entry.id}
                    active={domain === entry.id}
                    onClick={() => setDomain(domain === entry.id ? "all" : entry.id)}
                  >
                    {entry.label}
                    <span className="readout ml-1 text-muted-foreground">{domainCounts.get(entry.id)}</span>
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
                    onClick={() => setTech(tech === facet.tech ? null : facet.tech)}
                  >
                    {facet.tech}
                    <span className="readout ml-1 text-muted-foreground">{facet.count}</span>
                  </FacetButton>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {groups.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-xl text-foreground">Nothing matches that</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try a broader search, or clear the filters to see all {PROJECTS.length}.
            </p>
            <button
              type="button"
              onClick={clearAll}
              className="mt-5 rounded-md border border-border px-4 py-2 font-mono text-2xs uppercase tracking-widest text-foreground transition-colors hover:border-thermal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                    <span className="readout text-2xs text-muted-foreground">{projects.length}</span>
                    <p className="ml-auto hidden max-w-md text-right text-xs text-muted-foreground sm:block">
                      {meta.blurb}
                    </p>
                  </div>

                  <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project, index) => (
                      <motion.li
                        key={project.slug}
                        initial={enabled ? { opacity: 0 } : { opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{
                          duration: duration(0.4),
                          delay: enabled ? Math.min(groupIndex * 0.03 + index * 0.02, 0.3) : 0,
                        }}
                      >
                        <Link
                          to={`/projects/${project.slug}`}
                          className="group flex h-full flex-col rounded-md border border-border bg-card p-5 transition-colors hover:border-thermal/40 hover:bg-surface-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-base font-semibold leading-snug text-foreground group-hover:text-primary-type">
                              {project.title}
                            </h3>
                            <ArrowUpRight
                              size={14}
                              className="mt-1 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                              aria-hidden="true"
                            />
                          </div>
                          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                            {project.tagline ?? project.subtitle}
                          </p>
                          {project.award && (
                            <p className="mt-3 flex items-start gap-1.5 text-2xs text-primary-type">
                              <Trophy size={11} className="mt-0.5 shrink-0" aria-hidden="true" />
                              {project.award}
                            </p>
                          )}
                          <div className="mt-auto pt-4">
                            <div className="flex flex-wrap gap-1">
                              {project.technologies.slice(0, 3).map((item) => (
                                <Tag key={item}>{item}</Tag>
                              ))}
                              {project.technologies.length > 3 && (
                                <span className="readout self-center text-2xs text-muted-foreground">
                                  +{project.technologies.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      </motion.li>
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
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-md border px-2.5 py-1 font-mono text-2xs uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        active
          ? "border-thermal bg-thermal/10 text-primary-type"
          : "border-border text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
