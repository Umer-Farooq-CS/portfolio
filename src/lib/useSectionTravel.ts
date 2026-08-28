import { useEffect, useRef } from "react";

/**
 * Turns one scroll gesture into one eased travel to the next stop.
 *
 * Why this is scripted rather than CSS. `scroll-snap-type: y mandatory` looks
 * like the answer and is wrong twice over: a `position: sticky` element used as
 * a snap target re-snaps to its own moving box every frame and pins the scroll
 * outright, and snap resolves to the *nearest* position, so a mouse wheel notch
 * (about 120px, against a viewport of travel) gets returned to where it
 * started. Snap also has no duration or easing of its own, which is what made
 * an earlier version of this feel rigid.
 *
 * `reachableOnly` is what makes this safe on long pages. With it set, a gesture
 * is only taken over when the destination is already within a viewport, so a
 * chapter taller than the screen scrolls normally until its successor comes
 * into view, and only then does one gesture complete the transition. Nothing is
 * ever skipped and the reader is never trapped. The landing page turns it off,
 * because there both stops are exactly one screen apart by construction.
 *
 * Scroll hijacking earns its bad reputation when it is not narrow, so:
 *   - only the events actually consumed are preventDefaulted
 *   - reduced motion gets the same destination with no travel
 *   - keyboard paging is untouched; those keys have defined scroll semantics
 *   - `active: false` removes every listener rather than merely ignoring them
 */

/** Slow in, slow out. The travel should read as a camera move, not a cut. */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

const TRAVEL_MS = 1000;
/** Past the tween, long enough to swallow the tail of one trackpad gesture. */
const SETTLE_MS = 240;
/** Ignore sub-pixel drift when deciding which stop we are standing on. */
const TOLERANCE = 8;

export interface SectionTravelOptions {
  /**
   * Scroll offsets to travel between, ascending. Read fresh on every gesture,
   * so lazily mounted content and resizes are picked up without a listener.
   */
  stops: () => number[];
  /** False removes the listeners entirely. */
  active: boolean;
  /** False still travels, instantly, so the behaviour matches for everyone. */
  motionEnabled: boolean;
  /** Only take over when the destination is already within one viewport. */
  reachableOnly?: boolean;
}

export function useSectionTravel({
  stops,
  active,
  motionEnabled,
  reachableOnly = false,
}: SectionTravelOptions) {
  const lockedUntil = useRef(0);
  const frame = useRef(0);
  // Kept in a ref so a changing closure does not re-bind the listeners.
  const stopsRef = useRef(stops);
  stopsRef.current = stops;

  useEffect(() => {
    if (!active) return;
    const root = document.documentElement;

    const travelTo = (to: number) => {
      const from = window.scrollY;
      const distance = to - from;

      if (!motionEnabled || Math.abs(distance) < 2) {
        window.scrollTo(0, to);
        lockedUntil.current = Date.now() + 80;
        return;
      }

      // The global `scroll-behavior: smooth` would re-smooth every frame of the
      // tween below and turn it into mush.
      root.style.scrollBehavior = "auto";
      const startedAt = performance.now();
      lockedUntil.current = Date.now() + TRAVEL_MS + SETTLE_MS;

      const step = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / TRAVEL_MS);
        window.scrollTo(0, from + distance * easeInOutCubic(progress));
        if (progress < 1) {
          frame.current = requestAnimationFrame(step);
        } else {
          frame.current = 0;
          root.style.scrollBehavior = "";
        }
      };
      frame.current = requestAnimationFrame(step);
    };

    /** The destination for a gesture, or null to leave the page alone. */
    const destinationFor = (direction: number): number | null => {
      const list = stopsRef
        .current()
        .filter((n) => Number.isFinite(n))
        .sort((a, b) => a - b);
      if (list.length < 2) return null;

      const y = window.scrollY;
      const reach = window.innerHeight + TOLERANCE;

      if (direction > 0) {
        const next = list.find((s) => s > y + TOLERANCE);
        if (next === undefined) return null;
        if (reachableOnly && next > y + reach) return null;
        return next;
      }

      const previous = [...list].reverse().find((s) => s < y - TOLERANCE);
      if (previous === undefined) return null;
      if (reachableOnly && previous < y - reach) return null;
      return previous;
    };

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return; // pinch zoom, not a scroll
      if (Date.now() < lockedUntil.current) {
        event.preventDefault();
        return;
      }
      const to = destinationFor(event.deltaY);
      if (to === null) return;
      event.preventDefault();
      travelTo(to);
    };

    let touchStartY = 0;
    const onTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0]?.clientY ?? 0;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (Date.now() < lockedUntil.current) {
        event.preventDefault();
        return;
      }
      const y = event.touches[0]?.clientY ?? 0;
      const dragged = touchStartY - y; // positive when swiping up, i.e. scrolling down
      if (Math.abs(dragged) < 12) return;
      const to = destinationFor(dragged);
      if (to === null) return;
      event.preventDefault();
      travelTo(to);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = 0;
      root.style.scrollBehavior = "";
      lockedUntil.current = 0;
    };
  }, [active, motionEnabled, reachableOnly]);
}

/** Offsets of the given element ids that are actually in the document. */
export function offsetsForIds(ids: string[]): number[] {
  const offsets: number[] = [];
  for (const id of ids) {
    const element = document.getElementById(id);
    if (element) offsets.push(element.getBoundingClientRect().top + window.scrollY);
  }
  return offsets;
}
