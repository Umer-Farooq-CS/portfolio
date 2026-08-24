import { describe, expect, it } from "vitest";
import {
  computeBand,
  createBenchPoint,
  karpFlatt,
  rowsInTask,
  stripeRows,
} from "@/components/bench/bench-core";

describe("browser benchmark model", () => {
  it("assigns every row exactly once with evenly sized stripes", () => {
    const stripes = stripeRows(103, 8);
    const assignedRows = stripes
      .flatMap(({ rowStart, rowEnd, rowStep }) => {
        const rows: number[] = [];
        for (let row = rowStart; row < rowEnd; row += rowStep) rows.push(row);
        return rows;
      })
      .sort((a, b) => a - b);

    expect(assignedRows).toEqual(Array.from({ length: 103 }, (_, index) => index));
    const rowCounts = stripes.map(rowsInTask);
    expect(Math.max(...rowCounts) - Math.min(...rowCounts)).toBeLessThanOrEqual(1);
  });

  it("balances the uneven Mandelbrot workload across eight workers", () => {
    const baseTask = { width: 96, height: 160, maxIter: 80 };
    const work = stripeRows(baseTask.height, 8).map((stripe) =>
      computeBand({ ...baseTask, ...stripe }),
    );
    const balanceEfficiency = work.reduce((sum, value) => sum + value, 0) / (Math.max(...work) * work.length);

    expect(balanceEfficiency).toBeGreaterThan(0.9);
  });

  it("derives speedup, efficiency, and Karp–Flatt overhead from timings", () => {
    const point = createBenchPoint(112, 8, 18);

    expect(point.speedup).toBeCloseTo(6.2222, 4);
    expect(point.efficiency).toBeCloseTo(0.7778, 4);
    expect(karpFlatt(point.speedup, point.workers)).toBeCloseTo(0.0408, 4);
    expect(karpFlatt(1, 1)).toBeNull();
  });
});
