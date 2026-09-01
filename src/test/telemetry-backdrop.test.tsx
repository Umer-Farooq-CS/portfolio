import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MotionPolicyProvider } from "@/lib/motion-policy";
import TelemetryBackdrop from "@/components/shell/TelemetryBackdrop";

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

function renderBackdrop(path: string) {
  return render(
    <MotionPolicyProvider>
      <MemoryRouter initialEntries={[path]}>
        <TelemetryBackdrop />
      </MemoryRouter>
    </MotionPolicyProvider>,
  );
}

afterEach(() => {
  setReducedMotion(false);
});

describe("telemetry backdrop", () => {
  it("keeps the route's semantic tone", () => {
    // The parallax must not have cost the backdrop its one piece of meaning:
    // the field still carries the domain colour of the route behind it.
    for (const [path, tone] of [
      ["/lab", "cryo"],
      ["/notes", "neural"],
      ["/about", "systems"],
      ["/projects/anything", "interface"],
    ] as const) {
      const { container, unmount } = renderBackdrop(path);
      expect(container.querySelector(".telemetry-backdrop")).toHaveAttribute("data-accent", tone);
      unmount();
    }
  });

  it("drifts two planes and leaves the field's marks alone", () => {
    setReducedMotion(false);
    const { container } = renderBackdrop("/lab");
    const backdrop = container.querySelector(".telemetry-backdrop");

    expect(backdrop).toHaveAttribute("data-parallax", "true");
    // Depth comes from two transformed layers, and only two: the grid behind
    // the traces. Anything more is per-frame work behind every page.
    expect(backdrop?.children).toHaveLength(2);
    expect(container.querySelector(".telemetry-backdrop__grid")).not.toBeNull();
    expect(container.querySelectorAll(".telemetry-backdrop__trace")).toHaveLength(3);
    expect(container.querySelectorAll(".telemetry-backdrop__nodes circle")).toHaveLength(9);
    expect(container.querySelector(".telemetry-backdrop__reticle")).not.toBeNull();
  });

  it("stays completely static when the visitor asked for less motion", () => {
    setReducedMotion(true);
    const { container } = renderBackdrop("/lab");

    expect(container.querySelector(".telemetry-backdrop")).toHaveAttribute(
      "data-parallax",
      "false",
    );
    // No transform, and none of the classes that exist only to carry one — the
    // backdrop is the DOM it was before the parallax.
    for (const selector of [".telemetry-backdrop__grid", ".telemetry-backdrop__field"]) {
      const plane = container.querySelector(selector);
      expect(plane?.getAttribute("class")).toBe(selector.slice(1));
      expect(plane?.getAttribute("style") ?? "").not.toContain("transform");
    }
  });
});
