import { useLayoutEffect, useRef } from "react";
import { RotateCw } from "lucide-react";
import { createScope, createTimeline, svg, utils, type Scope } from "animejs";
import { useMotionPolicy } from "@/lib/motion-policy";
import { cn } from "@/lib/utils";

/**
 * The Cirq-RAG multi-agent pipeline, drawn as a vertical spine with two feedback
 * edges.
 *
 * This replaces a raster diagram. Inline SVG earns its place three times over: it
 * follows the theme, it can be read by a screen reader (see the ordered list
 * below the figure), and the retry loop can actually fire — which a still image
 * cannot show, and which is the mechanism the 92% result comes from.
 *
 * Colour: the feedback edges are thermal because they are the measured mechanism,
 * the retrieval feeds are cryo because the knowledge base is the quantum half.
 * The agents themselves are AI, so they get no accent.
 *
 * The layout is portrait, not a wide row: at 360 units across it renders near 1:1
 * on a 390px phone, so every label stays above 8px there instead of collapsing.
 */

const VB = { w: 360, h: 360 };
const BOX = { x: 150, w: 132, h: 44 };
const CX = BOX.x + BOX.w / 2; // 216
const EDGE_R = BOX.x + BOX.w; // 282 — right edge, where the feedback edges attach

interface Stage {
  name: string;
  detail: string;
  /** Spoken form, used by the screen-reader alternative. */
  spoken: string;
  y: number;
}

const STAGES: Stage[] = [
  {
    name: "DESIGNER",
    detail: "DRAFTS CIRQ CODE",
    spoken: "Designer drafts Cirq code from the prompt, grounded by retrieval.",
    y: 42,
  },
  {
    name: "VALIDATOR",
    detail: "COMPILE + SIMULATE",
    spoken:
      "Validator compiles and simulates the circuit. On a compile or simulation failure it sends the code back to the Designer to patch, for a bounded number of retries.",
    y: 116,
  },
  {
    name: "OPTIMIZER",
    detail: "DEPTH · GATES · 2Q",
    spoken:
      "Optimizer reduces circuit depth, total gates, and two-qubit gates, then hands the result back for re-validation.",
    y: 190,
  },
  {
    name: "EDUCATOR",
    detail: "TIERED EXPLANATION",
    spoken: "Educator produces tiered explanations of the validated circuit.",
    y: 264,
  },
];

/** Vertical spine segments. Each ends short of the next box, where its head sits. */
const FLOW = [
  { d: "M 216 20 V 36", tip: 42 },
  { d: "M 216 86 V 110", tip: 116 },
  { d: "M 216 160 V 184", tip: 190 },
  { d: "M 216 234 V 258", tip: 264 },
];

/** Head pointing down, tip on the box edge, base 6 units back up the line. */
const headDown = (x: number, y: number) => `M ${x} ${y} L ${x - 4} ${y - 6} L ${x + 4} ${y - 6} Z`;
/** Head pointing left / right, for the feedback and retrieval edges. */
const headLeft = (x: number, y: number) => `M ${x} ${y} L ${x + 6} ${y - 4} L ${x + 6} ${y + 4} Z`;
const headRight = (x: number, y: number) => `M ${x} ${y} L ${x - 6} ${y - 4} L ${x - 6} ${y + 4} Z`;

/** Feedback edges, up the right-hand gutter. Nested, so they read as two loops. */
const RETRY_D = "M 282 128 C 350 128 350 76 288 76";
const REVALIDATE_D = "M 282 200 C 310 200 310 152 288 152";

const PROMPT = "NATURAL-LANGUAGE PROMPT";
const OUTPUT = "VALIDATED CIRCUIT + TIERED EXPLANATION";

const SPOKEN_STEPS = [
  "A natural-language prompt enters the pipeline.",
  ...STAGES.map((stage) => stage.spoken),
  "Output: a validated circuit with its tiered explanation.",
];

export default function PipelineTrace({ className }: { className?: string }) {
  const { enabled: motionEnabled } = useMotionPolicy();
  const svgRef = useRef<SVGSVGElement>(null);
  const scopeRef = useRef<Scope | null>(null);

  // Layout effect, not effect: the timeline hides the diagram before animating it
  // in, and that has to happen before the first paint or the final state flashes.
  useLayoutEffect(() => {
    if (!motionEnabled) return;

    scopeRef.current = createScope({ root: svgRef }).add((self) => {
      utils.set(
        [
          ".pt-node",
          ".pt-flow-head",
          ".pt-feed",
          ".pt-feed-head",
          ".pt-feed-label",
          ".pt-retry",
          ".pt-retry-head",
          ".pt-retry-label",
          ".pt-revalidate",
          ".pt-revalidate-head",
          ".pt-revalidate-label",
          ".pt-out",
          ".pt-out-head",
        ],
        { opacity: 0 },
      );

      // Only the solid strokes are drawn: createDrawable owns stroke-dasharray,
      // so a dashed path would finish solid and stop reading as a failure route.
      // The dashed edges fade in, and a solid tracer slides backwards along each
      // one — which is what the retry actually does.
      const flow = svg.createDrawable(".pt-flow", 0, 0);
      const out = svg.createDrawable(".pt-out-line", 0, 0);
      const retryTrace = svg.createDrawable(".pt-retry-trace", 0, 0.22);
      const revalidateTrace = svg.createDrawable(".pt-revalidate-trace", 0, 0.22);

      const tl = createTimeline({ defaults: { ease: "outQuint" } });

      // Absolute positions rather than chained defaults, so the beat where the
      // retry edge fires stays readable while the rest is edited.
      tl.add(".pt-node", { opacity: [0, 1], duration: 320, delay: utils.stagger(60) }, 0);

      tl.add(flow, { draw: "0 1", duration: 240, delay: utils.stagger(110) }, 620);
      tl.add(
        ".pt-flow-head",
        { opacity: [0, 1], duration: 140, delay: utils.stagger(110, { start: 190 }) },
        620,
      );

      tl.add(
        [".pt-feed", ".pt-feed-head", ".pt-feed-label"],
        { opacity: [0, 1], duration: 260 },
        1290,
      );

      // The failure beat: slower than the forward path, travelling upwards, and
      // landing on the Designer with a flash.
      tl.add(".pt-retry", { opacity: [0, 1], duration: 200 }, 1620);
      tl.add(".pt-retry-trace", { opacity: [0, 1], duration: 120 }, 1700);
      tl.add(retryTrace, { draw: ["0 0.22", "0.78 1"], duration: 620 }, 1700);
      tl.add(".pt-retry-trace", { opacity: [1, 0], duration: 160 }, 2260);
      tl.add(".pt-flash", { opacity: [0, 1, 0], duration: 520 }, 2180);
      tl.add([".pt-retry-head", ".pt-retry-label"], { opacity: [0, 1], duration: 200 }, 2260);

      tl.add(".pt-revalidate", { opacity: [0, 1], duration: 200 }, 2560);
      tl.add(".pt-revalidate-trace", { opacity: [0, 1], duration: 120 }, 2620);
      tl.add(revalidateTrace, { draw: ["0 0.22", "0.78 1"], duration: 460 }, 2620);
      tl.add(".pt-revalidate-trace", { opacity: [1, 0], duration: 160 }, 3020);
      tl.add(
        [".pt-revalidate-head", ".pt-revalidate-label"],
        { opacity: [0, 1], duration: 200 },
        3020,
      );

      tl.add(out, { draw: "0 1", duration: 300 }, 3260);
      tl.add([".pt-out-head", ".pt-out"], { opacity: [0, 1], duration: 260 }, 3520);

      // anime types the scope argument as optional; it is always passed here.
      self?.add("replay", () => {
        tl.restart();
      });
    });

    return () => {
      scopeRef.current?.revert();
      scopeRef.current = null;
    };
  }, [motionEnabled]);

  return (
    <figure className={cn("rounded-lg border border-border bg-card p-4 sm:p-5", className)}>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <p className="label-mono">Multi-agent pipeline</p>
        {motionEnabled && (
          <button
            type="button"
            onClick={() => scopeRef.current?.methods.replay?.()}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border px-3 py-1.5 font-mono text-2xs uppercase tracking-widest text-foreground transition-colors hover:border-thermal hover:text-primary-type focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RotateCw size={12} aria-hidden="true" />
            Replay
          </button>
        )}
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VB.w} ${VB.h}`}
        preserveAspectRatio="xMidYMid meet"
        className="mx-auto h-auto w-full max-w-[420px]"
        role="img"
        aria-label="A prompt goes to a Designer agent, then a Validator that sends failures back to be patched, then an Optimizer that is re-validated, and finally an Educator, with a FAISS knowledge base grounding the Designer and Validator."
      >
        {/* Forward spine, drawn first so the boxes sit over it. */}
        {FLOW.map((segment) => (
          <g key={segment.d}>
            <path
              className="pt-flow"
              d={segment.d}
              fill="none"
              stroke="var(--color-muted-foreground)"
              strokeWidth="1.25"
            />
            <path
              className="pt-flow-head"
              d={headDown(CX, segment.tip)}
              fill="var(--color-muted-foreground)"
            />
          </g>
        ))}

        {/* Retrieval: cryo, dotted — a lookup, not a hand-off. */}
        <path
          className="pt-feed"
          d="M 116 86 C 130 86 132 72 144 72"
          fill="none"
          stroke="var(--color-cryo)"
          strokeWidth="1.25"
          strokeDasharray="2 3"
        />
        <path className="pt-feed-head" d={headRight(BOX.x, 72)} fill="var(--color-cryo)" />
        <path
          className="pt-feed"
          d="M 116 116 C 130 116 132 140 144 140"
          fill="none"
          stroke="var(--color-cryo)"
          strokeWidth="1.25"
          strokeDasharray="2 3"
        />
        <path className="pt-feed-head" d={headRight(BOX.x, 140)} fill="var(--color-cryo)" />
        <text
          className="pt-feed-label fill-[var(--color-accent-type)] font-mono"
          x="6"
          y="144"
          fontSize="8.5"
          fontWeight="500"
          letterSpacing="0.07em"
        >
          RETRIEVE
        </text>

        {/* The retry loop: thermal, dashed, curving back up the right-hand gutter. */}
        <path
          className="pt-retry"
          d={RETRY_D}
          fill="none"
          stroke="var(--color-thermal)"
          strokeWidth="1.5"
          strokeDasharray="5 3"
        />
        {/* Animation-only: the failing circuit travelling back up the loop. */}
        <path
          className="pt-retry-trace"
          d={RETRY_D}
          fill="none"
          stroke="var(--color-thermal)"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0"
        />
        <path className="pt-retry-head" d={headLeft(EDGE_R, 76)} fill="var(--color-thermal)" />
        <text
          className="pt-retry-label fill-[var(--color-primary-type)] font-mono"
          x="347"
          y="102"
          fontSize="9"
          fontWeight="500"
          letterSpacing="0.07em"
          textAnchor="middle"
          transform="rotate(90 347 102)"
        >
          PATCH · RETRY
        </text>

        <path
          className="pt-revalidate"
          d={REVALIDATE_D}
          fill="none"
          stroke="var(--color-thermal)"
          strokeWidth="1.5"
          strokeDasharray="5 3"
        />
        <path
          className="pt-revalidate-trace"
          d={REVALIDATE_D}
          fill="none"
          stroke="var(--color-thermal)"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0"
        />
        <path className="pt-revalidate-head" d={headLeft(EDGE_R, 152)} fill="var(--color-thermal)" />
        <text
          className="pt-revalidate-label fill-[var(--color-primary-type)] font-mono"
          x="316"
          y="176"
          fontSize="9"
          fontWeight="500"
          letterSpacing="0.07em"
          textAnchor="middle"
          transform="rotate(90 316 176)"
        >
          RE-VALIDATE
        </text>

        {/* Terminals and boxes. */}
        <g className="pt-node">
          <text
            className="fill-[var(--color-muted-foreground)] font-mono"
            x={CX}
            y="12"
            fontSize="9.5"
            fontWeight="500"
            letterSpacing="0.07em"
            textAnchor="middle"
          >
            {PROMPT}
          </text>
        </g>

        {STAGES.map((stage) => (
          <g className="pt-node" key={stage.name}>
            <rect
              x={BOX.x}
              y={stage.y}
              width={BOX.w}
              height={BOX.h}
              rx="3"
              fill="var(--color-card)"
              stroke="var(--color-border)"
              strokeWidth="1"
            />
            <text
              className="fill-[var(--color-foreground)] font-mono"
              x={CX}
              y={stage.y + 20}
              fontSize="13"
              fontWeight="500"
              letterSpacing="0.04em"
              textAnchor="middle"
            >
              {stage.name}
            </text>
            <text
              className="fill-[var(--color-muted-foreground)] font-mono"
              x={CX}
              y={stage.y + 34}
              fontSize="9"
              letterSpacing="0.05em"
              textAnchor="middle"
            >
              {stage.detail}
            </text>
          </g>
        ))}

        <g className="pt-node">
          <rect
            x="6"
            y="72"
            width="110"
            height="58"
            rx="3"
            fill="var(--color-card)"
            stroke="var(--color-border)"
            strokeWidth="1"
          />
          <text
            className="fill-[var(--color-accent-type)] font-mono"
            x="61"
            y="90"
            fontSize="9"
            fontWeight="500"
            letterSpacing="0.07em"
            textAnchor="middle"
          >
            KNOWLEDGE BASE
          </text>
          <text
            className="fill-[var(--color-muted-foreground)] font-mono"
            x="61"
            y="105"
            fontSize="9"
            letterSpacing="0.05em"
            textAnchor="middle"
          >
            140+ ENTRIES
          </text>
          <text
            className="fill-[var(--color-muted-foreground)] font-mono"
            x="61"
            y="120"
            fontSize="9"
            letterSpacing="0.05em"
            textAnchor="middle"
          >
            FAISS INDEX
          </text>
        </g>

        {/* Animation-only mark: where the patched code lands. Invisible at rest. */}
        <rect
          className="pt-flash"
          x={BOX.x}
          y={STAGES[0].y}
          width={BOX.w}
          height={BOX.h}
          rx="3"
          fill="none"
          stroke="var(--color-thermal)"
          strokeWidth="1.5"
          opacity="0"
        />

        <path
          className="pt-out-line"
          d="M 216 308 V 326"
          fill="none"
          stroke="var(--color-muted-foreground)"
          strokeWidth="1.25"
        />
        <path
          className="pt-out-head"
          d={headDown(CX, 332)}
          fill="var(--color-muted-foreground)"
        />
        <text
          className="pt-out fill-[var(--color-foreground)] font-mono"
          x={CX}
          y="348"
          fontSize="9.5"
          fontWeight="500"
          letterSpacing="0.07em"
          textAnchor="middle"
        >
          {OUTPUT}
        </text>
      </svg>

      {/* The diagram's content in reading order, for anyone who can't see it. */}
      <ol className="sr-only">
        {SPOKEN_STEPS.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>

      <figcaption className="mt-4 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
        <span className="readout text-primary-type">92%</span> of prompts produce a circuit that
        compiles and simulates, against <span className="readout text-foreground">52%</span> for a
        single-agent baseline. The retry loop is the difference.
      </figcaption>
    </figure>
  );
}
