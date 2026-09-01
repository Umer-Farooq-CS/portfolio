import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import type { VisualAccent } from "@/lib/accent";
import { useMotionPolicy } from "@/lib/motion-policy";
import { sectionsForRoute } from "@/lib/sections";
import { telemetryToneForPath } from "@/lib/telemetry";
import { useActiveProfile } from "@/lib/profile";
import styles from "./TelemetryBackdrop.module.css";

/**
 * How far each plane travels over an entire page, in pixels.
 *
 * The depth is in the difference, not the distance. The grid is the far wall
 * and only settles; the traces sit a little in front of it; the content travels
 * a whole page past both. Each figure stays well under one grid cell (64px), so
 * a long page reads as layered without the field ever being caught moving.
 */
const GRID_TRAVEL = -12;
const FIELD_TRAVEL = -38;

/**
 * The trace field also opens by 2% across the same distance — enough that the
 * two planes are not glued together, far too little to register as a zoom.
 */
const FIELD_SCALE = 1.02;

/**
 * A restrained, code-native field behind the site shell. The traces read as a
 * distributed pipeline: sparse nodes hand work across measured paths. On the
 * homepage the field follows the chapter legend; other routes use their domain
 * tone. The visual is deliberately inert to input and has no content meaning.
 *
 * Scroll gives it depth rather than decoration: the grid and the trace field
 * drift a few tens of pixels at different rates, which is only legible as the
 * page being layered. Everything moves on `transform` alone — the backdrop is
 * fixed and full-viewport, so a repaint here would be the expensive kind.
 */
export default function TelemetryBackdrop() {
  const { pathname } = useLocation();
  const profile = useActiveProfile();
  const sections = useMemo(
    () => sectionsForRoute(pathname, profile.homeChapterOrder),
    [pathname, profile.homeChapterOrder],
  );
  const routeTone = telemetryToneForPath(pathname);
  const [tone, setTone] = useState<VisualAccent>(sections[0]?.tone ?? routeTone);

  const { enabled, spring } = useMotionPolicy();
  const { scrollY, scrollYProgress } = useScroll();
  // One spring feeds both planes, so the whole effect costs a single smoothed
  // value per frame. `heavy` is overdamped: the planes settle behind the page
  // without ever overshooting it, which is what makes them read as further away.
  const travel = useSpring(scrollYProgress, enabled ? spring.heavy : { duration: 0 });
  const gridY = useTransform(travel, [0, 1], [0, GRID_TRAVEL]);
  const fieldY = useTransform(travel, [0, 1], [0, FIELD_TRAVEL]);
  const fieldScale = useTransform(travel, [0, 1], [1, FIELD_SCALE]);

  useEffect(() => {
    setTone(sections[0]?.tone ?? routeTone);

    if (sections.length === 0) return;

    const toneById = new Map(sections.map((section) => [section.id, section.tone]));
    const nodes = sections
      .map((section) => document.getElementById(section.id))
      .filter((node): node is HTMLElement => node !== null);

    if (nodes.length === 0) return;

    let frame: number | null = null;
    const updateTone = () => {
      frame = null;
      const focusLine = window.innerHeight * 0.46;
      const active =
        nodes.find((node) => {
          const rect = node.getBoundingClientRect();
          return rect.top <= focusLine && rect.bottom >= focusLine;
        }) ??
        nodes.reduce((nearest, node) => {
          const nodeDistance = Math.abs(node.getBoundingClientRect().top - focusLine);
          const nearestDistance = Math.abs(nearest.getBoundingClientRect().top - focusLine);
          return nodeDistance < nearestDistance ? node : nearest;
        });
      const nextTone = toneById.get(active.id);
      if (nextTone) setTone(nextTone);
    };
    const scheduleToneUpdate = () => {
      if (frame !== null) return;
      if (typeof window.requestAnimationFrame === "function") {
        frame = window.requestAnimationFrame(updateTone);
      } else {
        updateTone();
      }
    };

    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(scheduleToneUpdate, {
            rootMargin: "-40% 0px -40% 0px",
            threshold: [0, 0.01],
          });

    for (const node of nodes) observer?.observe(node);
    // The chapter tone tracks scroll through the motion value the parallax is
    // already reading, rather than a second listener on the window.
    const unwatchScroll = scrollY.on("change", scheduleToneUpdate);
    window.addEventListener("resize", scheduleToneUpdate);
    scheduleToneUpdate();

    return () => {
      observer?.disconnect();
      unwatchScroll();
      window.removeEventListener("resize", scheduleToneUpdate);
      if (frame !== null && typeof window.cancelAnimationFrame === "function") {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [pathname, routeTone, scrollY, sections]);

  // Reduced motion gets the backdrop exactly as it was: no motion values bound,
  // no promoted layers, nothing for the compositor to hold behind every page.
  const gridClass = enabled
    ? `telemetry-backdrop__grid ${styles.farPlane}`
    : "telemetry-backdrop__grid";
  const fieldClass = enabled
    ? `telemetry-backdrop__field ${styles.nearPlane}`
    : "telemetry-backdrop__field";

  return (
    <div
      className="telemetry-backdrop"
      data-accent={tone}
      data-parallax={enabled ? "true" : "false"}
      aria-hidden="true"
    >
      <motion.div className={gridClass} style={enabled ? { y: gridY } : undefined} />
      <motion.svg
        className={fieldClass}
        style={enabled ? { y: fieldY, scale: fieldScale } : undefined}
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        focusable="false"
      >
        <g className="telemetry-backdrop__trace telemetry-backdrop__trace--primary">
          <path d="M-80 210H210L310 310H690L790 210H1120L1240 330H1680" />
          <path
            className="telemetry-backdrop__flow"
            d="M-80 210H210L310 310H690L790 210H1120L1240 330H1680"
          />
        </g>

        <g className="telemetry-backdrop__trace telemetry-backdrop__trace--secondary">
          <path d="M90 820V690L230 550H510L610 450H960L1080 570H1370L1510 430V50" />
          <path
            className="telemetry-backdrop__flow telemetry-backdrop__flow--reverse"
            d="M90 820V690L230 550H510L610 450H960L1080 570H1370L1510 430V50"
          />
        </g>

        <g className="telemetry-backdrop__trace telemetry-backdrop__trace--tertiary">
          <path d="M-40 690H350L450 790H850L950 690H1190L1320 820H1640" />
        </g>

        <g className="telemetry-backdrop__nodes">
          <circle cx="210" cy="210" r="5" />
          <circle cx="310" cy="310" r="3" />
          <circle cx="690" cy="310" r="5" />
          <circle cx="790" cy="210" r="3" />
          <circle cx="1120" cy="210" r="5" />
          <circle cx="1240" cy="330" r="3" />
          <circle cx="610" cy="450" r="4" />
          <circle cx="1080" cy="570" r="4" />
          <circle cx="1370" cy="570" r="3" />
        </g>

        <g className="telemetry-backdrop__reticle">
          <circle cx="1240" cy="330" r="28" />
          <path d="M1198 330H1214M1266 330H1282M1240 288V304M1240 356V372" />
        </g>
      </motion.svg>
    </div>
  );
}
