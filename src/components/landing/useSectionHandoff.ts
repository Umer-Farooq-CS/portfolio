import { useEffect, useRef } from "react";

/**
 * The landing page's one scripted move: the first scroll gesture carries the
 * reader from the hero to the choice, as a single animated travel rather than
 * a jump.
 *
 * Why not CSS. `scroll-snap-type: y mandatory` was tried first and is wrong
 * here twice over. A sticky element used as a snap target re-snaps to its own
 * moving box every frame, which pins the scroll outright. And once that was
 * fixed with a static anchor, snap still resolves to the *nearest* position, so
 * a mouse wheel notch (about 120px, against a viewport of travel) gets returned
 * to where it started. Snap also has no duration or easing of its own, which is
 * what made the first version feel rigid.
 *
 * So the travel is animated here, on rAF, with an ease that starts and ends
 * slowly. `scroll-behavior: smooth` is suspended for the duration, because the
 * global rule would otherwise smooth each individual frame of the tween and
 * fight it.
 *
 * Deliberately narrow, because scroll hijacking earns its bad reputation when
 * it is not:
 *   - It only acts across the hero/choice boundary, in both directions. Past
 *     the choice the page scrolls normally, so the footer is never held.
 *   - It only preventDefaults the events it actually consumes.
 *   - Reduced motion gets the same destination with no travel.
 *   - Keyboard paging is untouched: those keys have defined scroll semantics
 *     and a reader using them has asked for exactly what they do.
 */

/** Slow in, slow out. The travel should read as a camera move, not a cut. */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

const TRAVEL_MS = 1150;
/** Past the tween, long enough to swallow the tail of one trackpad gesture. */
const SETTLE_MS = 260;

export function useSectionHandoff(targetId: string, motionEnabled: boolean) {
  const lockedUntil = useRef(0);
  const frame = useRef(0);

  useEffect(() => {
    const root = document.documentElement;

    const cancel = () => {
      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = 0;
      root.style.scrollBehavior = "";
    };

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
      const target = document.getElementById(targetId);
      if (!target) return null;
      const boundary = target.offsetTop;
      const y = window.scrollY;
      const slack = 4;

      if (direction > 0 && y < boundary - slack) return boundary;
      if (direction < 0 && y > slack && y <= boundary + slack) return 0;
      return null;
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
      cancel();
    };
  }, [targetId, motionEnabled]);
}
