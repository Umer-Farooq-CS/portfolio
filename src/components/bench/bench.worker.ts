/// <reference lib="webworker" />

/**
 * Benchmark worker: escape-time iteration over a horizontal band of the complex
 * plane (a Mandelbrot slice).
 *
 * Why this workload: it is compute-bound, embarrassingly parallel, deterministic,
 * and — critically — its input and output are both O(1). Each worker receives four
 * numbers and returns one checksum, so the measurement reflects real parallel
 * compute rather than the cost of shuffling arrays between threads.
 *
 * SharedArrayBuffer would allow a shared-memory workload, but it requires COOP/COEP
 * headers that GitHub Pages cannot set, so message-passing with tiny payloads is
 * the honest choice here.
 */

export interface BenchTask {
  /** Inclusive first row of this worker's band. */
  rowStart: number;
  /** Exclusive last row. */
  rowEnd: number;
  width: number;
  height: number;
  maxIter: number;
}

export interface BenchResult {
  checksum: number;
  rows: number;
}

function computeBand({ rowStart, rowEnd, width, height, maxIter }: BenchTask): number {
  let checksum = 0;

  for (let py = rowStart; py < rowEnd; py++) {
    const y0 = (py / height) * 2.4 - 1.2;

    for (let px = 0; px < width; px++) {
      const x0 = (px / width) * 3.0 - 2.1;

      let x = 0;
      let y = 0;
      let iteration = 0;

      // Squared magnitude kept inline; no allocation inside the hot loop.
      while (x * x + y * y <= 4 && iteration < maxIter) {
        const xTemp = x * x - y * y + x0;
        y = 2 * x * y + y0;
        x = xTemp;
        iteration++;
      }

      checksum += iteration;
    }
  }

  return checksum;
}

self.onmessage = (event: MessageEvent<BenchTask>) => {
  const result: BenchResult = {
    checksum: computeBand(event.data),
    rows: event.data.rowEnd - event.data.rowStart,
  };
  (self as unknown as Worker).postMessage(result);
};
