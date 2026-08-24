/// <reference lib="webworker" />

import { computeBand, rowsInTask } from "./bench-core";
import type { BenchResult, BenchTask } from "./bench-core";

export type { BenchResult, BenchTask } from "./bench-core";

/**
 * Benchmark worker: escape-time iteration over striped rows of the complex
 * plane (a Mandelbrot slice). Stripes keep the uneven fractal work balanced.
 *
 * Why this workload: it is compute-bound, embarrassingly parallel, deterministic,
 * and — critically — its input and output are both O(1). Each worker receives a
 * small task descriptor and returns one checksum, so the measurement reflects
 * real parallel compute rather than the cost of shuffling arrays between threads.
 *
 * SharedArrayBuffer would allow a shared-memory workload, but it requires COOP/COEP
 * headers that GitHub Pages cannot set, so message-passing with tiny payloads is
 * the honest choice here.
 */

self.onmessage = (event: MessageEvent<BenchTask>) => {
  const result: BenchResult = {
    checksum: computeBand(event.data),
    rows: rowsInTask(event.data),
  };
  (self as unknown as Worker).postMessage(result);
};
