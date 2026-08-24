import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { TechnologyMark } from "@/components/technology/TechnologyMark";
import {
  TECHNOLOGY_RAIL_ITEMS,
  TECHNOLOGY_RAIL_PROJECT_COUNT,
} from "@/data/technologyMarks";
import { accent } from "@/lib/accent";
import { useMotionPolicy } from "@/lib/motion-policy";
import styles from "./TechLogoRail.module.css";

function TechnologyLoop({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <ul
      className={`${styles.group} ${duplicate ? styles.duplicate : ""}`}
      aria-label={duplicate ? undefined : "Technologies used in portfolio projects"}
      aria-hidden={duplicate || undefined}
      data-technology-loop={duplicate ? "duplicate" : "primary"}
    >
      {TECHNOLOGY_RAIL_ITEMS.map((item) => {
        const tone = accent(item.tone);
        return (
          <li
            key={item.technology}
            className={`${styles.item} ${tone.value}`}
            aria-label={`${item.label}, used in ${item.projectCount} ${item.projectCount === 1 ? "project" : "projects"}`}
          >
            <TechnologyMark technology={item.technology} size="large" />
            <span className="font-mono text-xs font-medium uppercase tracking-wider">
              {item.label}
            </span>
            <span
              aria-hidden="true"
              className="readout border-l border-border pl-2 text-2xs text-muted-foreground"
            >
              {String(item.projectCount).padStart(2, "0")}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * A measured capability strip, not a sponsor marquee: every mark is backed by
 * at least one project and its readout is calculated from projects.ts.
 */
export default function TechLogoRail() {
  const { enabled: motionEnabled } = useMotionPolicy();
  const viewportRef = useRef<HTMLDivElement>(null);
  const [userPaused, setUserPaused] = useState(false);
  const [inViewport, setInViewport] = useState(true);
  const [pageVisible, setPageVisible] = useState(
    () => typeof document === "undefined" || document.visibilityState !== "hidden",
  );

  const saveData =
    typeof navigator !== "undefined" &&
    Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
  const canAnimate = motionEnabled && !saveData;

  useEffect(() => {
    if (!canAnimate) return;
    const node = viewportRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setInViewport(Boolean(entry?.isIntersecting)),
      { threshold: 0.08 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [canAnimate]);

  useEffect(() => {
    if (!canAnimate || typeof document === "undefined") return;
    const onVisibilityChange = () => setPageVisible(document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [canAnimate]);

  const running = canAnimate && !userPaused && inViewport && pageVisible;

  return (
    <section
      aria-labelledby="technology-rail-title"
      className={`${styles.rail} border-t border-border bg-surface-alt/20 py-4`}
    >
      <div className="container flex flex-wrap items-center justify-between gap-x-5 gap-y-2">
        <div className="flex items-baseline gap-2.5">
          <h2 id="technology-rail-title" className="label-mono text-interface-type">
            Tools in project work
          </h2>
          <span aria-hidden="true" className="h-px w-5 bg-interface" />
        </div>

        <div className="flex items-center gap-3">
          <p className="readout text-2xs text-muted-foreground">
            {TECHNOLOGY_RAIL_ITEMS.length} indexed tools · {TECHNOLOGY_RAIL_PROJECT_COUNT} projects
          </p>
          {canAnimate && (
            <button
              type="button"
              onClick={() => setUserPaused((paused) => !paused)}
              aria-pressed={userPaused}
              aria-label={userPaused ? "Resume technology rail" : "Pause technology rail"}
              className={`${styles.motionControl} inline-flex min-h-11 items-center gap-1.5 rounded-md border border-border px-3 py-2 font-mono text-2xs uppercase tracking-widest text-muted-foreground transition-colors hover:border-interface hover:text-interface-type focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
            >
              {userPaused ? <Play size={11} aria-hidden="true" /> : <Pause size={11} aria-hidden="true" />}
              {userPaused ? "Resume" : "Pause"}
            </button>
          )}
        </div>
      </div>

      <div
        ref={viewportRef}
        className={styles.viewport}
        data-running={running}
        data-static={!canAnimate}
      >
        <div className={styles.track}>
          <TechnologyLoop />
          <TechnologyLoop duplicate />
        </div>
      </div>
    </section>
  );
}
