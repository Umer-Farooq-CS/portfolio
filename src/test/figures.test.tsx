import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { MotionPolicyProvider } from "@/lib/motion-policy";
import PipelineTrace from "@/components/lab/PipelineTrace";
import ProjectFigures, {
  BeforeAfterBars,
  FIGURES,
  StepSeries,
} from "@/components/charts/ProjectFigures";
import { PROJECTS } from "@/data/projects";

/**
 * The real `useReducedMotion` reads `matchMedia` once and caches it in module
 * state, so a single test file could otherwise only ever see one setting. The
 * hook is re-pointed at `matchMedia` per render; `setReducedMotion` below is
 * still the only thing any test touches.
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

const withMotionPolicy = (ui: ReactElement) =>
  render(<MotionPolicyProvider>{ui}</MotionPolicyProvider>);

beforeEach(() => {
  setReducedMotion(false);
});

describe("PipelineTrace", () => {
  it("names every stage of the pipeline", () => {
    withMotionPolicy(<PipelineTrace />);

    for (const stage of ["DESIGNER", "VALIDATOR", "OPTIMIZER", "EDUCATOR"]) {
      expect(screen.getByText(stage)).toBeInTheDocument();
    }
    expect(screen.getByText("KNOWLEDGE BASE")).toBeInTheDocument();
    expect(screen.getByText("PATCH · RETRY")).toBeInTheDocument();
  });

  it("describes the flow for assistive technology", () => {
    const { container } = withMotionPolicy(<PipelineTrace />);

    const diagram = screen.getByRole("img");
    expect(diagram.getAttribute("aria-label")).toMatch(/Validator/);

    // The ordered alternative: prompt, four agents, output.
    const steps = container.querySelectorAll("ol.sr-only li");
    expect(steps).toHaveLength(6);
    expect(steps[0].textContent).toMatch(/prompt/i);
    expect(steps[2].textContent).toMatch(/back to the Designer/i);
    expect(steps[5].textContent).toMatch(/validated circuit/i);
  });

  it("reports the result against its baseline", () => {
    withMotionPolicy(<PipelineTrace />);

    expect(screen.getByText("92%")).toBeInTheDocument();
    expect(screen.getByText("52%")).toBeInTheDocument();
  });

  it("primes the connectors for drawing when motion is allowed", () => {
    const { container } = withMotionPolicy(<PipelineTrace />);

    // createDrawable stamps pathLength on every connector it will animate.
    const connector = container.querySelector(".pt-flow");
    expect(connector).toHaveAttribute("pathLength");
  });

  it("renders the final state with no timeline when motion is reduced", () => {
    setReducedMotion(true);
    const { container } = withMotionPolicy(<PipelineTrace />);

    const connector = container.querySelector(".pt-flow");
    expect(connector).not.toHaveAttribute("pathLength");
    expect(connector).not.toHaveAttribute("stroke-dasharray");

    const node = container.querySelector<SVGGElement>(".pt-node");
    expect(node?.style.opacity).toBe("");

    // Nothing to replay, so nothing offers to.
    expect(screen.queryByRole("button", { name: /replay/i })).not.toBeInTheDocument();

    // The stages are still all there.
    expect(screen.getByText("DESIGNER")).toBeInTheDocument();
    expect(container.querySelectorAll("ol.sr-only li")).toHaveLength(6);
  });

  it("offers a keyboard-reachable replay control", async () => {
    const user = userEvent.setup();
    withMotionPolicy(<PipelineTrace />);

    const replay = screen.getByRole("button", { name: /replay/i });
    await user.tab();
    expect(replay).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(replay).toBeInTheDocument();
  });
});

describe("BeforeAfterBars", () => {
  const props = {
    title: "Circuit generation success",
    unit: "%",
    baseline: { label: "SINGLE AGENT", value: 52 },
    result: { label: "MULTI-AGENT", value: 92 },
    delta: "+40 POINTS",
  };

  it("shows the baseline, the result and the delta", () => {
    withMotionPolicy(<BeforeAfterBars {...props} />);

    expect(screen.getByText("SINGLE AGENT")).toBeInTheDocument();
    expect(screen.getByText("52%")).toBeInTheDocument();
    expect(screen.getByText("MULTI-AGENT")).toBeInTheDocument();
    expect(screen.getByText("92%")).toBeInTheDocument();
    expect(screen.getByText("+40 POINTS")).toBeInTheDocument();
  });

  it("carries both numbers in its label", () => {
    withMotionPolicy(<BeforeAfterBars {...props} />);

    const label = screen.getByRole("img").getAttribute("aria-label") ?? "";
    expect(label).toContain("52%");
    expect(label).toContain("92%");
    expect(label).toContain("+40 POINTS");
  });

  it("scales bars against the shared ceiling", () => {
    const { container } = withMotionPolicy(<BeforeAfterBars {...props} />);

    const bars = container.querySelectorAll("rect");
    const widths = Array.from(bars, (bar) => Number(bar.getAttribute("width")));
    // 52 and 92 against a ceiling of 100: the result bar is the longer one.
    expect(widths[0]).toBeCloseTo(104, 0);
    expect(widths[1]).toBeCloseTo(184, 0);
  });
});

describe("StepSeries", () => {
  it("labels every variant and its value", () => {
    withMotionPolicy(
      <StepSeries
        title="Speedup by version"
        unit="×"
        decimals={1}
        points={[
          { label: "V1 CPU", value: 1 },
          { label: "V3 GPU", value: 2.5 },
          { label: "V5 TC", value: 6 },
        ]}
      />,
    );

    expect(screen.getByText("V1 CPU")).toBeInTheDocument();
    expect(screen.getByText("V5 TC")).toBeInTheDocument();
    expect(screen.getByText("6.0×")).toBeInTheDocument();

    const label = screen.getByRole("img").getAttribute("aria-label") ?? "";
    expect(label).toContain("3 variants");
  });
});

describe("FIGURES", () => {
  it("only keys off project slugs that exist", () => {
    const slugs = PROJECTS.map((project) => project.slug);
    for (const slug of Object.keys(FIGURES)) {
      expect(slugs).toContain(slug);
    }
  });

  it("gives every figure a delta and a non-zero baseline reference", () => {
    for (const figures of Object.values(FIGURES)) {
      expect(figures.length).toBeGreaterThan(0);
      for (const figure of figures) {
        if (figure.kind === "before-after") {
          expect(figure.props.delta).not.toBe("");
          expect(figure.props.result.value).not.toBe(figure.props.baseline.value);
        } else {
          expect(figure.props.points.length).toBeGreaterThan(1);
        }
      }
    }
  });

  it("renders the figures for a slug, and nothing for a slug without any", () => {
    const { container } = withMotionPolicy(<ProjectFigures slug="cirq-rag" />);
    expect(screen.getByText("+40 POINTS")).toBeInTheDocument();

    const empty = render(<ProjectFigures slug="qcanvas" />);
    expect(empty.container.firstChild).toBeNull();
    expect(container).toBeTruthy();
  });
});
