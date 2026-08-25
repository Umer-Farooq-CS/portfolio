import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemeChoice = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "uf-theme";

const THEME_COLORS: Record<ResolvedTheme, string> = {
  light: "#e9eaec",
  dark: "#08090b",
};

interface ThemeContextValue {
  /** What the visitor picked, including "system". */
  choice: ThemeChoice;
  /** What is actually on screen right now. */
  resolved: ResolvedTheme;
  setChoice: (choice: ThemeChoice) => void;
  /** Flips to the opposite of what's on screen, as an explicit choice. */
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * A first-time visitor follows their browser/OS theme preference by default —
 * once someone explicitly picks light or dark, that choice is stored and takes
 * over completely, exactly as before.
 */
function readStoredChoice(): ThemeChoice {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
  } catch {
    // Private mode or blocked storage — fall through to the default.
  }
  return "system";
}

function systemTheme(): ResolvedTheme {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolve(choice: ThemeChoice): ResolvedTheme {
  return choice === "system" ? systemTheme() : choice;
}

function applyResolvedTheme(next: ResolvedTheme): void {
  const root = document.documentElement;
  root.classList.toggle("dark", next === "dark");
  root.dataset.theme = next;
  root.style.colorScheme = next;
  document
    .querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    ?.setAttribute("content", THEME_COLORS[next]);

  const favicon = document.querySelector<HTMLLinkElement>("link[data-theme-favicon]");
  const faviconFile =
    next === "dark" ? favicon?.dataset.darkFavicon : favicon?.dataset.lightFavicon;
  const faviconHref = favicon?.getAttribute("href");
  if (favicon && faviconFile && faviconHref) {
    // Replace only the filename, preserving Vite's /portfolio/ base prefix.
    favicon.setAttribute("href", faviconHref.replace(/[^/]+$/, faviconFile));
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [choice, setChoiceState] = useState<ThemeChoice>(readStoredChoice);
  const [resolved, setResolved] = useState<ResolvedTheme>(() => resolve(readStoredChoice()));

  // Keep the document in sync with the resolved theme.
  useEffect(() => {
    const next = resolve(choice);
    setResolved(next);
    applyResolvedTheme(next);
  }, [choice]);

  // Follow the OS while the choice is "system".
  useEffect(() => {
    if (choice !== "system" || !window.matchMedia) return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const next = systemTheme();
      setResolved(next);
      applyResolvedTheme(next);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [choice]);

  const setChoice = useCallback((next: ThemeChoice) => {
    setChoiceState(next);
    try {
      if (next === "system") localStorage.removeItem(THEME_STORAGE_KEY);
      else localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage unavailable — the choice still applies for this session.
    }
  }, []);

  const toggle = useCallback(() => {
    setChoice(resolve(readStoredChoice()) === "dark" ? "light" : "dark");
  }, [setChoice]);

  const value = useMemo(
    () => ({ choice, resolved, setChoice, toggle }),
    [choice, resolved, setChoice, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside <ThemeProvider>");
  return context;
}
