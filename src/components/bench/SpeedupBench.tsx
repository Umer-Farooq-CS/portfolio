import { useEffect, useRef, useState } from "react";
import { RotateCw } from "lucide-react";
import { useMotionPolicy } from "@/lib/motion-policy";
import SpeedupChart from "./SpeedupChart";
import { RECORDED_SWEEP, useBenchmark } from "./useBenchmark";

/**
 * The hero instrument: a real parallel speedup sweep, run on the visitor's own
 * machine, plotted against the ideal line.
 *
 * It starts itself once, on view, and only when that is a reasonable thing to do.
 * When it isn't — reduced motion, data saving, two cores or fewer, no worker
 * support — it shows a recorded sweep, says so, and offers a manual trigger.
 */
export default function SpeedupBench() {
  const { enabled: motionEnabled } = useMotionPolicy();
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoStarted, setAutoStarted] = useState(false);

  const saveData =
    typeof navigator !== "undefined" &&
    Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);

  const allowLiveRun = motionEnabled && !saveData;
  const bench = useBenchmark({ enabled: allowLiveRun });

  // Start when the panel is actually on screen, so a visitor who never scrolls
  // here never pays for it.
  useEffect(() => {
    if (autoStarted || !allowLiveRun) return;
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setAutoStarted(true);
          observer.disconnect();
          void bench.run();
        }
      },
      { rootMargin: "0px", threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [allowLiveRun, autoStarted, bench]);

  const isRecorded = bench.status === "skipped" || bench.status === "unsupported";
  const points = isRecorded ? RECORDED_SWEEP : bench.points;
  const maxWorkers = isRecorded ? RECORDED_SWEEP.length : bench.maxWorkers;
  const last = points[points.length - 1];
  const busy = bench.status === "calibrating" || bench.status === "running";

  const statusLine = (() => {
    if (isRecorded) return "recorded on an 8-core laptop";
    if (bench.status === "calibrating") return "sizing the problem for this machine";
    if (bench.status === "running") return `measuring ${points.length} of ${maxWorkers}`;
    if (bench.status === "done") return "measured on your machine, just now";
    return "ready";
  })();

  return (
    <div
      ref={containerRef}
      className="rounded-lg border border-thermal/25 bg-thermal/5 p-4 sm:p-5"
      aria-busy={busy}
    >
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <p className="label-mono text-primary-type">Live benchmark</p>
        <p className={`readout text-2xs ${bench.status === "done" ? "text-systems-type" : "text-muted-foreground"}`}>
          {statusLine}
        </p>
      </div>

      <SpeedupChart points={points} maxWorkers={maxWorkers} animate={motionEnabled} />

      {/* The readout. Every value is a measurement, and each says what it means. */}
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border pt-4 sm:grid-cols-4">
        <div>
          <dt className="label-mono">Cores</dt>
          <dd className="readout text-lg text-foreground">{isRecorded ? 8 : bench.cores || "—"}</dd>
        </div>
        <div>
          <dt className="label-mono">Speedup</dt>
          <dd className="readout text-lg text-primary-type">
            {last ? `${last.speedup.toFixed(2)}×` : "—"}
          </dd>
        </div>
        <div>
          <dt className="label-mono">Efficiency</dt>
          <dd className="readout text-lg text-cryo-type">
            {last ? `${Math.round(last.efficiency * 100)}%` : "—"}
          </dd>
        </div>
        <div>
          <dt className="label-mono" title="Karp–Flatt metric">
            Serial part
          </dt>
          <dd className="readout text-lg text-foreground">
            {bench.serialFraction !== null && !isRecorded
              ? `${(bench.serialFraction * 100).toFixed(1)}%`
              : isRecorded
                ? "3.2%"
                : "—"}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-[34ch] text-xs leading-relaxed text-muted-foreground">
          {isRecorded
            ? (bench.skipReason ?? "Showing a recorded sweep.")
            : "The same workload at 1 to N workers. The gap from ideal is scheduling, shared cache, and cores that aren't really cores."}
        </p>
        <button
          type="button"
          onClick={() => void bench.run()}
          disabled={busy}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border px-3 py-1.5 font-mono text-2xs uppercase tracking-widest text-foreground transition-colors hover:border-thermal hover:text-primary-type focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          <RotateCw size={12} className={busy ? "animate-spin" : undefined} aria-hidden="true" />
          {busy ? "Running" : isRecorded ? "Run it here" : "Run again"}
        </button>
      </div>
    </div>
  );
}
