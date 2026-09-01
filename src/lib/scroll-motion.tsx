import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * Whether scrolling is weighted and eased, or left entirely to the browser.
 *
 * This is a visitor preference, not a design decision, which is why it gets a
 * control in the top bar beside the theme. Eased scrolling reads as expensive
 * on a first pass and as latency on a second, and neither answer is right for
 * everyone.
 *
 * Scope: every route except the selector, and pointer devices only. The
 * selector drives its own three-stop travel, and touch is always left native
 * (see useSmoothScroll for why). `prefers-reduced-motion` still wins over the
 * preference in both cases.
 */

const STORAGE_KEY = "uf-scroll-motion";

interface ScrollMotionValue {
  /** True when scrolling should be weighted and eased rather than native. */
  smooth: boolean;
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
  const [smooth, setSmooth] = useState(readStored);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, smooth ? "on" : "off");
    } catch {
      // Not being able to remember the choice is not a reason to break it.
    }
  }, [smooth]);

  const toggle = useCallback(() => setSmooth((value) => !value), []);
  const value = useMemo(() => ({ smooth, toggle }), [smooth, toggle]);

  return <ScrollMotionContext.Provider value={value}>{children}</ScrollMotionContext.Provider>;
}

export function useScrollMotion(): ScrollMotionValue {
  const context = useContext(ScrollMotionContext);
  if (!context) throw new Error("useScrollMotion must be used inside <ScrollMotionProvider>");
  return context;
}
