import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TechLogoRail from "@/components/technology/TechLogoRail";
import { TechnologyChip } from "@/components/technology/TechnologyMark";
import { PROJECTS } from "@/data/projects";
import {
  TECHNOLOGY_RAIL_ITEMS,
  getTechnologyMark,
} from "@/data/technologyMarks";
import { MotionPolicyProvider } from "@/lib/motion-policy";
import { ScrollMotionProvider } from "@/lib/scroll-motion";

describe("technology marks", () => {
  it("grounds every rail entry in an exact project technology", () => {
    for (const item of TECHNOLOGY_RAIL_ITEMS) {
      const matchingProjects = PROJECTS.filter((project) =>
        project.technologies.includes(item.technology),
      );
      expect(matchingProjects.length, item.technology).toBeGreaterThan(0);
      expect(item.projectCount).toBe(matchingProjects.length);
    }
  });

  it("adds a vector mark only for an explicitly mapped technology", () => {
    const { container, rerender } = render(<TechnologyChip technology="CUDA" />);
    expect(container.querySelector('[data-technology-mark="CUDA"]')).not.toBeNull();

    rerender(<TechnologyChip technology="Unmapped Tool" fallbackTone="interface" />);
    expect(container.querySelector("[data-technology-mark]")).toBeNull();
    expect(getTechnologyMark("Unmapped Tool")).toBeNull();
  });
});

describe("technology logo rail", () => {
  it("exposes one truthful list and hides the seamless duplicate", () => {
    const { container } = render(
      <MotionPolicyProvider><ScrollMotionProvider>
        <TechLogoRail />
      </ScrollMotionProvider></MotionPolicyProvider>,
    );

    const primary = container.querySelector('[data-technology-loop="primary"]');
    const duplicate = container.querySelector('[data-technology-loop="duplicate"]');
    expect(primary).not.toBeNull();
    expect(duplicate).toHaveAttribute("aria-hidden", "true");
    expect(within(primary as HTMLElement).getAllByRole("listitem")).toHaveLength(
      TECHNOLOGY_RAIL_ITEMS.length,
    );
  });

  it("provides a persistent pause control when motion is available", () => {
    const { container } = render(
      <MotionPolicyProvider><ScrollMotionProvider>
        <TechLogoRail />
      </ScrollMotionProvider></MotionPolicyProvider>,
    );

    const pause = screen.getByRole("button", { name: "Pause technology rail" });
    fireEvent.click(pause);
    expect(pause).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Resume technology rail" })).toBeInTheDocument();
    expect(container.querySelector("[data-running]")).toHaveAttribute("data-running", "false");
  });
});
