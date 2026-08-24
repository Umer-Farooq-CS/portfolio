import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";

/**
 * One place that decides whether motion runs, so `prefers-reduced-motion` is
 * honoured everywhere instead of being re-checked (or forgotten) per component.
 *
 * Usage: `const { enabled, duration, rise } = useMotionPolicy()` and spread
 * `rise(0.1)` into a motion component's animation props.
 */

export interface MotionPolicy {
  /** False when the visitor asked for reduced motion. */
  enabled: boolean;
  /** Scales any duration: 0 when motion is off. */
  duration: (seconds: number) => number;
  /** Standard entry animation — a small rise, or a plain fade when reduced. */
  rise: (delay?: number, distance?: number) => {
    initial: { opacity: number; y?: number };
    animate: { opacity: number; y?: number };
    transition: { duration: number; delay: number; ease: [number, number, number, number] };
  };
  /** Spring presets for interaction. */
  spring: {
    snappy: { type: "spring"; stiffness: number; damping: number };
    soft: { type: "spring"; stiffness: number; damping: number };
    heavy: { type: "spring"; stiffness: number; damping: number };
  };
}

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

const MotionPolicyContext = createContext<MotionPolicy | null>(null);

export function MotionPolicyProvider({ children }: { children: ReactNode }) {
  const prefersReduced = useReducedMotion();
  const enabled = !prefersReduced;

  const value = useMemo<MotionPolicy>(() => {
    const duration = (seconds: number) => (enabled ? seconds : 0);
    return {
      enabled,
      duration,
      rise: (delay = 0, distance = 20) => ({
        initial: enabled ? { opacity: 0, y: distance } : { opacity: 0 },
        animate: enabled ? { opacity: 1, y: 0 } : { opacity: 1 },
        transition: { duration: duration(0.5), delay: enabled ? delay : 0, ease: EASE_OUT },
      }),
      spring: {
        snappy: { type: "spring", stiffness: 500, damping: 32 },
        soft: { type: "spring", stiffness: 220, damping: 26 },
        heavy: { type: "spring", stiffness: 140, damping: 30 },
      },
    };
  }, [enabled]);

  return <MotionPolicyContext.Provider value={value}>{children}</MotionPolicyContext.Provider>;
}

export function useMotionPolicy(): MotionPolicy {
  const context = useContext(MotionPolicyContext);
  if (!context) throw new Error("useMotionPolicy must be used inside <MotionPolicyProvider>");
  return context;
}
