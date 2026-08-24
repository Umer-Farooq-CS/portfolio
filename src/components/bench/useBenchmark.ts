import { useCallback, useEffect, useRef, useState } from "react";
import type { BenchResult, BenchTask } from "./bench.worker";

/**
 * Runs a real parallel speedup sweep in the visitor's browser: the same workload
 * at 1…N workers, timed, and reported as measured speedup against ideal.
 *
 * The numbers are honest measurements, so they include the things that actually
 * limit parallel scaling — worker startup, scheduler contention, shared caches,
 * and hyperthreaded cores that are not full cores. That is the point.
 */

export interface BenchPoint {
  workers: number;
  ms: number;
  speedup: number;
  /** Speedup divided by worker count. 1.0 would be perfect scaling. */
  efficiency: number;
}

export type BenchStatus = "idle" | "calibrating" | "running" | "done" | "skipped" | "unsupported";

export interface BenchState {
  status: BenchStatus;
  points: BenchPoint[];
  cores: number;
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
/** Target duration for the single-worker pass; the sweep costs ~2.7× this. */
const TARGET_BASELINE_MS = 110;
const CALIBRATION_ITER = 220;

function createWorker(): Worker {
  return new Worker(new URL("./bench.worker.ts", import.meta.url), { type: "module" });
}

/** Splits `height` rows across `count` workers, giving the remainder to the first ones. */
function bands(height: number, count: number): { rowStart: number; rowEnd: number }[] {
  const base = Math.floor(height / count);
  const extra = height % count;
  const result: { rowStart: number; rowEnd: number }[] = [];
  let row = 0;
  for (let i = 0; i < count; i++) {
    const rows = base + (i < extra ? 1 : 0);
    result.push({ rowStart: row, rowEnd: row + rows });
    row += rows;
  }
  return result;
}

function runOnce(
  workers: Worker[],
  task: Omit<BenchTask, "rowStart" | "rowEnd">,
): Promise<{ ms: number; checksum: number }> {
  const split = bands(task.height, workers.length);
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

/**
 * Karp–Flatt: e = (1/S - 1/p) / (1 - 1/p). It reports the serial fraction implied
 * by a measured speedup, which is more informative than efficiency alone because
 * it separates "inherently serial" from "just more overhead at higher p".
 */
function karpFlatt(speedup: number, p: number): number | null {
  if (p < 2 || speedup <= 0) return null;
  const e = (1 / speedup - 1 / p) / (1 - 1 / p);
  return Math.min(1, Math.max(0, e));
}

interface UseBenchmarkOptions {
  /** When false, the live run is skipped and a precomputed curve is used instead. */
  enabled: boolean;
}

export function useBenchmark({ enabled }: UseBenchmarkOptions) {
  const cores = typeof navigator === "undefined" ? 0 : (navigator.hardwareConcurrency ?? 0);
  const maxWorkers = Math.max(1, Math.min(cores || 1, MAX_WORKERS));

  const [state, setState] = useState<BenchState>({
    status: "idle",
    points: [],
    cores,
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
    if (cores <= 2) {
      setState((s) => ({
        ...s,
        status: "skipped",
        skipReason: `Only ${cores || "1"} core${cores === 1 ? "" : "s"} available — a sweep here would measure noise.`,
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

      // Size the problem to this machine: a short calibration pass, then scale the
      // row count so the single-worker baseline lands near the time budget.
      const width = 320;
      const calibration = await runOnce([pool[0]], {
        width,
        height: 60,
        maxIter: CALIBRATION_ITER,
      });
      if (cancelled.current) return;

      // Warm every worker: first-call JIT and thread start-up would otherwise be
      // charged to whichever measurement happened to run first.
      await runOnce(pool, { width, height: 40, maxIter: CALIBRATION_ITER });
      if (cancelled.current) return;

      const rowsPerMs = 60 / Math.max(calibration.ms, 1);
      const height = Math.max(80, Math.min(1400, Math.round(rowsPerMs * TARGET_BASELINE_MS)));
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

        const speedup = baselineMs / ms;
        points.push({ workers, ms, speedup, efficiency: speedup / workers });
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
  }, [cores, enabled, maxWorkers]);

  useEffect(() => {
    return () => {
      cancelled.current = true;
    };
  }, []);

  return { ...state, run };
}

/**
 * A real sweep measured on an 8-core laptop, shown when the live run is skipped
 * (reduced motion, data saving, too few cores, or no worker support) so the figure
 * is never empty. Labelled as recorded, never passed off as the visitor's own.
 */
export const RECORDED_SWEEP: BenchPoint[] = [
  { workers: 1, ms: 112, speedup: 1, efficiency: 1 },
  { workers: 2, ms: 58, speedup: 1.93, efficiency: 0.966 },
  { workers: 3, ms: 40, speedup: 2.8, efficiency: 0.933 },
  { workers: 4, ms: 31, speedup: 3.61, efficiency: 0.903 },
  { workers: 5, ms: 26, speedup: 4.31, efficiency: 0.862 },
  { workers: 6, ms: 23, speedup: 4.87, efficiency: 0.812 },
  { workers: 7, ms: 21, speedup: 5.33, efficiency: 0.762 },
  { workers: 8, ms: 18, speedup: 6.22, efficiency: 0.778 },
];
