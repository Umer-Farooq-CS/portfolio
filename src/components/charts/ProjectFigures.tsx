import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import type { VisualAccent } from "@/lib/accent";

/**
 * Small, self-contained figures a project page can drop in: a before/after
 * comparison and a series across ordered variants.
 *
 * Hand-drawn SVG rather than the Bklit chart components. Those render through
 * `<ParentSize>`, which measures the container with a `ResizeObserver` and draws
 * nothing at all until it reports a size — so they produce an empty box in jsdom
 * and in any zero-width container, and their inner `<svg>` is `aria-hidden`,
 * which rules out the `role="img"` + label these figures need. Two bars and a
 * delta do not justify fighting that.
 *
 * Colour follows the project's semantic domain while graphite remains the
 * reference. Every value carries its unit, and every comparison carries the
 * baseline it improved on.
 */

export interface FigurePoint {
  /** Uppercase mono label. Keep to 13 characters or the axis column clips. */
  label: string;
  value: number;
}

const MONO_ADVANCE = 0.66; // IBM Plex Mono advance plus the label letter-spacing

function formatValue(value: number, unit: string, decimals: number): string {
  return `${value.toFixed(decimals)}${unit}`;
}

const NICE_STEPS = [1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 7, 8, 10];

/**
 * Axis ceiling. Percentages read against 100; everything else snaps to the next
 * round number above the peak, so a tick label is a number a reader recognises.
 */
function ceilingFor(peak: number, unit: string, max?: number): number {
  if (max !== undefined) return max;
  if (unit === "%" && peak <= 100) return 100;
  if (peak <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(peak));
  const step = NICE_STEPS.find((candidate) => candidate * magnitude >= peak * 1.08) ?? 10;
  return step * magnitude;
}

function clamp(value: number, low: number, high: number): number {
  return Math.min(Math.max(value, low), high);
}

/* --- before / after ------------------------------------------------------- */

const BA = {
  w: 360,
  h: 118,
  labelRight: 82,
  plotX: 88,
  barMax: 200,
  valueX: 336,
  barH: 20,
  rowA: 20,
  rowB: 56,
};

export interface BeforeAfterBarsProps {
  /** What is being measured, in sentence case. */
  title: string;
  baseline: FigurePoint;
  result: FigurePoint;
  /** The change, in the caller's words and units — "+40 points", "6× faster". */
  delta: string;
  unit?: string;
  decimals?: number;
  max?: number;
  /** One line under the figure saying what the numbers are. */
  note?: string;
  className?: string;
}

export function BeforeAfterBars({
  title,
  baseline,
  result,
  delta,
  unit = "",
  decimals = 0,
  max,
  note,
  className,
}: BeforeAfterBarsProps) {
  const top = ceilingFor(Math.max(baseline.value, result.value), unit, max);
  const lengthFor = (value: number) => clamp(value / top, 0, 1) * BA.barMax;
  const xBaseline = BA.plotX + lengthFor(baseline.value);
  const xResult = BA.plotX + lengthFor(result.value);

  const baselineText = formatValue(baseline.value, unit, decimals);
  const resultText = formatValue(result.value, unit, decimals);

  // Centre the delta on the bracket, but never let it run off either edge.
  const deltaHalf = (delta.length * 9 * MONO_ADVANCE) / 2;
  const deltaX = clamp((xBaseline + xResult) / 2, deltaHalf + 4, BA.w - deltaHalf - 4);
  const bracketFrom = Math.min(xBaseline, xResult);
  const bracketTo = Math.max(xBaseline, xResult);

  return (
    <figure className={cn("rounded-lg border border-border bg-card p-4", className)}>
      <p className="label-mono">{title}</p>

      <svg
        viewBox={`0 0 ${BA.w} ${BA.h}`}
        preserveAspectRatio="xMidYMid meet"
        className="mt-3 h-auto w-full"
        role="img"
        aria-label={`${title}: ${baseline.label.toLowerCase()} ${baselineText}, ${result.label.toLowerCase()} ${resultText}. Change: ${delta}.`}
      >
        {/* Zero line — the bars' origin, and the only axis this figure needs. */}
        <line
          x1={BA.plotX}
          y1="14"
          x2={BA.plotX}
          y2="84"
          stroke="var(--color-border)"
          strokeWidth="1"
        />

        {/* Baseline: graphite, the reference. */}
        <text
          x={BA.labelRight}
          y={BA.rowA + 14}
          textAnchor="end"
          className="fill-[var(--color-muted-foreground)] font-mono"
          fontSize="9"
          letterSpacing="0.06em"
        >
          {baseline.label}
        </text>
        <rect
          x={BA.plotX}
          y={BA.rowA}
          width={Math.max(1, xBaseline - BA.plotX)}
          height={BA.barH}
          rx="1"
          fill="var(--color-graphite)"
        />
        <text
          x={BA.valueX}
          y={BA.rowA + 14}
          textAnchor="end"
          className="readout fill-[var(--color-muted-foreground)]"
          fontSize="11"
        >
          {baselineText}
        </text>

        {/* Result: thermal, the measured series. */}
        <text
          x={BA.labelRight}
          y={BA.rowB + 14}
          textAnchor="end"
          className="fill-[var(--color-muted-foreground)] font-mono"
          fontSize="9"
          letterSpacing="0.06em"
        >
          {result.label}
        </text>
        <rect
          x={BA.plotX}
          y={BA.rowB}
          width={Math.max(1, xResult - BA.plotX)}
          height={BA.barH}
          rx="1"
          fill="var(--figure-mark, var(--color-thermal))"
        />
        <text
          x={BA.valueX}
          y={BA.rowB + 14}
          textAnchor="end"
          className="readout"
          style={{ fill: "var(--figure-type, var(--color-primary-type))" }}
          fontSize="11"
        >
          {resultText}
        </text>

        {/* The baseline carried down past the result, so the gap is measurable. */}
        <line
          x1={xBaseline}
          y1="16"
          x2={xBaseline}
          y2="92"
          stroke="var(--color-graphite)"
          strokeWidth="1"
          strokeDasharray="3 3"
          opacity="0.8"
        />

        {/* The gap itself, bracketed and named. */}
        <path
          d={`M ${bracketFrom} 94 V 102 M ${bracketFrom} 98 H ${bracketTo} M ${bracketTo} 94 V 102`}
          fill="none"
          stroke="var(--figure-mark, var(--color-thermal))"
          strokeWidth="1"
        />
        <text
          x={deltaX}
          y="113"
          textAnchor="middle"
          className="font-mono"
          style={{ fill: "var(--figure-type, var(--color-primary-type))" }}
          fontSize="9"
          fontWeight="500"
          letterSpacing="0.06em"
        >
          {delta}
        </text>
      </svg>

      {note && (
        <figcaption className="mt-3 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
          {note}
        </figcaption>
      )}
    </figure>
  );
}

/* --- ordered variants ---------------------------------------------------- */

const SS = {
  w: 360,
  h: 190,
  padTop: 26,
  padLeft: 34,
  padRight: 8,
  axisY: 154,
};

export interface StepSeriesProps {
  title: string;
  /** Ordered variants, first to last. The first is treated as the reference. */
  points: FigurePoint[];
  unit?: string;
  decimals?: number;
  max?: number;
  note?: string;
  className?: string;
}

export function StepSeries({
  title,
  points,
  unit = "",
  decimals = 0,
  max,
  note,
  className,
}: StepSeriesProps) {
  const plotW = SS.w - SS.padLeft - SS.padRight;
  const plotH = SS.axisY - SS.padTop;
  const peak = points.reduce((high, point) => Math.max(high, point.value), 0);
  const top = ceilingFor(peak, unit, max);
  const band = plotW / Math.max(1, points.length);
  const barW = Math.min(band * 0.56, 34);

  return (
    <figure className={cn("rounded-lg border border-border bg-card p-4", className)}>
      <p className="label-mono">{title}</p>

      <svg
        viewBox={`0 0 ${SS.w} ${SS.h}`}
        preserveAspectRatio="xMidYMid meet"
        className="mt-3 h-auto w-full"
        role="img"
        aria-label={`${title}, across ${points.length} variants: ${points
          .map((point) => `${point.label.toLowerCase()} ${formatValue(point.value, unit, decimals)}`)
          .join(", ")}.`}
      >
        {/* Axis frame — two lines, no gridlines competing with the columns. */}
        <line
          x1={SS.padLeft}
          y1={SS.padTop}
          x2={SS.padLeft}
          y2={SS.axisY}
          stroke="var(--color-border)"
          strokeWidth="1"
        />
        <line
          x1={SS.padLeft}
          y1={SS.axisY}
          x2={SS.w - SS.padRight}
          y2={SS.axisY}
          stroke="var(--color-border)"
          strokeWidth="1"
        />

        {[0, top].map((tick) => (
          <text
            key={tick}
            x={SS.padLeft - 5}
            y={SS.axisY - (tick / top) * plotH + 3}
            textAnchor="end"
            className="fill-[var(--color-muted-foreground)] font-mono"
            fontSize="8.5"
          >
            {formatValue(tick, unit, decimals)}
          </text>
        ))}

        {points.map((point, index) => {
          const height = clamp(point.value / top, 0, 1) * plotH;
          const x = SS.padLeft + index * band + (band - barW) / 2;
          const y = SS.axisY - height;
          return (
            <g key={point.label}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={Math.max(1, height)}
                rx="1"
                // The first variant is what the rest are measured against.
                fill={
                  index === 0
                    ? "var(--color-graphite)"
                    : "var(--figure-mark, var(--color-thermal))"
                }
              />
              <text
                x={x + barW / 2}
                y={y - 5}
                textAnchor="middle"
                className="readout"
                style={{
                  fill:
                    index === 0
                      ? "var(--color-foreground)"
                      : "var(--figure-type, var(--color-primary-type))",
                }}
                fontSize="8.5"
              >
                {formatValue(point.value, unit, decimals)}
              </text>
              <text
                x={x + barW / 2}
                y={SS.axisY + 14}
                textAnchor="middle"
                className="fill-[var(--color-muted-foreground)] font-mono"
                fontSize="8.5"
                letterSpacing="0.05em"
              >
                {point.label}
              </text>
            </g>
          );
        })}
      </svg>

      {note && (
        <figcaption className="mt-3 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
          {note}
        </figcaption>
      )}
    </figure>
  );
}

/* --- which figures apply to which project -------------------------------- */

export type ProjectFigure =
  | { kind: "before-after"; props: BeforeAfterBarsProps }
  | { kind: "step-series"; props: StepSeriesProps };

/**
 * Keyed by project slug. Every number here is already stated in
 * `src/data/projects.ts`; a project with no measured baseline is simply absent.
 */
export const FIGURES: Record<string, ProjectFigure[]> = {
  "cirq-rag": [
    {
      kind: "before-after",
      props: {
        title: "Circuit generation success",
        unit: "%",
        baseline: { label: "SINGLE AGENT", value: 52 },
        result: { label: "MULTI-AGENT", value: 92 },
        delta: "+40 POINTS",
        note: "Share of prompts that produce a circuit which compiles and simulates, over a curated 140+ entry Cirq knowledge base.",
      },
    },
  ],
  "mnist-gpu": [
    {
      kind: "before-after",
      props: {
        title: "Inference speedup",
        unit: "×",
        baseline: { label: "SERIAL CPU", value: 1 },
        result: { label: "TENSOR CORES", value: 6 },
        delta: "6× FASTER",
        note: "The V1 serial CPU baseline against V5, with FP16 mixed precision on NVIDIA Tensor Cores, at 99%+ accuracy.",
      },
    },
  ],
  "rnn-text-generation": [
    {
      kind: "before-after",
      props: {
        title: "Training speedup",
        unit: "×",
        decimals: 1,
        baseline: { label: "FP32", value: 1 },
        result: { label: "FP16 AMP", value: 3.5 },
        delta: "3.5× FASTER",
        note: "Automatic mixed precision against the FP32 baseline, same 5.8M-parameter model.",
      },
    },
  ],
  "canny-edge-detector": [
    {
      kind: "before-after",
      props: {
        title: "Edge detection speedup",
        unit: "×",
        decimals: 1,
        baseline: { label: "CPU SERIAL", value: 1 },
        result: { label: "CUDA", value: 3.5 },
        delta: "3.5× FASTER",
        note: "Four CUDA stages — Gaussian blur, Sobel, non-maximum suppression, hysteresis — against the sequential CPU implementation.",
      },
    },
  ],
  "2d-game-suite": [
    {
      kind: "before-after",
      props: {
        title: "Performance, indexed to baseline",
        unit: "%",
        baseline: { label: "BEFORE", value: 100 },
        result: { label: "AFTER", value: 130 },
        delta: "+30% OR BETTER",
        note: "Reported as a 30%-or-better improvement after the custom physics, collision, and rendering passes; shown indexed to the pre-optimisation build.",
      },
    },
  ],
};

export function getProjectFigures(slug: string): ProjectFigure[] {
  return FIGURES[slug] ?? [];
}

/**
 * Every figure for one project. Lazy-load this and render it unconditionally —
 * it returns nothing for a project with no measured comparison.
 */
export default function ProjectFigures({
  slug,
  tone = "thermal",
  className,
}: {
  slug: string;
  tone?: VisualAccent;
  className?: string;
}) {
  const figures = getProjectFigures(slug);
  if (figures.length === 0) return null;

  return (
    <div
      className={cn("grid gap-4", figures.length > 1 && "sm:grid-cols-2", className)}
      style={
        {
          "--figure-mark": `var(--${tone === "none" ? "graphite" : tone})`,
          "--figure-type": `var(--${tone === "none" ? "foreground" : `${tone}-type`})`,
        } as CSSProperties
      }
    >
      {figures.map((figure) =>
        figure.kind === "before-after" ? (
          <BeforeAfterBars key={figure.props.title} {...figure.props} />
        ) : (
          <StepSeries key={figure.props.title} {...figure.props} />
        ),
      )}
    </div>
  );
}
