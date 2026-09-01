import { useEffect, useRef } from "react";

/**
 * Turns one wheel gesture into one eased travel to the next stop.
 *
 * Used only by the landing page, which genuinely is three screens: the hero,
 * the choice, and the foot. Everywhere else the sections are 1 to 4 viewports
 * tall and any form of snapping would either skip content or behave differently
 * from one gesture to the next, so those routes get weighted scrolling instead
 * (see useSmoothScroll).
 *
 * Why this is scripted rather than CSS. `scroll-snap-type: y mandatory` looks
 * like the answer and is wrong for a pointer: a `position: sticky` element used
 * as a snap target re-snaps to its own moving box every frame and pins the
 * scroll outright, and snap resolves to the *nearest* position, so a wheel
 * notch of ~120px against a viewport of travel gets returned to where it
 * started. Snap also has no duration or easing of its own.
 *
 * Touch is deliberately not handled here. A fling covers the distance between
 * two stops on its own, so CSS scroll-snap resolves it correctly, and it does
 * so while the content still tracks the finger 1:1. Intercepting `touchmove`
 * instead breaks that tracking, along with fling and pull-to-refresh. The
 * coarse-pointer snap rules live in index.css under `html.landing-snap`.
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
  /** False removes the listener entirely. */
  active: boolean;
  /** False still travels, instantly, so the behaviour matches for everyone. */
  motionEnabled: boolean;
}

export function useSectionTravel({ stops, active, motionEnabled }: SectionTravelOptions) {
  const lockedUntil = useRef(0);
  const frame = useRef(0);
  // Kept in a ref so a changing closure does not re-bind the listener.
  const stopsRef = useRef(stops);
  stopsRef.current = stops;

  useEffect(() => {
    if (!active) return;
    if (typeof window === "undefined") return;
    // Touch is served by CSS snap; two mechanisms on one gesture would fight.
    if (window.matchMedia("(pointer: coarse)").matches) return;

    /**
     * `behavior: "instant"` overrides `html { scroll-behavior: smooth }` from
     * index.css for this call only. Without it every frame of the tween below
     * restarts a browser-smooth scroll and the page never advances.
     */
    const jumpTo = (top: number) => window.scrollTo({ top, behavior: "instant" });

    const travelTo = (to: number) => {
      const from = window.scrollY;
      const distance = to - from;

      if (!motionEnabled || Math.abs(distance) < 2) {
        jumpTo(to);
        lockedUntil.current = Date.now() + 80;
        return;
      }

      const startedAt = performance.now();
      lockedUntil.current = Date.now() + TRAVEL_MS + SETTLE_MS;

      const step = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / TRAVEL_MS);
        jumpTo(from + distance * easeInOutCubic(progress));
        if (progress < 1) {
          frame.current = requestAnimationFrame(step);
        } else {
          frame.current = 0;
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
      if (direction > 0) return list.find((s) => s > y + TOLERANCE) ?? null;
      return [...list].reverse().find((s) => s < y - TOLERANCE) ?? null;
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

    window.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", onWheel);
      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = 0;
      lockedUntil.current = 0;
    };
  }, [active, motionEnabled]);
}
