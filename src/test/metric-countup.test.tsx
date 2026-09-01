import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { MotionPolicyProvider } from "@/lib/motion-policy";
import { Metric } from "@/components/kit/Primitives";
import { parseCountUp } from "@/lib/useCountUp";

/**
 * The count-up must never change what a metric finally says. These tests pin
 * the settled string, the "no start value on first paint" rule, the reduced
 * motion escape hatch, and the two things a moving number can break: layout and
 * the accessibility tree.
 *
 * As in `figures.test.tsx`, the real `useReducedMotion` caches `matchMedia` in
 * module state, so it is re-pointed at the current `matchMedia` per render.
 */
vi.mock("motion/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("motion/react")>();
  return {
    ...actual,
    useReducedMotion: () => window.matchMedia("(prefers-reduced-motion)").matches,
  };
});

function setReducedMotion(reduce: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: reduce && query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

/** Hand-driven frame clock, so a count can be stepped instead of waited out. */
let frames: FrameRequestCallback[] = [];

function drainFrames(now: number) {
  const pending = frames;
  frames = [];
  act(() => {
    for (const frame of pending) frame(now);
  });
}

beforeEach(() => {
  setReducedMotion(false);
  frames = [];
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    frames.push(callback);
    return frames.length;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const renderMetric = (ui: ReactElement) =>
  render(<MotionPolicyProvider>{ui}</MotionPolicyProvider>);

const readout = (container: HTMLElement) => container.querySelector(".readout") as HTMLElement;

/** Every shape the site actually feeds a Metric. */
const VALUES = [
  "6×",
  "92%",
  "34",
  "~50",
  "15 min",
  "4 × 4",
  "3×",
  "100%",
  "0",
  "5",
  "Monthly",
  "15 tasks",
  "~93%",
  "20+",
  "3rd",
];

describe("Metric count-up", () => {
  it("renders the value byte-identically before any frame runs", () => {
    for (const value of VALUES) {
      const { container, unmount } = renderMetric(
        <dl>
          <Metric value={value} label="Label" />
        </dl>,
      );

      // No start value is ever painted: the first render is the real reading.
      expect(readout(container).textContent).toBe(value);
      unmount();
    }
  });

  it("settles back to the exact value once the count finishes", () => {
    for (const value of VALUES) {
      const { container, unmount } = renderMetric(
        <dl>
          <Metric value={value} label="Label" />
        </dl>,
      );

      drainFrames(0);
      drainFrames(10_000);

      expect(readout(container).textContent).toBe(value);
      // And the DOM is back to a single text node, exactly as at rest.
      expect(readout(container).querySelector("[aria-hidden]")).toBeNull();
      expect(readout(container).querySelector(".sr-only")).toBeNull();
      unmount();
    }
  });

  it("moves only the leading number, keeping prefix and suffix verbatim", () => {
    const { container } = renderMetric(
      <dl>
        <Metric value="~93%" label="Uptime" />
      </dl>,
    );

    drainFrames(0);
    drainFrames(100);

    const animating = readout(container).querySelector("[aria-hidden='true']") as HTMLElement;
    expect(animating).not.toBeNull();
    expect(animating.textContent).toMatch(/^~\d{1,2}%$/);
    expect(animating.textContent).not.toBe("~93%");
  });

  it("never animates a value with no leading number", () => {
    const { container } = renderMetric(
      <dl>
        <Metric value="Monthly" label="Cadence" />
      </dl>,
    );

    drainFrames(0);
    drainFrames(100);

    expect(readout(container).textContent).toBe("Monthly");
    expect(readout(container).querySelector("[aria-hidden]")).toBeNull();
  });

  it("never animates a value with nowhere to count", () => {
    const { container } = renderMetric(
      <dl>
        <Metric value="0" label="Manual OS install steps" />
      </dl>,
    );

    drainFrames(0);
    drainFrames(100);

    expect(readout(container).textContent).toBe("0");
    expect(readout(container).querySelector("[aria-hidden]")).toBeNull();
  });

  it("renders the final value immediately when motion is reduced", () => {
    setReducedMotion(true);
    const { container } = renderMetric(
      <dl>
        <Metric value="100%" label="Cluster state in Git" />
      </dl>,
    );

    drainFrames(0);
    drainFrames(100);

    expect(readout(container).textContent).toBe("100%");
    expect(readout(container).querySelector("[aria-hidden]")).toBeNull();
  });

  it("reserves the final digit width so nothing reflows mid-count", () => {
    const { container } = renderMetric(
      <dl>
        <Metric value="100%" label="Cluster state in Git" />
      </dl>,
    );

    drainFrames(0);
    drainFrames(100);

    const digits = readout(container).querySelector(
      "[aria-hidden='true'] span",
    ) as HTMLElement;
    // Three characters in "100", and .readout is monospaced + tabular-nums,
    // so 3ch is exactly the settled width.
    expect(digits.style.minWidth).toBe("3ch");
    expect(digits.className).toContain("text-right");
  });

  it("keeps the measured value in the accessibility tree while counting", () => {
    const { container } = renderMetric(
      <dl>
        <Metric value="92%" label="Circuit generation" />
      </dl>,
    );

    drainFrames(0);
    drainFrames(100);

    // The moving digits are hidden from assistive tech...
    const animating = readout(container).querySelector("[aria-hidden='true']");
    expect(animating).not.toBeNull();
    // ...and the real reading is what gets announced, unchanged.
    expect(screen.getByText("92%")).toHaveClass("sr-only");
  });

  it("keeps the label, baseline and note untouched by the count", () => {
    const { container } = renderMetric(
      <dl>
        <Metric value="6×" label="Faster inference" baseline="FP32" note="FP16 Tensor Cores" />
      </dl>,
    );

    drainFrames(0);
    drainFrames(100);

    expect(screen.getByText("Faster inference")).toBeInTheDocument();
    expect(container.textContent).toContain("from FP32 · FP16 Tensor Cores");
  });
});

describe("parseCountUp", () => {
  it("splits prefix, number and suffix", () => {
    expect(parseCountUp("~50")).toMatchObject({ prefix: "~", number: "50", suffix: "" });
    expect(parseCountUp("15 min")).toMatchObject({ prefix: "", number: "15", suffix: " min" });
    expect(parseCountUp("4 × 4")).toMatchObject({ prefix: "", number: "4", suffix: " × 4" });
    expect(parseCountUp("100%")).toMatchObject({ prefix: "", number: "100", suffix: "%" });
    expect(parseCountUp("20+")).toMatchObject({ prefix: "", number: "20", suffix: "+" });
    expect(parseCountUp("3rd")).toMatchObject({ prefix: "", number: "3", suffix: "rd" });
  });

  it("keeps decimal places", () => {
    expect(parseCountUp("1.5×")).toMatchObject({ number: "1.5", decimals: 1, suffix: "×" });
    expect(parseCountUp("34")).toMatchObject({ decimals: 0 });
  });

  it("declines anything without a leading number", () => {
    expect(parseCountUp("Monthly")).toBeNull();
    expect(parseCountUp("")).toBeNull();
    expect(parseCountUp("N/A")).toBeNull();
  });

  it("declines a number that is only part of a larger literal", () => {
    expect(parseCountUp("1,200")).toBeNull();
  });

  it("round-trips every part back to the original string", () => {
    for (const value of VALUES) {
      const parts = parseCountUp(value);
      if (!parts) continue;
      expect(`${parts.prefix}${parts.number}${parts.suffix}`).toBe(value);
    }
  });
});
