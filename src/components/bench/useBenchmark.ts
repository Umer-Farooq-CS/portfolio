import { useCallback, useEffect, useRef, useState } from "react";
import { createBenchPoint, karpFlatt, stripeRows } from "./bench-core";
import type { BenchPoint, BenchResult, BenchTask } from "./bench-core";

export type { BenchPoint } from "./bench-core";

/**
 * Runs a real parallel speedup sweep in the visitor's browser: the same workload
 * at 1…N workers, timed, and reported as measured speedup against ideal.
 *
 * The numbers are honest measurements, so they include the things that actually
 * limit parallel scaling — worker startup, scheduler contention, shared caches,
 * and logical CPU threads that share physical execution resources. That is the point.
 */

export type BenchStatus = "idle" | "calibrating" | "running" | "done" | "skipped" | "unsupported";

export interface BenchState {
  status: BenchStatus;
  points: BenchPoint[];
  logicalCpus: number;
  maxWorkers: number;
  /** Karp–Flatt metric: the experimentally determined serial fraction. */
  serialFraction: number | null;
  /** Reason the live run was skipped, when it was. */
  skipReason: string | null;
}

/** Cap the sweep so the whole thing stays inside a few hundred milliseconds. */
const MAX_WORKERS = 8;
/** Worker counts to measure. Powers of two keep the sweep short and readable. */
const STEPS = [1, 2, 4, 8];
/** Best of N per step: a scheduler hiccup should not become a data point. */
const REPEATS = 2;
/** Target duration for the single-worker pass; long enough to amortize messaging. */
const TARGET_BASELINE_MS = 160;
const CALIBRATION_ITER = 220;

function createWorker(): Worker {
  return new Worker(new URL("./bench.worker.ts", import.meta.url), { type: "module" });
}

function runOnce(
  workers: Worker[],
  task: Omit<BenchTask, "rowStart" | "rowEnd" | "rowStep">,
): Promise<{ ms: number; checksum: number }> {
  const split = stripeRows(task.height, workers.length);
  const started = performance.now();

  return Promise.all(
    workers.map(
      (worker, index) =>
        new Promise<BenchResult>((resolve, reject) => {
          const onMessage = (event: MessageEvent<BenchResult>) => {
            worker.removeEventListener("message", onMessage);
            worker.removeEventListener("error", onError);
            resolve(event.data);
          };
          const onError = (event: ErrorEvent) => {
            worker.removeEventListener("message", onMessage);
            worker.removeEventListener("error", onError);
            reject(new Error(event.message));
          };
          worker.addEventListener("message", onMessage);
          worker.addEventListener("error", onError);
          worker.postMessage({ ...task, ...split[index] } satisfies BenchTask);
        }),
    ),
  ).then((results) => ({
    ms: performance.now() - started,
    checksum: results.reduce((sum, r) => sum + r.checksum, 0),
  }));
}

interface UseBenchmarkOptions {
  /** When false, the live run is skipped and a precomputed curve is used instead. */
  enabled: boolean;
}

export function useBenchmark({ enabled }: UseBenchmarkOptions) {
  const logicalCpus = typeof navigator === "undefined" ? 0 : (navigator.hardwareConcurrency ?? 0);
  const maxWorkers = Math.max(1, Math.min(logicalCpus || 1, MAX_WORKERS));

  const [state, setState] = useState<BenchState>({
    status: "idle",
    points: [],
    logicalCpus,
    maxWorkers,
    serialFraction: null,
    skipReason: null,
  });

  const cancelled = useRef(false);
  const running = useRef(false);

  const run = useCallback(async () => {
    if (running.current) return;

    if (typeof Worker === "undefined") {
      setState((s) => ({ ...s, status: "unsupported", skipReason: "This browser has no Web Workers." }));
      return;
    }
    if (logicalCpus <= 2) {
      setState((s) => ({
        ...s,
        status: "skipped",
        skipReason: `Only ${logicalCpus || "1"} logical CPU${logicalCpus === 1 ? "" : "s"} available — a sweep here would measure noise.`,
      }));
      return;
    }
    if (!enabled) {
      setState((s) => ({ ...s, status: "skipped", skipReason: "Reduced motion or data saving is on." }));
      return;
    }

    running.current = true;
    cancelled.current = false;
    const pool: Worker[] = [];

    try {
      setState((s) => ({ ...s, status: "calibrating", points: [], serialFraction: null, skipReason: null }));

      for (let i = 0; i < maxWorkers; i++) pool.push(createWorker());

      const width = 320;

      // Warm every worker before calibration. Otherwise module startup and the
      // first JIT pass inflate calibration and leave the measured task too small.
      await runOnce(pool, {
        width,
        height: Math.max(80, maxWorkers * 12),
        maxIter: CALIBRATION_ITER,
      });
      if (cancelled.current) return;

      // Size the problem from two warmed passes and ignore a scheduler hiccup.
      let calibrationMs = Number.POSITIVE_INFINITY;
      for (let attempt = 0; attempt < 2; attempt++) {
        const calibration = await runOnce([pool[0]], {
          width,
          height: 60,
          maxIter: CALIBRATION_ITER,
        });
        calibrationMs = Math.min(calibrationMs, calibration.ms);
      }

      const rowsPerMs = 60 / Math.max(calibrationMs, 1);
      const height = Math.max(80, Math.min(1800, Math.round(rowsPerMs * TARGET_BASELINE_MS)));
      const task = { width, height, maxIter: CALIBRATION_ITER };

      setState((s) => ({ ...s, status: "running" }));

      const points: BenchPoint[] = [];
      let baselineMs = 0;
      let baselineChecksum = 0;

      const steps = STEPS.filter((step) => step <= maxWorkers);
      if (!steps.includes(maxWorkers)) steps.push(maxWorkers);

      for (const workers of steps) {
        if (cancelled.current) return;

        let ms = Number.POSITIVE_INFINITY;
        let checksum = 0;
        for (let attempt = 0; attempt < REPEATS; attempt++) {
          const run = await runOnce(pool.slice(0, workers), task);
          if (cancelled.current) return;
          if (run.ms < ms) ms = run.ms;
          checksum = run.checksum;
        }

        if (workers === 1) {
          baselineMs = ms;
          baselineChecksum = checksum;
        } else if (checksum !== baselineChecksum) {
          // Every worker count must compute the same answer, or the speedup is a lie.
          throw new Error("Checksum mismatch across worker counts");
        }

        points.push(createBenchPoint(baselineMs, workers, ms));
        setState((s) => ({ ...s, points: [...points] }));

        // Yield so the reveal animates rather than blocking to the final frame.
        await new Promise((resolve) => setTimeout(resolve, 16));
      }

      const last = points[points.length - 1];
      setState((s) => ({
        ...s,
        status: "done",
        points,
        serialFraction: last ? karpFlatt(last.speedup, last.workers) : null,
      }));
    } catch (error) {
      setState((s) => ({
        ...s,
        status: "skipped",
        skipReason: error instanceof Error ? error.message : "The benchmark could not complete.",
      }));
    } finally {
      for (const worker of pool) worker.terminate();
      running.current = false;
    }
  }, [enabled, logicalCpus, maxWorkers]);

  useEffect(() => {
    return () => {
      cancelled.current = true;
    };
  }, []);

  return { ...state, run };
}

/**
 * A recorded browser sweep, shown when the live run is skipped
 * (reduced motion, data saving, too few logical CPUs, or no worker support) so the figure
 * is never empty. Labelled as recorded, never passed off as the visitor's own.
 */
const RECORDED_TIMINGS = [
  { workers: 1, ms: 112 },
  { workers: 2, ms: 58 },
  { workers: 3, ms: 40 },
  { workers: 4, ms: 31 },
  { workers: 5, ms: 26 },
  { workers: 6, ms: 23 },
  { workers: 7, ms: 21 },
  { workers: 8, ms: 18 },
];

export const RECORDED_SWEEP: BenchPoint[] = RECORDED_TIMINGS.map(({ workers, ms }) =>
  createBenchPoint(RECORDED_TIMINGS[0].ms, workers, ms),
);
