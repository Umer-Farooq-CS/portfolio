/** Pure benchmark helpers shared by the UI, worker, and tests. */

export interface BenchTask {
  /** First row assigned to this worker. */
  rowStart: number;
  /** Exclusive upper bound for assigned rows. */
  rowEnd: number;
  /** Distance to the next assigned row. Striding balances uneven row costs. */
  rowStep: number;
  width: number;
  height: number;
  maxIter: number;
}

export interface BenchResult {
  checksum: number;
  rows: number;
}

export interface BenchPoint {
  workers: number;
  ms: number;
  speedup: number;
  /** Speedup divided by worker count. 1.0 would be perfect scaling. */
  efficiency: number;
}

export type RowStripe = Pick<BenchTask, "rowStart" | "rowEnd" | "rowStep">;

/**
 * Assign every Nth row to the same worker.
 *
 * Mandelbrot rows vary sharply in cost near the set boundary. Contiguous bands
 * therefore leave some workers idle while another finishes a dense band. A
 * cyclic split samples the whole image in every worker and keeps the work even.
 */
export function stripeRows(height: number, count: number): RowStripe[] {
  const safeHeight = Math.max(0, Math.floor(height));
  const safeCount = Math.max(1, Math.floor(count));

  return Array.from({ length: safeCount }, (_, index) => ({
    rowStart: index,
    rowEnd: safeHeight,
    rowStep: safeCount,
  }));
}

export function rowsInTask({ rowStart, rowEnd, rowStep }: RowStripe): number {
  if (rowStart >= rowEnd) return 0;
  return Math.ceil((rowEnd - rowStart) / rowStep);
}

/** Deterministic, compute-bound Mandelbrot work performed by each Web Worker. */
export function computeBand({ rowStart, rowEnd, rowStep, width, height, maxIter }: BenchTask): number {
  let checksum = 0;

  for (let py = rowStart; py < rowEnd; py += rowStep) {
    const y0 = (py / height) * 2.4 - 1.2;

    for (let px = 0; px < width; px++) {
      const x0 = (px / width) * 3.0 - 2.1;

      let x = 0;
      let y = 0;
      let iteration = 0;

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

export function createBenchPoint(baselineMs: number, workers: number, ms: number): BenchPoint {
  const speedup = baselineMs / ms;
  return { workers, ms, speedup, efficiency: speedup / workers };
}

/** Karp–Flatt effective serial fraction, including parallel coordination costs. */
export function karpFlatt(speedup: number, workers: number): number | null {
  if (workers < 2 || speedup <= 0) return null;
  const fraction = (1 / speedup - 1 / workers) / (1 - 1 / workers);
  return Math.min(1, Math.max(0, fraction));
}
