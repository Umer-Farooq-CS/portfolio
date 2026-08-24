import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import UFMark from "@/components/brand/UFMark";
import { MotionPolicyProvider } from "@/lib/motion-policy";
import { THEME_STORAGE_KEY, ThemeProvider } from "@/lib/theme";

function renderMark(label?: string) {
  return render(
    <ThemeProvider>
      <MotionPolicyProvider>
        <UFMark label={label} />
      </MotionPolicyProvider>
    </ThemeProvider>,
  );
}

describe("UF brand mark", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.className = "";
    document.documentElement.removeAttribute("data-theme");
  });

  it("uses the light master and stays decorative beside visible brand text", () => {
    const { container } = renderMark();
    const image = container.querySelector("img");

    expect(image).toHaveAttribute("aria-hidden", "true");
    expect(image).toHaveAttribute("alt", "");
    expect(image).toHaveAttribute("data-theme-asset", "light");
    expect(image?.getAttribute("src")).toContain("uf-logo-light.svg");
    expect(image).toHaveAttribute("width", "48");
    expect(image).toHaveAttribute("height", "24");
  });

  it("can name a standalone mark without duplicating visible text", () => {
    renderMark("Umer Farooq");
    const image = screen.getByRole("img", { name: "Umer Farooq" });

    expect(image).not.toHaveAttribute("aria-hidden");
    expect(image).toHaveAttribute("alt", "Umer Farooq");
  });

  it("selects the explicit dark artwork when dark mode is resolved", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
    const { container } = renderMark();
    const image = container.querySelector("img");

    expect(image).toHaveAttribute("data-theme-asset", "dark");
    expect(image?.getAttribute("src")).toContain("uf-logo-dark.svg");
  });
});
