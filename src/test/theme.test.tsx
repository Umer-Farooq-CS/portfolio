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

function addThemeFavicon() {
  const favicon = document.createElement("link");
  favicon.rel = "icon";
  favicon.type = "image/svg+xml";
  favicon.href = "/portfolio/favicon-light-v3.svg";
  favicon.dataset.themeFavicon = "";
  favicon.dataset.lightFavicon = "favicon-light-v3.svg";
  favicon.dataset.darkFavicon = "favicon-dark-v3.svg";
  document.head.append(favicon);
  return favicon;
}

describe("theme provider", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
    delete document.documentElement.dataset.theme;
    document.querySelectorAll("link[data-theme-favicon]").forEach((link) => link.remove());
  });

  it("follows the OS by default when nothing is stored", () => {
    // No stored preference yet — the visitor should see their own OS/browser
    // preference, not a hardcoded default.
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

    expect(screen.getByTestId("choice")).toHaveTextContent("system");
    expect(screen.getByTestId("resolved")).toHaveTextContent("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);

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

  it("keeps browser chrome and the base-safe favicon in sync with the resolved theme", async () => {
    const themeColor = document.createElement("meta");
    themeColor.name = "theme-color";
    document.head.append(themeColor);
    const favicon = addThemeFavicon();

    try {
      const user = userEvent.setup();
      render(
        <ThemeProvider>
          <ThemeProbe />
        </ThemeProvider>,
      );

      expect(themeColor.content).toBe("#e9eaec");
      expect(favicon.getAttribute("href")).toBe("/portfolio/favicon-light-v3.svg");
      await user.click(screen.getByRole("button", { name: "toggle" }));
      expect(themeColor.content).toBe("#08090b");
      expect(favicon.getAttribute("href")).toBe("/portfolio/favicon-dark-v3.svg");
    } finally {
      themeColor.remove();
      favicon.remove();
    }
  });

  it("updates the favicon when a system theme preference changes", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "system");
    let dark = true;
    let notifyPreferenceChange: (() => void) | undefined;
    const matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("dark") && dark,
      media: query,
      addEventListener: (_type: string, listener: () => void) => {
        notifyPreferenceChange = listener;
      },
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    }));
    vi.stubGlobal("matchMedia", matchMedia);
    const favicon = addThemeFavicon();

    try {
      render(
        <ThemeProvider>
          <ThemeProbe />
        </ThemeProvider>,
      );

      expect(favicon.getAttribute("href")).toBe("/portfolio/favicon-dark-v3.svg");
      dark = false;
      act(() => notifyPreferenceChange?.());
      expect(favicon.getAttribute("href")).toBe("/portfolio/favicon-light-v3.svg");
    } finally {
      favicon.remove();
      vi.unstubAllGlobals();
    }
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
      expect(screen.getByTestId("choice")).toHaveTextContent("system");
    } finally {
      Storage.prototype.getItem = original;
    }
  });
});
