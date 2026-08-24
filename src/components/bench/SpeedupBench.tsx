import { useEffect, useRef, useState } from "react";
import { RotateCw } from "lucide-react";
import { motion } from "motion/react";
import { useMotionPolicy } from "@/lib/motion-policy";
import SpeedupChart from "./SpeedupChart";
import { RECORDED_SWEEP, useBenchmark } from "./useBenchmark";
import { karpFlatt } from "./bench-core";

/**
 * The hero instrument: a real parallel speedup sweep, run on the visitor's own
 * machine, plotted against the ideal line.
 *
 * It starts itself once, on view, and only when that is a reasonable thing to do.
 * Reduced-motion and data-saving preferences disable autoplay, not computation:
 * a deliberate click can still run the real benchmark and render its final state.
 */
export default function SpeedupBench() {
  const { enabled: motionEnabled } = useMotionPolicy();
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoStarted, setAutoStarted] = useState(false);

  const saveData =
    typeof navigator !== "undefined" &&
    Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);

  const allowAutoRun = motionEnabled && !saveData;
  const bench = useBenchmark({ enabled: true });

  // Start when the panel is actually on screen, so a visitor who never scrolls
  // here never pays for it.
  useEffect(() => {
    if (autoStarted || !allowAutoRun) return;
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
  }, [allowAutoRun, autoStarted, bench]);

  const isRecorded =
    bench.status === "skipped" || bench.status === "unsupported" || (bench.status === "idle" && !allowAutoRun);
  const points = isRecorded ? RECORDED_SWEEP : bench.points;
  const maxWorkers = isRecorded ? RECORDED_SWEEP.length : bench.maxWorkers;
  const last = points[points.length - 1];
  const busy = bench.status === "calibrating" || bench.status === "running";

  const statusLine = (() => {
    if (isRecorded) return "recorded reference sweep";
    if (bench.status === "calibrating") return "sizing the problem for this machine";
    if (bench.status === "running") {
      return last ? `measured through ${last.workers} workers` : `measuring up to ${maxWorkers} workers`;
    }
    if (bench.status === "done") return "measured on your machine, just now";
    return "ready";
  })();

  const effectiveSerialFraction = isRecorded
    ? last
      ? karpFlatt(last.speedup, last.workers)
      : null
    : bench.serialFraction;

  return (
    <div
      ref={containerRef}
      className="rounded-lg border border-thermal/25 bg-thermal/5 p-4 sm:p-5"
      aria-busy={busy}
    >
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <p className="label-mono text-primary-type">Live benchmark</p>
        <p
          aria-live="polite"
          className={`readout text-2xs ${bench.status === "done" ? "text-systems-type" : "text-muted-foreground"}`}
        >
          {statusLine}
        </p>
      </div>

      <SpeedupChart points={points} maxWorkers={maxWorkers} animate={motionEnabled} />

      {/* The readout. Every value is a measurement, and each says what it means. */}
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border pt-4 sm:grid-cols-4">
        <div>
          <dt className="label-mono">Workers</dt>
          <dd className="readout text-lg text-foreground">{last?.workers ?? "—"}</dd>
        </div>
        <div>
          <dt className="label-mono">Speedup</dt>
          <motion.dd
            key={`speed-${last?.speedup ?? "empty"}`}
            initial={motionEnabled ? { opacity: 0.35, y: 3 } : false}
            animate={{ opacity: 1, y: 0 }}
            className="readout text-lg text-primary-type"
          >
            {last ? `${last.speedup.toFixed(2)}×` : "—"}
          </motion.dd>
        </div>
        <div>
          <dt className="label-mono">Parallel efficiency</dt>
          <motion.dd
            key={`efficiency-${last?.efficiency ?? "empty"}`}
            initial={motionEnabled ? { opacity: 0.35, y: 3 } : false}
            animate={{ opacity: 1, y: 0 }}
            className="readout text-lg text-cryo-type"
          >
            {last ? `${Math.round(last.efficiency * 100)}%` : "—"}
          </motion.dd>
        </div>
        <div>
          <dt className="label-mono" title="Karp–Flatt effective serial fraction">
            Serial + overhead
          </dt>
          <dd className="readout text-lg text-foreground">
            {effectiveSerialFraction !== null ? `${(effectiveSerialFraction * 100).toFixed(1)}%` : "—"}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-[34ch] text-xs leading-relaxed text-muted-foreground">
          {isRecorded
            ? (bench.skipReason ?? "Showing a recorded sweep.")
            : `The same compute-bound workload at 1, 2, 4 … N workers. Efficiency is speedup per worker; the gap includes coordination, scheduling, and shared hardware.${bench.logicalCpus ? ` ${bench.logicalCpus} logical CPUs reported by the browser.` : ""}`}
        </p>
        <button
          type="button"
          onClick={() => void bench.run()}
          disabled={busy}
          className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-md border border-border px-3 py-2 font-mono text-2xs uppercase tracking-widest text-foreground transition-[color,border-color,transform] hover:border-thermal hover:text-primary-type active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          <RotateCw size={12} className={busy ? "animate-spin" : undefined} aria-hidden="true" />
          {busy ? "Running" : isRecorded ? "Run it here" : "Run again"}
        </button>
      </div>
    </div>
  );
}
