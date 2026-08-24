import { motion, useScroll, useSpring } from "motion/react";
import { useMotionPolicy } from "@/lib/motion-policy";

/**
 * Scroll position as a hairline across the top. It replaces the rail's job on
 * screens too narrow for the rail, and it is the only always-on motion on the page.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const { enabled, spring } = useMotionPolicy();
  const scaleX = useSpring(scrollYProgress, enabled ? spring.soft : { duration: 0 });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX: enabled ? scaleX : scrollYProgress }}
      className="fixed left-0 top-0 z-50 h-0.5 w-full origin-left bg-thermal"
    />
  );
}
