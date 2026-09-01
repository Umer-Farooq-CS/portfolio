import { useEffect, useRef } from "react";

/**
 * Weighted, eased scrolling for pointer devices.
 *
 * This replaces an earlier attempt at section snapping on the chapter pages,
 * which could not work: measured on /development, no chapter fits a screen on
 * any device. They run 1.02 to 1.89 viewports on a 1440x900 desktop, 1.28 to
 * 2.38 on a 1280x720 laptop, and 1.64 to 3.87 on a phone. "One gesture, one
 * section" therefore had to choose between skipping content and behaving
 * differently from one gesture to the next, and it chose the latter, which is
 * what made it feel broken. Smoothing every gesture instead is consistent by
 * construction: nothing is ever skipped and nothing ever jumps.
 *
 * How it works: the wheel is intercepted and its delta accumulates into a
 * target offset. A rAF loop eases the real scroll position toward that target,
 * so a flick of the wheel arrives as weight rather than as a step.
 *
 * Pointer devices only. Touch is left completely alone: iOS and Android already
 * have excellent inertia, and intercepting `touchmove` breaks the finger
 * tracking 1:1 with the content, along with fling, pull-to-refresh and
 * address-bar hiding. A phone does not need this and is worse for having it.
 */

/**
 * Exponential smoothing per second. Higher is snappier. Applied against real
 * elapsed time rather than per frame, so a 120Hz display does not arrive twice
 * as fast as a 60Hz one.
 */
const DECAY_PER_SECOND = 11.5;
/** Below this the remaining distance is invisible; settle exactly and stop. */
const SETTLE_PX = 0.4;
/** Guards against a long tab-switch producing one enormous step. */
const MAX_FRAME_SECONDS = 1 / 20;
/**
 * How far the page may sit from where this hook last put it before that counts
 * as somebody else having scrolled.
 *
 * The first version of this used 3px on a single frame and broke ordinary
 * scrolling outright: the page would take one gesture and then refuse to move.
 * Between writing a fractional offset and reading it back a frame later the
 * observed value legitimately differs by more than a hair, so a tight
 * single-frame test reads normal motion as interference. Hence a generous
 * distance *and* two consecutive frames: a real jump (an anchor link, the Home
 * key) is hundreds of pixels and stays diverged, whereas a rounding artefact
 * resolves on the very next frame.
 */
const EXTERNAL_SCROLL_PX = 48;
const EXTERNAL_SCROLL_FRAMES = 2;

export interface SmoothScrollOptions {
  /** False removes the listener entirely. */
  active: boolean;
  /** False leaves scrolling completely native. */
  motionEnabled: boolean;
}

export function useSmoothScroll({ active, motionEnabled }: SmoothScrollOptions) {
  const target = useRef(0);
  const frame = useRef(0);
  const lastTime = useRef(0);
  /** The offset this hook last asked for, to tell our motion from anyone else's. */
  const lastApplied = useRef(0);
  /** Consecutive frames the page has sat somewhere this hook did not put it. */
  const diverged = useRef(0);

  useEffect(() => {
    if (!active || !motionEnabled) return;
    if (typeof window === "undefined") return;
    // Coarse pointer: leave the platform's own inertia alone.
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const maxScroll = () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    /** Wheel deltas arrive in three units depending on the device. */
    const pixelsFor = (event: WheelEvent) => {
      if (event.deltaMode === 1) return event.deltaY * 16; // lines
      if (event.deltaMode === 2) return event.deltaY * window.innerHeight; // pages
      return event.deltaY;
    };

    const stop = () => {
      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = 0;
    };

    /**
     * `behavior: "instant"` is load-bearing, not a detail. `src/index.css` sets
     * `html { scroll-behavior: smooth }`, and under that a plain
     * `window.scrollTo` starts a *smooth* scroll. Calling it once per frame
     * then restarts that animation every frame, so the page never actually
     * advances: measured, a rAF loop stepping 12px at a time produced
     * [0,0,0,0,0,0,0,0]. Naming the behaviour overrides the stylesheet for this
     * call only, and leaves the CSS in place for anchor links.
     */
    const jumpTo = (top: number) => window.scrollTo({ top, behavior: "instant" });

    const step = (now: number) => {
      const elapsed = Math.min((now - lastTime.current) / 1000, MAX_FRAME_SECONDS);
      lastTime.current = now;

      const current = window.scrollY;

      // Something else moved the page mid-flight: an anchor link, the Home key,
      // a scrollbar drag, a route change. Yield to it rather than dragging the
      // reader back to a target they have abandoned. Without this the stale
      // target survives and the *next* gesture accumulates on top of it, which
      // showed up as four wheel notches travelling five notches' distance.
      if (Math.abs(current - lastApplied.current) > EXTERNAL_SCROLL_PX) {
        diverged.current += 1;
        if (diverged.current >= EXTERNAL_SCROLL_FRAMES) {
          target.current = current;
          stop();
          return;
        }
        // Skip this frame's write. Writing would move the page back under the
        // divergence and erase the very evidence the next frame needs, which is
        // why an earlier version never confirmed a jump: it kept overwriting
        // reality and resetting its own counter.
        frame.current = requestAnimationFrame(step);
        return;
      }
      diverged.current = 0;

      const remaining = target.current - current;

      if (Math.abs(remaining) < SETTLE_PX) {
        jumpTo(target.current);
        lastApplied.current = target.current;
        stop();
        return;
      }

      // Frame-rate independent exponential approach.
      const next = current + remaining * (1 - Math.exp(-DECAY_PER_SECOND * elapsed));
      jumpTo(next);
      // Compare against what we asked for, not what we read back: the browser
      // snaps to device pixels, so reading scrollY here would drift.
      lastApplied.current = next;
      frame.current = requestAnimationFrame(step);
    };

    const onWheel = (event: WheelEvent) => {
      // Pinch-zoom and horizontal gestures are not ours.
      if (event.ctrlKey) return;
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

      const limit = maxScroll();
      if (limit <= 0) return;

      // Resync between gestures, so a scrollbar drag, an anchor jump, a key
      // press or a route change is picked up without a scroll listener (which
      // AGENTS.md bans). Mid-animation the target is ours and must be kept.
      if (!frame.current) target.current = window.scrollY;

      const next = target.current + pixelsFor(event);
      const clamped = Math.max(0, Math.min(limit, next));

      // At either end there is nothing to smooth, so let the browser have the
      // event: that preserves overscroll affordances and scroll chaining.
      if (clamped === target.current) return;

      event.preventDefault();
      target.current = clamped;

      if (!frame.current) {
        lastTime.current = performance.now();
        lastApplied.current = window.scrollY;
        diverged.current = 0;
        frame.current = requestAnimationFrame(step);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      stop();
    };
  }, [active, motionEnabled]);
}
