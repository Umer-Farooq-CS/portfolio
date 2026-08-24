import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { THEME_STORAGE_KEY, ThemeProvider, useTheme } from "@/lib/theme";

function ThemeProbe() {
  const { choice, resolved, toggle } = useTheme();
  return (
    <div>
      <span data-testid="choice">{choice}</span>
      <span data-testid="resolved">{resolved}</span>
      <button type="button" onClick={toggle}>
        toggle
      </button>
    </div>
  );
}

describe("theme provider", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
    delete document.documentElement.dataset.theme;
  });

  it("opens in light when nothing is stored, whatever the OS says", () => {
    // A dark OS must not override the design's default — the site was built
    // light-first, and a visitor should see it as designed until they choose.
    const matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("dark"), // pretend the OS is in dark mode
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    }));
    vi.stubGlobal("matchMedia", matchMedia);

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("choice")).toHaveTextContent("light");
    expect(screen.getByTestId("resolved")).toHaveTextContent("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    vi.unstubAllGlobals();
  });

  it("follows the OS only when the visitor opts into it", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "system");
    const matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("dark"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    }));
    vi.stubGlobal("matchMedia", matchMedia);

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("resolved")).toHaveTextContent("dark");
    vi.unstubAllGlobals();
  });

  it("persists an explicit choice and applies it to the document", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    await user.click(screen.getByRole("button", { name: "toggle" }));

    expect(screen.getByTestId("resolved")).toHaveTextContent("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("restores a stored choice on mount, so it survives a reload", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "dark");
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("choice")).toHaveTextContent("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("survives storage being unavailable", () => {
    const original = Storage.prototype.getItem;
    Storage.prototype.getItem = () => {
      throw new Error("storage blocked");
    };
    try {
      act(() => {
        render(
          <ThemeProvider>
            <ThemeProbe />
          </ThemeProvider>,
        );
      });
      // Falls back to the design's default rather than throwing.
      expect(screen.getByTestId("choice")).toHaveTextContent("light");
    } finally {
      Storage.prototype.getItem = original;
    }
  });
});
