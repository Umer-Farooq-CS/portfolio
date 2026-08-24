import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import type { VisualAccent } from "@/lib/accent";
import { sectionsForRoute } from "@/lib/sections";
import { telemetryToneForPath } from "@/lib/telemetry";

/**
 * A restrained, code-native field behind the site shell. The traces read as a
 * distributed pipeline: sparse nodes hand work across measured paths. On the
 * homepage the field follows the chapter legend; other routes use their domain
 * tone. The visual is deliberately inert to input and has no content meaning.
 */
export default function TelemetryBackdrop() {
  const { pathname } = useLocation();
  const sections = useMemo(() => sectionsForRoute(pathname), [pathname]);
  const routeTone = telemetryToneForPath(pathname);
  const [tone, setTone] = useState<VisualAccent>(sections[0]?.tone ?? routeTone);

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
    window.addEventListener("scroll", scheduleToneUpdate, { passive: true });
    window.addEventListener("resize", scheduleToneUpdate);
    scheduleToneUpdate();

    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", scheduleToneUpdate);
      window.removeEventListener("resize", scheduleToneUpdate);
      if (frame !== null && typeof window.cancelAnimationFrame === "function") {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [pathname, routeTone, sections]);

  return (
    <div className="telemetry-backdrop" data-accent={tone} aria-hidden="true">
      <div className="telemetry-backdrop__grid" />
      <svg
        className="telemetry-backdrop__field"
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
      </svg>
    </div>
  );
}
