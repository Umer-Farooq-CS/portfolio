import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useInView } from "motion/react";
import { useMotionPolicy } from "@/lib/motion-policy";

/**
 * A readout that settles into its value.
 *
 * The site's whole premise is measurement, and an instrument does not print its
 * reading fully formed — it converges on it. So a `Metric` counts up once, the
 * first time it is scrolled into view, and then stays put. It is a short settle,
 * not a scoreboard: one pass, ~0.56s, ease-out, no stagger and no loop.
 *
 * Two rules keep it safe to drop into every metric on the site:
 *
 * 1. The value at rest is the *only* thing this hook is willing to render. It
 *    reports `running: null` unless a count is actually in flight, and `Metric`
 *    then prints the untouched `value` string. Nothing renders a start value:
 *    if the count never begins (reduced motion, no leading number, no
 *    `requestAnimationFrame`, never scrolled into view) the readout is simply
 *    correct from the first paint.
 * 2. Only the *leading number* moves. The prefix (`~`), the suffix (`%`, `×`,
 *    ` min`, ` × 4`) and any decimal places are re-emitted verbatim, so the
 *    final frame is byte-identical to the value that was passed in.
 */

/** A value split into the parts a readout can animate. */
export interface CountUpParts {
  /** A leading symbol such as `~`, kept exactly as written. */
  prefix: string;
  /** The numeric portion, as authored (so `50` and `50.0` stay distinct). */
  number: string;
  /** Everything after the number: `%`, `×`, ` min`, ` tasks`, ` × 4`, `rd`. */
  suffix: string;
  /** Decimal places to preserve while counting. */
  decimals: number;
  /** Target of the count. */
  target: number;
}

/** Approximation and comparison marks that may sit in front of the number. */
const LEADING = /^([~<>≈±+-]?)(\d+(?:\.\d+)?)(.*)$/;

/**
 * Splits `"~93%"` into `~` / `93` / `%`. Returns null when the value has no
 * leading number at all (`"Monthly"`) — that value is never animated.
 */
export function parseCountUp(value: string): CountUpParts | null {
  const match = LEADING.exec(value);
  if (!match) return null;
  const [, prefix, number, suffix] = match;
  // `1,200` or `3.5.1`: the digits we matched are only part of a larger
  // literal, and counting them would misread the value. Leave it alone.
  if (/^[,.]\d/.test(suffix)) return null;
  const dot = number.indexOf(".");
  return {
    prefix,
    number,
    suffix,
    decimals: dot === -1 ? 0 : number.length - dot - 1,
    target: Number(number),
  };
}

/** The frame currently on screen. Present only while the count is running. */
export interface CountUpFrame {
  prefix: string;
  digits: string;
  suffix: string;
  /**
   * Width to hold open for the digits, in `ch`. See the note in `Metric`: the
   * readout is monospaced and tabular, so a character advances by at most
   * `1ch`, and a reservation of `number.length` can never be overflowed by an
   * intermediate frame of a count that only ever goes up.
   */
  width: string;
}

export interface CountUp {
  /** Attach to the element whose arrival on screen starts the count. */
  ref: RefObject<HTMLDivElement>;
  /** Non-null only while a count is actively running. */
  running: CountUpFrame | null;
}

/** Short enough to read as a settle rather than a tally. */
const DURATION_MS = 560;

/** Ease-out cubic: most of the travel up front, then it lands softly. */
const easeOut = (t: number) => 1 - (1 - t) ** 3;

export function useCountUp(value: string): CountUp {
  const ref = useRef<HTMLDivElement>(null);
  // Motion's viewport hook, not a scroll listener: the project bans
  // `window.addEventListener("scroll", …)`. `once` means it never replays.
  const inView = useInView(ref, { once: true });
  const { enabled } = useMotionPolicy();
  const parts = useMemo(() => parseCountUp(value), [value]);
  const [digits, setDigits] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !inView || !parts) return;
    // Counting 0 → 0 is not an animation, and neither is a value with no
    // distance to travel.
    if (!(parts.target > 0)) return;
    if (typeof requestAnimationFrame !== "function") return;

    let frame = 0;
    // Explicitly null rather than 0: a frame clock is allowed to hand out a
    // timestamp of 0, and treating that as "not started yet" would restart the
    // count on the following frame.
    let origin: number | null = null;
    const tick = (now: number) => {
      if (origin === null) origin = now;
      const progress = Math.min(1, (now - origin) / DURATION_MS);
      if (progress >= 1) {
        // Hand the last frame back to `value` itself rather than re-formatting
        // it, so the settled text is the author's string, character for
        // character.
        setDigits(null);
        return;
      }
      setDigits((parts.target * easeOut(progress)).toFixed(parts.decimals));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      setDigits(null);
    };
  }, [enabled, inView, parts]);

  const running = useMemo<CountUpFrame | null>(
    () =>
      digits === null || parts === null
        ? null
        : {
            prefix: parts.prefix,
            digits,
            suffix: parts.suffix,
            width: `${parts.number.length}ch`,
          },
    [digits, parts],
  );

  return { ref, running };
}
