import { useId } from "react";
import { motion } from "motion/react";
import type { BenchPoint } from "./useBenchmark";

interface SpeedupChartProps {
  points: BenchPoint[];
  maxWorkers: number;
  /** Draws the measured line progressively as points arrive. */
  animate: boolean;
}

const PAD = { top: 14, right: 16, bottom: 26, left: 30 };
const W = 420;
const H = 240;

/**
 * Measured speedup against the ideal line.
 *
 * Hand-drawn SVG rather than a chart library: this figure is the hero, it needs
 * exact control over the axis, and it must not pull a charting runtime into the
 * first load. The richer charts on project pages use the chart library, lazily.
 */
export default function SpeedupChart({ points, maxWorkers, animate }: SpeedupChartProps) {
  const clipId = useId();
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const xFor = (workers: number) => PAD.left + ((workers - 1) / Math.max(1, maxWorkers - 1)) * plotW;
  const yFor = (speedup: number) => PAD.top + plotH - ((speedup - 1) / Math.max(1, maxWorkers - 1)) * plotH;

  const measured = points.map((p) => `${xFor(p.workers)},${yFor(p.speedup)}`).join(" ");
  // Label the worker counts actually measured, so the axis matches the data.
  const ticks = points.length > 0 ? points.map((p) => p.workers) : [1, maxWorkers];
  const yTicks = [1, ...ticks.filter((t) => t > 1)];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={
        points.length > 0
          ? `Speedup curve: ${points[points.length - 1].speedup.toFixed(2)}× at ${points[points.length - 1].workers} workers, against a linear ideal.`
          : "Speedup curve, waiting for measurements."
      }
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={PAD.left} y={PAD.top} width={plotW} height={plotH} />
        </clipPath>
      </defs>

      {/* Axis frame — two lines, no box, no gridlines competing with the data. */}
      <line
        x1={PAD.left}
        y1={PAD.top}
        x2={PAD.left}
        y2={PAD.top + plotH}
        stroke="var(--color-border)"
        strokeWidth="1"
      />
      <line
        x1={PAD.left}
        y1={PAD.top + plotH}
        x2={PAD.left + plotW}
        y2={PAD.top + plotH}
        stroke="var(--color-border)"
        strokeWidth="1"
      />

      {yTicks.map((tick) => (
        <g key={`y${tick}`}>
          <line
            x1={PAD.left - 3}
            y1={yFor(tick)}
            x2={PAD.left}
            y2={yFor(tick)}
            stroke="var(--color-border)"
            strokeWidth="1"
          />
          <text
            x={PAD.left - 7}
            y={yFor(tick) + 3.5}
            textAnchor="end"
            className="fill-[var(--color-muted-foreground)] font-mono"
            fontSize="9"
          >
            {tick}×
          </text>
        </g>
      ))}

      {ticks.map((tick) => (
        <text
          key={`x${tick}`}
          x={xFor(tick)}
          y={PAD.top + plotH + 15}
          textAnchor="middle"
          className="fill-[var(--color-muted-foreground)] font-mono"
          fontSize="9"
        >
          {tick}
        </text>
      ))}

      <text
        x={PAD.left + plotW}
        y={H - 3}
        textAnchor="end"
        className="fill-[var(--color-muted-foreground)] font-mono"
        fontSize="8"
        letterSpacing="0.08em"
      >
        WORKERS
      </text>

      {/* Ideal: speedup equals worker count. Graphite, dashed — a reference, not data. */}
      <line
        x1={xFor(1)}
        y1={yFor(1)}
        x2={xFor(maxWorkers)}
        y2={yFor(maxWorkers)}
        stroke="var(--color-graphite)"
        strokeWidth="1.5"
        strokeDasharray="4 4"
        opacity="0.7"
      />
      <text
        x={xFor(maxWorkers) - 4}
        y={yFor(maxWorkers) + 12}
        textAnchor="end"
        className="fill-[var(--color-muted-foreground)] font-mono"
        fontSize="8"
        letterSpacing="0.08em"
      >
        IDEAL
      </text>

      {/* Measured: thermal, solid — this is the data. */}
      <g clipPath={`url(#${clipId})`}>
        {points.length > 1 && (
          <motion.polyline
            key={points.map((point) => point.workers).join("-")}
            points={measured}
            fill="none"
            stroke="var(--color-thermal)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={animate ? { pathLength: 0, opacity: 0.45 } : false}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: animate ? 0.55 : 0, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
        {points.map((point, index) => (
          <motion.circle
            key={point.workers}
            cx={xFor(point.workers)}
            cy={yFor(point.speedup)}
            initial={animate ? { r: 0, opacity: 0 } : false}
            animate={{ r: 3.5, opacity: 1 }}
            transition={{ duration: animate ? 0.22 : 0, delay: animate ? index * 0.035 : 0 }}
            fill="var(--color-thermal)"
          />
        ))}
      </g>
    </svg>
  );
}
