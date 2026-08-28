import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * Whether the chapter pages scroll section by section, or plainly.
 *
 * This is a visitor preference, not a design decision, which is why it gets a
 * control in the top bar beside the theme. Guided scrolling suits a first read
 * and gets in the way of a second one, and neither answer is right for
 * everyone.
 *
 * Scope: chapter pages only. The landing page always travels, because there the
 * two screens *are* the page and plain scrolling would leave the reader parked
 * between them. `prefers-reduced-motion` still wins over both: the travel then
 * happens instantly rather than being animated (see useSectionTravel).
 */

const STORAGE_KEY = "uf-scroll-motion";

interface ScrollMotionValue {
  /** True when chapter pages should travel section to section. */
  guided: boolean;
  toggle: () => void;
}

const ScrollMotionContext = createContext<ScrollMotionValue | null>(null);

function readStored(): boolean {
  if (typeof window === "undefined") return true;
  try {
    // Absent means "not yet chosen", and the default is on.
    return window.localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    // Private mode, or storage disabled. The default still applies.
    return true;
  }
}

export function ScrollMotionProvider({ children }: { children: ReactNode }) {
  const [guided, setGuided] = useState(readStored);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, guided ? "on" : "off");
    } catch {
      // Not being able to remember the choice is not a reason to break it.
    }
  }, [guided]);

  const toggle = useCallback(() => setGuided((value) => !value), []);
  const value = useMemo(() => ({ guided, toggle }), [guided, toggle]);

  return <ScrollMotionContext.Provider value={value}>{children}</ScrollMotionContext.Provider>;
}

export function useScrollMotion(): ScrollMotionValue {
  const context = useContext(ScrollMotionContext);
  if (!context) throw new Error("useScrollMotion must be used inside <ScrollMotionProvider>");
  return context;
}
